<?php

declare(strict_types=1);

namespace App\Modules\Payment\Application\Actions;

use App\Models\ActivityLog;
use App\Models\Booking;
use App\Models\PaymentMethod;
use App\Models\PaymentProof;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;

class SubmitPaymentProofAction
{
    public const ALLOWED_RECEIPT_MIMES = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'application/pdf' => 'pdf',
    ];

    public const DISALLOWED_EXTENSIONS = [
        'php', 'phtml', 'phar', 'php3', 'php4', 'php5', 'php7', 'phps',
        'sh', 'bash', 'exe', 'bat', 'cmd', 'cgi', 'pl', 'py', 'js',
        'html', 'htm', 'shtml', 'svg', 'htaccess', 'env', 'config',
    ];

    public const MAX_RECEIPT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    public function execute(
        Booking $booking,
        int $amountCents,
        string $paymentMethodCode,
        UploadedFile $receiptFile,
        ?string $referenceNumber = null,
        ?string $senderName = null,
        ?string $senderAccount = null,
        ?string $customerNotes = null,
        ?string $transferDate = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
        ?int $customerId = null
    ): PaymentProof {
        // 1. Booking State Guard
        if (in_array($booking->status, ['confirmed', 'paid', 'completed', 'cancelled'], true)) {
            throw new InvalidArgumentException("Cannot submit payment proof for booking with status '{$booking->status}'.");
        }

        // 2. Prevent concurrent / duplicate pending proof submissions
        $hasPending = $booking->paymentProofs()
            ->where('status', 'pending_verification')
            ->exists();

        if ($hasPending) {
            throw new InvalidArgumentException('A payment proof is already pending review for this reservation.');
        }

        // 3. Validate Amount
        if ($amountCents <= 0) {
            throw new InvalidArgumentException('Payment amount must be greater than zero.');
        }

        // 4. Validate Receipt File Security
        $safeExtension = $this->validateReceiptFile($receiptFile);

        // 5. Secure File Storage on Private Disk
        $year = date('Y');
        $month = date('m');
        $filename = Str::uuid()->toString() . '.' . $safeExtension;
        $folder = "receipts/{$year}/{$month}";
        $path = $receiptFile->storeAs($folder, $filename, 'receipts');

        $cleanOriginalName = preg_replace('/[^a-zA-Z0-9_\.-]/', '_', basename($receiptFile->getClientOriginalName())) ?: 'receipt.' . $safeExtension;

        // Resolve PaymentMethod if matching code exists
        $paymentMethod = PaymentMethod::where('code', $paymentMethodCode)->first();

        return DB::transaction(function () use (
            $booking, $amountCents, $paymentMethodCode, $paymentMethod,
            $referenceNumber, $senderName, $senderAccount, $path,
            $cleanOriginalName, $receiptFile, $customerNotes, $transferDate,
            $ipAddress, $userAgent, $customerId
        ) {
            $proof = PaymentProof::create([
                'booking_id' => $booking->id,
                'customer_id' => $customerId ?? $booking->customer_id,
                'payment_method_id' => $paymentMethod?->id,
                'payment_method_code' => $paymentMethodCode,
                'amount_cents' => $amountCents,
                'currency' => $booking->currency ?? 'EGP',
                'transfer_date' => $transferDate ? Carbon::parse($transferDate) : now()->toDateString(),
                'reference_number' => $referenceNumber ? trim($referenceNumber) : null,
                'sender_name' => $senderName ? trim($senderName) : null,
                'sender_account' => $senderAccount ? trim($senderAccount) : null,
                'receipt_disk' => 'receipts',
                'receipt_path' => $path,
                'receipt_original_name' => $cleanOriginalName,
                'receipt_mime_type' => (string) $receiptFile->getMimeType(),
                'receipt_size_bytes' => $receiptFile->getSize() ?: 0,
                'customer_notes' => $customerNotes ? trim($customerNotes) : null,
                'status' => 'pending_verification',
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            // Ensure booking reflects awaiting payment & pending verification
            $booking->update([
                'status' => 'awaiting_payment',
                'payment_status' => 'pending',
                'payment_method_id' => $paymentMethod?->id ?? $booking->payment_method_id,
            ]);

            ActivityLog::create([
                'user_id' => null,
                'action' => 'payment_proof_submitted',
                'entity_type' => PaymentProof::class,
                'entity_id' => $proof->id,
                'description' => "Payment proof of {$amountCents} cents submitted by customer for booking {$booking->reference} via {$paymentMethodCode}.",
                'old_values' => ['status' => null],
                'new_values' => [
                    'status' => 'pending_verification',
                    'booking_id' => $booking->id,
                    'reference' => $proof->reference_number,
                ],
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);

            return $proof;
        });
    }

    public function validateReceiptFile(UploadedFile $file): string
    {
        if (! $file->isValid()) {
            throw new InvalidArgumentException('Uploaded receipt file is invalid or corrupt.');
        }

        $size = $file->getSize() ?: 0;
        if ($size > self::MAX_RECEIPT_SIZE_BYTES) {
            throw new InvalidArgumentException('Receipt file size exceeds maximum limit of 5 MB.');
        }

        $clientExtension = strtolower($file->getClientOriginalExtension());
        if (in_array($clientExtension, self::DISALLOWED_EXTENSIONS, true)) {
            throw new InvalidArgumentException("Disallowed file extension: .{$clientExtension}");
        }

        $realMime = (string) $file->getMimeType();
        if (! array_key_exists($realMime, self::ALLOWED_RECEIPT_MIMES)) {
            throw new InvalidArgumentException("Unsupported file type: {$realMime}. Allowed types: JPG, PNG, WEBP, PDF.");
        }

        // Magic bytes inspection to prevent polyglot / disguised executable scripts
        $handle = fopen($file->getRealPath(), 'rb');
        if ($handle) {
            $header = fread($handle, 512);
            fclose($handle);

            if ($header !== false) {
                if (str_contains($header, '<?php') || str_contains($header, '<?=') || str_contains($header, '<script')) {
                    throw new InvalidArgumentException('File content failed security validation (embedded script signature detected).');
                }
            }
        }

        return self::ALLOWED_RECEIPT_MIMES[$realMime];
    }
}
