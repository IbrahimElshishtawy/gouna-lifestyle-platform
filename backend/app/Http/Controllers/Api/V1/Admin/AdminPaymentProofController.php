<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentProof;
use App\Models\User;
use App\Modules\Payment\Application\Actions\RejectPaymentProofAction;
use App\Modules\Payment\Application\Actions\VerifyPaymentProofAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use InvalidArgumentException;

class AdminPaymentProofController extends Controller
{
    public function __construct(
        private readonly VerifyPaymentProofAction $verifyAction,
        private readonly RejectPaymentProofAction $rejectAction
    ) {}

    /**
     * List payment proofs with status filtering, search, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorizeAdmin($request);

        $query = PaymentProof::with(['booking.property', 'customer', 'paymentMethod', 'reviewer'])
            ->orderByDesc('created_at');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_number', 'like', "%{$search}%")
                    ->orWhere('sender_name', 'like', "%{$search}%")
                    ->orWhere('sender_account', 'like', "%{$search}%")
                    ->orWhereHas('booking', fn ($bq) => $bq->where('reference', 'like', "%{$search}%"))
                    ->orWhereHas('customer', fn ($cq) => $cq->where('email', 'like', "%{$search}%")->orWhere('phone', 'like', "%{$search}%"));
            });
        }

        $paginator = $query->paginate(20);

        $items = collect($paginator->items())->map(function (PaymentProof $p) {
            return [
                'id' => $p->id,
                'booking_id' => $p->booking_id,
                'booking_reference' => $p->booking?->reference,
                'property_title' => $p->booking?->property?->title_en,
                'customer_name' => $p->customer ? $p->customer->full_name : $p->sender_name,
                'customer_email' => $p->customer?->email,
                'customer_phone' => $p->customer?->phone,
                'amount_cents' => (int) $p->amount_cents,
                'formatted_amount' => number_format($p->amount_cents / 100, 2) . ' ' . $p->currency,
                'currency' => $p->currency,
                'payment_method_code' => $p->payment_method_code,
                'payment_method_name' => $p->paymentMethod?->name ?? strtoupper($p->payment_method_code),
                'reference_number' => $p->reference_number,
                'sender_name' => $p->sender_name,
                'sender_account' => $p->sender_account,
                'transfer_date' => $p->transfer_date?->toDateString(),
                'status' => $p->status,
                'rejection_reason' => $p->rejection_reason,
                'reviewed_by' => $p->reviewer?->name,
                'reviewed_at' => $p->reviewed_at?->toIso8601String(),
                'customer_notes' => $p->customer_notes,
                'receipt_filename' => $p->receipt_original_name,
                'receipt_size' => $p->receipt_size_bytes,
                'created_at' => $p->created_at->toIso8601String(),
            ];
        });

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'pending_count' => PaymentProof::where('status', 'pending_verification')->count(),
            ],
        ]);
    }

    /**
     * Show single payment proof details.
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $this->authorizeAdmin($request);

        $proof = PaymentProof::with(['booking.property', 'customer', 'paymentMethod', 'reviewer', 'paymentTransaction'])
            ->findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $proof->id,
                'booking_id' => $proof->booking_id,
                'booking_reference' => $proof->booking?->reference,
                'property_title' => $proof->booking?->property?->title_en,
                'booking_total_cents' => $proof->booking?->total_cents,
                'booking_paid_cents' => $proof->booking?->amount_paid_cents,
                'booking_remaining_cents' => $proof->booking?->amount_remaining_cents,
                'customer_name' => $proof->customer ? $proof->customer->full_name : $proof->sender_name,
                'customer_email' => $proof->customer?->email,
                'customer_phone' => $proof->customer?->phone,
                'amount_cents' => (int) $proof->amount_cents,
                'formatted_amount' => number_format($proof->amount_cents / 100, 2) . ' ' . $proof->currency,
                'currency' => $proof->currency,
                'payment_method_code' => $proof->payment_method_code,
                'payment_method_name' => $proof->paymentMethod?->name ?? strtoupper($proof->payment_method_code),
                'reference_number' => $proof->reference_number,
                'sender_name' => $proof->sender_name,
                'sender_account' => $proof->sender_account,
                'transfer_date' => $proof->transfer_date?->toDateString(),
                'status' => $proof->status,
                'rejection_reason' => $proof->rejection_reason,
                'reviewed_by' => $proof->reviewer?->name,
                'reviewed_at' => $proof->reviewed_at?->toIso8601String(),
                'customer_notes' => $proof->customer_notes,
                'receipt_filename' => $proof->receipt_original_name,
                'created_at' => $proof->created_at->toIso8601String(),
            ],
        ]);
    }

    /**
     * Verify payment proof, mark booking confirmed, create ledger transaction.
     */
    public function verify(Request $request, int $id): JsonResponse
    {
        $admin = $this->authorizeAdmin($request);

        $proof = PaymentProof::findOrFail($id);
        $notes = $request->input('admin_notes');

        try {
            $result = $this->verifyAction->execute($proof, $admin, $notes);

            return response()->json([
                'success' => true,
                'message' => 'Payment proof verified successfully. Reservation confirmed.',
                'data' => [
                    'proof_id' => $result['proof']->id,
                    'status' => $result['proof']->status,
                    'transaction_id' => $result['transaction']->transaction_id,
                    'booking_reference' => $result['booking']->reference,
                    'booking_status' => $result['booking']->status,
                    'payment_status' => $result['booking']->payment_status,
                    'amount_paid_cents' => $result['booking']->amount_paid_cents,
                    'amount_remaining_cents' => $result['booking']->amount_remaining_cents,
                ],
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Reject payment proof with reason.
     */
    public function reject(Request $request, int $id): JsonResponse
    {
        $admin = $this->authorizeAdmin($request);

        $validated = $request->validate([
            'reason' => 'required|string|min:3|max:500',
        ]);

        $proof = PaymentProof::findOrFail($id);

        try {
            $rejected = $this->rejectAction->execute($proof, $admin, $validated['reason']);

            return response()->json([
                'success' => true,
                'message' => 'Payment proof rejected.',
                'data' => [
                    'proof_id' => $rejected->id,
                    'status' => $rejected->status,
                    'rejection_reason' => $rejected->rejection_reason,
                ],
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Securely download or view receipt file for an admin.
     */
    public function receipt(Request $request, int $id)
    {
        $this->authorizeAdmin($request);

        $proof = PaymentProof::findOrFail($id);

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

    private function authorizeAdmin(Request $request): User
    {
        /** @var User|null $user */
        $user = $request->user('sanctum') ?? auth()->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        if (! ($user->is_admin || $user->hasRole('super_admin') || $user->hasRole('finance'))) {
            abort(403, 'Unauthorized. Requires Finance or Super Admin privileges.');
        }

        return $user;
    }
}
