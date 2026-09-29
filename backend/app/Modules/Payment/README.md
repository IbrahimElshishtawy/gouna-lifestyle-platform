# Payment Module

## 1. Purpose
The **Payment Module** handles payment gateway interactions, transaction persistence, 3DS authentication handshakes, and webhook reconciliation. It guarantees idempotent execution and prevents duplicate charges or double credits.

---

## 2. Directory Structure
```
app/Modules/Payment/
├── Application/
│   ├── Actions/
│   │   ├── InitiatePaymentAction.php          # Creates pending transaction & generates redirect/approval
│   │   ├── ConfirmPaymentAction.php           # Confirms transaction & triggers booking confirmation
│   │   ├── FailPaymentAction.php              # Records failure reason and updates transaction status
│   │   ├── ProcessPaymentWebhookAction.php    # Cryptographically verifies & reconciles webhook events
│   │   └── RecordManualPaymentAction.php      # Allows admins to record offline wire/cash payments
│   └── DTOs/
│       └── PaymentInitiationResultDTO.php     # Payment reference, redirect URL & status
└── Infrastructure/
    └── Gateways/
        ├── PaymentGatewayInterface.php        # Unified gateway contract
        ├── CardPaymentGateway.php             # Credit / Debit card 3DS implementation
        ├── PayPalPaymentGateway.php           # PayPal Express Checkout integration
        └── CashPaymentGateway.php             # Cash-on-arrival / offline settlement
```

---

## 3. Idempotency & Webhook Safety
1. **Replay Protection:** All webhook entries verify an HMAC cryptographic signature. Duplicate events are discarded either via `IdempotencyService` or the database unique constraint on `payment_transactions.webhook_event_id`.
2. **Pessimistic Concurrency:** Payment confirmation actions lock the transaction record (`SELECT ... FOR UPDATE`), preventing race conditions between return URLs and asynchronous webhooks.
