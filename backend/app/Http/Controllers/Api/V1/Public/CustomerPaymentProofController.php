<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentProof;
use App\Modules\Payment\Application\Actions\SubmitPaymentProofAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CustomerPaymentProofController extends Controller
{
    public function __construct(
        private readonly SubmitPaymentProofAction $submitProofAction
    ) {}

    /**
     * Submit an offline / manual payment proof for a reservation.
     */
    public function submit(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)
            ->with(['customer', 'bookable'])
            ->first();

        if (! $booking) {
            abort(404, 'Reservation not found.');
        }

        $this->authorizeCustomerAccess($request, $booking);

        $validated = $request->validate([
            'amount_cents' => 'required|integer|min:1',
            'payment_method_code' => 'required|string|max:50',
            'receipt' => 'required|file|max:5120|mimes:jpeg,jpg,png,webp,pdf',
            'reference_number' => 'nullable|string|max:100',
            'sender_name' => 'nullable|string|max:150',
            'sender_account' => 'nullable|string|max:100',
            'transfer_date' => 'nullable|date',
            'customer_notes' => 'nullable|string|max:500',
        ]);

        try {
            $proof = $this->submitProofAction->execute(
                booking: $booking,
                amountCents: (int) $validated['amount_cents'],
                paymentMethodCode: (string) $validated['payment_method_code'],
                receiptFile: $request->file('receipt'),
                referenceNumber: $validated['reference_number'] ?? null,
                senderName: $validated['sender_name'] ?? null,
                senderAccount: $validated['sender_account'] ?? null,
                customerNotes: $validated['customer_notes'] ?? null,
                transferDate: $validated['transfer_date'] ?? null,
                ipAddress: $request->ip(),
                userAgent: $request->userAgent(),
                customerId: $booking->customer_id
            );

            return response()->json([
                'success' => true,
                'message' => 'تم استلام بيانات التحويل بنجاح — الدفع قيد المراجعة والتدقيق المالي ولم يتم تأكيده بعد.',
                'message_en' => 'Transfer proof submitted successfully. Payment is pending manual financial verification.',
                'data' => [
                    'id' => $proof->id,
                    'booking_reference' => $booking->reference,
                    'status' => $proof->status,
                    'amount_cents' => $proof->amount_cents,
                    'currency' => $proof->currency,
                    'payment_method_code' => $proof->payment_method_code,
                    'reference_number' => $proof->reference_number,
                    'transfer_date' => $proof->transfer_date?->toDateString(),
                    'created_at' => $proof->created_at->toIso8601String(),
                ],
            ], 201);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Retrieve current payment proof status for a booking.
     */
    public function show(Request $request, string $reference): JsonResponse
    {
        $booking = Booking::where('reference', $reference)
            ->with(['paymentProofs' => fn ($q) => $q->latest()])
            ->first();

        if (! $booking) {
            abort(404, 'Reservation not found.');
        }

        $this->authorizeCustomerAccess($request, $booking);

        $proofs = $booking->paymentProofs->map(fn (PaymentProof $p) => [
            'id' => $p->id,
            'status' => $p->status,
            'amount_cents' => $p->amount_cents,
            'currency' => $p->currency,
            'payment_method_code' => $p->payment_method_code,
            'reference_number' => $p->reference_number,
            'sender_name' => $p->sender_name,
            'sender_account' => $p->sender_account,
            'transfer_date' => $p->transfer_date?->toDateString(),
            'rejection_reason' => $p->rejection_reason,
            'reviewed_at' => $p->reviewed_at?->toIso8601String(),
            'created_at' => $p->created_at->toIso8601String(),
        ]);

        return response()->json([
            'booking_reference' => $booking->reference,
            'booking_status' => $booking->status,
            'payment_status' => $booking->payment_status,
            'proofs' => $proofs,
        ]);
    }

    /**
     * Download or view private receipt file with strict authorization.
     */
    public function downloadReceipt(Request $request, string $reference, int $proofId)
    {
        $booking = Booking::where('reference', $reference)->first();
        if (! $booking) {
            abort(404, 'Reservation not found.');
        }

        $this->authorizeCustomerAccess($request, $booking);

        $proof = PaymentProof::where('id', $proofId)
            ->where('booking_id', $booking->id)
            ->firstOrFail();

        if (! Storage::disk('receipts')->exists($proof->receipt_path)) {
            abort(404, 'Receipt file not found on secure storage.');
        }

        return Storage::disk('receipts')->response(
            $proof->receipt_path,
            $proof->receipt_original_name ?: 'receipt.jpg',
            [
                'Cache-Control' => 'private, no-cache, no-store, must-revalidate',
                'X-Content-Type-Options' => 'nosniff',
            ]
        );
    }

    /**
     * Multi-tier customer authorization check with IDOR defense.
     */
    private function authorizeCustomerAccess(Request $request, Booking $booking): void
    {
        $user = $request->user('sanctum') ?? auth()->user();

        if ($user) {
            if ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('property_manager') || $user->hasRole('finance')) {
                return;
            }

            if ($booking->customer && (
                $booking->customer->user_id === $user->id ||
                Str::lower((string) $booking->customer->email) === Str::lower((string) $user->email)
            )) {
                return;
            }
        }

        // Token-based guest authorization
        $token = $request->input('token') ?? $request->query('token') ?? $request->header('X-Booking-Token');
        if ($token && ! empty($booking->booking_access_token)) {
            if (hash_equals($booking->booking_access_token, hash('sha256', (string) $token))) {
                return;
            }
        }

        // Guest email fallback
        $email = $request->input('email') ?? $request->query('email') ?? $request->header('X-Customer-Email');
        if ($email && $booking->customer && Str::lower((string) $email) === Str::lower((string) $booking->customer->email)) {
            return;
        }

        abort(403, 'Unauthorized access to this booking payment verification.');
    }
}
