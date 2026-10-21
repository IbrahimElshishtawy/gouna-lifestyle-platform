# End-to-End Secure Manual Payment & Offline Verification Architecture

**System:** GouNow (Gouna Lifestyle & Booking Platform)  
**Document:** `docs/production-readiness/payment-manual-verification-design.md`  
**Revision:** 2.0 (Hardened Production Design)

---

## 1. Architectural Philosophy & Context

In the Egyptian luxury tourism and real estate market, a significant fraction of high-value transactions (such as El Gouna villa bookings exceeding 50,000–200,000 EGP) are executed outside traditional credit card payment gateways due to:
1. Daily card transaction limits imposed by Egyptian banks.
2. High interchange fees on credit card transactions.
3. Market preference for **Instapay** (instant zero-fee bank-to-bank settlement), direct **Bank Wire (CIB, QNB, Banque Misr)**, and **Mobile Wallets (Vodafone Cash, Orange Money, Etisalat Cash)**.

**Core Invariant:**  
> **A receipt screenshot or reference number provided by a customer is NEVER treated as final proof of funds.** Funds are only credited when an authorized finance administrator actively inspects the merchant bank statement and marks the proof `verified`.

---

## 2. Database Schema & Data Models

### 2.1 Table `payment_proofs`
Created via migration `2026_10_22_000001_create_payment_proofs_table.php`:

```sql
CREATE TABLE payment_proofs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    customer_id BIGINT NULL REFERENCES customers(id) ON DELETE SET NULL,
    payment_method_id BIGINT NULL REFERENCES payment_methods(id) ON DELETE SET NULL,
    amount_paid_cents BIGINT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'EGP',
    reference_number VARCHAR(100) NOT NULL,
    sender_name VARCHAR(150) NULL,
    sender_account VARCHAR(100) NULL,
    receipt_path VARCHAR(255) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
    customer_notes TEXT NULL,
    rejection_reason TEXT NULL,
    admin_notes TEXT NULL,
    reviewed_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes for high-frequency admin queries
CREATE INDEX idx_payment_proofs_status ON payment_proofs(status);
CREATE INDEX idx_payment_proofs_booking_id ON payment_proofs(booking_id);
CREATE INDEX idx_payment_proofs_reference_number ON payment_proofs(reference_number);
```

### 2.2 Table `payment_methods`
Stores manual transfer configurations and localized instructions:
- `code`: `instapay`, `bank_transfer`, `vodafone_cash`, `cash`.
- `name_ar` / `name_en`: Display titles.
- `instructions_ar` / `instructions_en`: Step-by-step instructions (e.g., Instapay address, bank account name, IBAN, Swift code).
- `account_details`: JSON field holding account metadata.
- `is_active`: Boolean toggle for admin control.

---

## 3. State Machine & Transition Logic

```
   [ Customer Books Unit ]
              │
              ▼
    (status: 'pending')
    (payment_status: 'unpaid')
              │
              ├───────► [ Grace Period Expiry (2 Hours) ] ───► (status: 'expired')
              │
              ▼ [ Customer Uploads Transfer Receipt ]
     [ PaymentProof Created: status='pending' ]
     [ Booking: status='awaiting_payment' ]
              │
              ├───► Admin Inspection in Backoffice
              │
      ┌───────┴────────────────────────┐
      ▼                                ▼
[ Reject Action ]              [ Verify Action ]
- Reason mandatory              - Pessimistic Row Lock (`lockForUpdate`)
- Proof: `rejected`             - Proof: `verified`
- Booking remains               - Create immutable `payment_transactions` record
  `awaiting_payment`            - Booking: `amount_paid_cents += proof.amount`
- Customer can re-upload        - Booking: `payment_status = 'paid'` (or 'partially_paid')
                                - Booking: `status = 'confirmed'`
                                - Automated audit log entry recorded
```

