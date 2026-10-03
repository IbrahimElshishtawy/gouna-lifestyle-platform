# PHASE 6 — FINANCIAL RECONCILIATION SPECIFICATION

## 1. Overview

Financial reconciliation is the automated and administrative process that detects, isolates, investigates, and resolves discrepancies between internal platform states (bookings, transactions) and external payment provider ledgers (Paymob, Stripe, PayPal). This document defines the lifecycle, divergence scenarios, resolution protocols, and reconciliation invariants for GouNow.

---

## 2. Divergence Scenarios & Resolution Protocols

The system follows a strict 4-stage lifecycle for every discrepancy:
$$\text{Detected} \longrightarrow \text{Isolated} \longrightarrow \text{Investigated} \longrightarrow \text{Corrected}$$

Under no circumstances may reconciliation routines silently mutate financial records without creating a permanent audit trail in `activity_logs`.

### 2.1 Scenario Matrix

| Discrepancy Scenario | Detection Method | Isolation Protocol | Investigation Workflow | Correction Protocol |
|---|---|---|---|---|
| **Local Pending / Provider Paid** (Missed Webhook) | Daily / Hourly automated reconciliation job queries provider API for transactions in `pending` state beyond hold TTL. | Transaction marked as `under_reconciliation`; inventory hold temporarily frozen. | Inspect webhook delivery logs and network connectivity metrics. Verify HMAC on provider event. | System updates transaction to `completed`, confirms booking, recalculates financials, and logs `RECONCILIATION_AUTO_CONFIRM`. |
| **Local Paid / Provider Failed** (Disputed or Revoked Charge) | Provider webhook (e.g. chargeback/dispute event) or reconciliation balance discrepancy. | Booking flagged as `financial_dispute`; guest check-in privileges suspended. | Contact merchant operations and fraud team to review dispute reason and evidence. | Admin initiates manual cancellation or dispute challenge. If lost, booking transitions to `cancelled` and payment to `failed` with audit record. |
| **Provider Transaction Missing Locally** (Orphan Payment) | Provider settlement report contains transaction ID not found in GouNow database. | Transaction quarantined in `unmatched_provider_transactions` ledger table. | Match transaction by customer email, amount, and timestamp against abandoned checkout sessions. | If matched, associate with existing draft booking or trigger an automated full refund to customer card. |
| **Local Transaction Missing at Provider** (Ghost Transaction) | Local database has `completed` or `pending` transaction with no corresponding record on gateway. | Transaction flagged as `unverified_ghost`; alerts sent to engineering on-call. | Verify API keys, environment endpoints, and whether transaction was created via unauthorized debug path. | Mark transaction `failed`, cancel associated unconfirmed booking, and log critical security alert. |
| **Duplicate Provider Event** (Webhook Retries) | Second or third webhook delivery for identical transaction ID. | Handled gracefully in `PaymentWebhookController` (`replayed: true`). | Check webhook delivery frequency to verify gateway health. | No mutation executed. Returns `200 OK` immediately. |
| **Amount Mismatch** (Partial Capture or Undercut) | Webhook payload `amount_cents` differs from booking `total_amount_cents`. | Webhook rejected with `422 AMOUNT_MISMATCH`; transaction status remains `pending`. | Investigate currency conversion issues, promo code application timing, or malicious payload manipulation. | If legitimate partial deposit, record partial payment; if tampering, keep booking pending/cancelled and alert finance. |
| **Currency Mismatch** | Webhook payload currency does not match booking currency (`EGP` vs `USD`). | Webhook rejected with `422 CURRENCY_MISMATCH`; transaction remains unchanged. | Investigate customer checkout routing and multi-currency gateway configuration. | Disallow confirmation until currency discrepancy is reconciled via admin intervention. |
| **Refund Mismatch** (Provider Refund Exceeds Local Record) | Provider settlement shows refund not recorded in GouNow database. | Booking flagged as `refund_divergence`. | Trace whether refund was issued directly from provider web dashboard bypassing GouNow admin panel. | System backfills refund record in GouNow ledger, decrements net balance, and logs administrative alert. |

---

## 3. Reconciliation Invariants

1. **Client Confirmation Prohibition**:
   No client-side request or unauthenticated guest action can confirm a booking. Confirmation requires cryptographically signed gateway proof.
2. **Provider Evidence Requirement**:
   A payment record cannot transition to `completed` without verifiable cryptographic HMAC proof or verified gateway settlement ID.
3. **Cross-Booking Isolation**:
   A payment webhook for reference `X` cannot alter the state, financials, or attributes of booking `Y`.
4. **Captured Amount Invariant**:
   The captured amount for a booking must satisfy:
   $$\text{Captured Amount} \ge \text{Booking Total}$$
   (or equal to required deposit if deposit checkout is explicitly enabled).
5. **Refund Cap Invariant**:
   $$\sum \text{Refunds} \le \text{Captured Amount}$$
   Refund requests exceeding remaining captured funds must be rejected automatically.
6. **Idempotent Replay Invariant**:
   Repeated delivery of the same verified webhook must produce zero state mutation and zero additional financial ledger entries.
7. **Monotonic Terminal States**:
   A transaction or booking that has reached a terminal state (`cancelled`, `refunded`) cannot be transitioned back to an active state by an incoming payment confirmation.
