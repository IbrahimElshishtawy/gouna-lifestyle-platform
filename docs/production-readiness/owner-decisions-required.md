# Platform Owner Decisions & Business Policy Requirements

**Platform:** GouNow (Gouna Lifestyle & Booking Platform)  
**Document:** `docs/production-readiness/owner-decisions-required.md`  
**Purpose:** Outlines the mandatory business and operational decisions required from the business owners before launch.

---

## 1. Official Merchant Banking & Transfer Credentials

To enable customers to complete manual transfers, the platform owner must provide and configure the official merchant credentials in the database (`payment_methods` table via Admin Settings):

| Method | Required Credential Data | Current Placeholder |
|---|---|---|
| **Instapay** | Official Instapay Username / IPA (e.g. `gounow.stays@instapay`) and Account Holder Name | `gounow@instapay` |
| **Bank Wire (CIB / QNB)** | Full Legal Entity Name, Bank Name, Branch, Account Number, IBAN (starts with `EG...`), and SWIFT code | CIB Egypt - El Gouna Branch |
| **Mobile Wallets** | Official Vodafone Cash / Orange Money / Etisalat Cash merchant mobile numbers | `+20 100 000 0000` |

> [!IMPORTANT]
> Never commit real bank account credentials into Git repositories. Store them in database seeders or configure them directly via the Admin Settings screen.

---

## 2. Inventory Hold & Grace Period Policy

When a customer initiates an offline booking, the inventory is locked in `pending` status:

- **Current Default:** 2 hours (120 minutes) grace period.
- **Decision Required:**
  - Standard Season: Is **2 hours** sufficient for the guest to open their bank app and upload the receipt?
  - Peak Season (e.g., GFF - El Gouna Film Festival, New Year, Eid): Should this be shortened to **1 hour** to avoid inventory blockage by non-serious buyers?
  - Last-Minute (check-in within 24h): Should the hold window be restricted to **30 minutes**?

---

## 3. Deposit vs. Full Payment Rules

- **Current Behavior:** High-end stays support configurable deposit percentages (e.g., 50% down payment), while standard stays require 100%.
- **Decision Required:**
  - Will GouNow accept partial deposits via manual transfer?
  - If partial payment is verified, what is the deadline for the remainder (e.g., 7 days prior to check-in, or upon check-in at the concierge desk)?

---

## 4. Rejection & Remediation Workflow

When finance rejects an illegible or mismatched receipt:
- **Decision Required:**
  - How many hours does the client have to upload a valid corrected receipt before the booking automatically expires? (Recommended: 3 hours).
  - Maximum retry attempts allowed per booking before permanent cancellation (Recommended: 2 retries).

---

## 5. Administrative Segregation of Duties (SOD)

To maintain financial integrity:
- **Decision Required:**
  - Who has the authority to click **Verify & Confirm**?
  - Recommended: Restrict verification rights strictly to `super_admin` and `finance` roles. Stays operations and concierge agents should have read-only access to view proof status without the ability to confirm funds.

---

## 6. WhatsApp & SMS Notification Automation

- **Decision Required:**
  - When a manual payment is verified or rejected, should the platform trigger an immediate automated WhatsApp message to the customer?
  - Preferred provider for Egypt: Meta Cloud API / Infobip / Twilio.