### 3.1 Concurrency & Double Verification Protection
To eliminate race conditions when two administrators attempt to verify the same proof simultaneously:
```php
DB::transaction(function () use ($proofId, $adminUser, $notes) {
    // Acquire exclusive row-level lock
    $proof = PaymentProof::where('id', $proofId)->lockForUpdate()->firstOrFail();
    
    if ($proof->status !== 'pending') {
        throw new \DomainException("Payment proof #{$proof->id} has already been {$proof->status}.");
    }

    $booking = Booking::where('id', $proof->booking_id)->lockForUpdate()->firstOrFail();

    // 1. Mark proof as verified
    $proof->update([
        'status' => 'verified',
        'reviewed_by' => $adminUser->id,
        'reviewed_at' => now(),
        'admin_notes' => $notes,
    ]);

    // 2. Insert immutable ledger entry
    PaymentTransaction::create([
        'booking_id' => $booking->id,
        'customer_id' => $booking->customer_id,
        'gateway' => 'manual',
        'payment_method' => $proof->paymentMethod?->code ?? 'manual_transfer',
        'type' => 'payment',
        'amount_cents' => $proof->amount_paid_cents,
        'currency' => $proof->currency,
        'status' => 'successful',
        'gateway_transaction_id' => 'MANUAL-' . $proof->reference_number,
        'notes' => 'Verified by ' . $adminUser->name . ' (# ' . $adminUser->id . ')',
    ]);

    // 3. Update booking financials and confirm
    $booking->amount_paid_cents += $proof->amount_paid_cents;
    $booking->amount_remaining_cents = max(0, $booking->total_price_cents - $booking->amount_paid_cents);
    $booking->payment_status = $booking->amount_remaining_cents === 0 ? 'paid' : 'partially_paid';
    $booking->status = 'confirmed';
    $booking->save();
});
```

---

## 4. Receipt Storage & Strict Privacy Protection

### 4.1 Storage Isolation
- Receipts are stored under `storage/app/private/receipts` on the isolated `receipts` disk.
- Physical path cannot be reached by web requests (`'serve' => false` in `filesystems.php`).
- Filenames are randomized with UUIDs (`proof_GN-ABC1234_uuid4.jpg`) to prevent guessable enumeration.

### 4.2 Authorized Streaming Delivery
Receipt images are only accessed via authorized controller endpoints:
1. **Public/Customer Access:**
   - Route: `GET /api/v1/customer/payment-proofs/{id}/receipt`
   - Authorization: Verified if the requester is the logged-in customer who owns the booking, OR passes the valid booking `access_token` query parameter.
2. **Admin/Finance Access:**
   - Route: `GET /api/v1/admin/payment-proofs/{id}/receipt`
   - Authorization: Verified via `auth:sanctum` with role checking (`is_admin`, `super_admin`, or `finance`).

---

## 5. Security & Validation Rules

1. **MIME Type Whitelist:**
   Only `image/jpeg`, `image/png`, `image/webp`, and `application/pdf` are accepted.
2. **Binary Content Inspection:**
   File headers are scanned for script signatures (`<?php`, `eval(`, `<script`) to block polyglot webshell execution.
3. **Maximum File Size:**
   Strictly capped at 5 MB (5,120 KB).
4. **Rate Limiting:**
   - Proof submission is rate-limited to 10 requests per minute per IP.
   - Receipt streaming is rate-limited to 30 requests per minute per IP.
5. **Duplicate Prevention:**
   Customers cannot upload a second proof while a previous proof is still `pending` review.

---

## 6. Audit Trail & Logging

Every state change produces an immutable audit record:
- **Proof Submitted:** `Payment proof #ID submitted for booking GN-XXXX by [Client IP / Name]`.
- **Proof Verified:** `Payment proof #ID verified by Admin [Name] (#ID). Booking confirmed.`
- **Proof Rejected:** `Payment proof #ID rejected by Admin [Name]. Reason: [Reason]`.
