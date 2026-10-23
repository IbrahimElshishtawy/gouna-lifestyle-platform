# GouNow Security Audit — 07. Residual Risks & Pre-Launch Action Items

**Assessment Date:** October 22, 2026  
**Auditor:** Senior Application Security & DevSecOps Engineer  

---

## 1. Residual Risk Assessment Matrix

| Risk ID | Residual Risk Description | Current State | Pre-Launch Mitigation Required | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **RR-01** | **Database Migration to PostgreSQL** | Application runs on SQLite locally. Concurrency tests for GiST exclusion constraints skip when running on SQLite. | Provision PostgreSQL 16 on the production VPS, execute `php artisan migrate`, and verify the 6 skipped PostgreSQL concurrency tests against the disposable pgsql instance. | Lead DevOps / Backend Engineer |
| **RR-02** | **Production Gateway Credentials** | Local environment uses simulator credentials and placeholder HMAC secrets (`whsec_placeholder`). | Provision live Paymob production keys (`PAYMOB_API_KEY`, `PAYMOB_HMAC_SECRET`) in production `.env`. | Finance / Project Lead |
| **RR-03** | **Production Email Provider Integration** | Mail driver is set to `log` in development. | Configure production transactional email service (Resend, Postmark, or Amazon SES) for password resets and booking notices. | DevOps Engineer |
| **RR-04** | **Off-Site Encrypted Backup Storage** | Backup script created but off-site S3 bucket credentials must be provisioned. | Create private S3 bucket with Object Lock and configure automated cron execution. | DevSecOps Engineer |
| **RR-05** | **Supply Chain Advisory (`symfony/yaml`)** | Flagged in `composer audit` (CVE-2026-109413). | Update `symfony/yaml` to the latest patch release during next scheduled dependency cycle. | Backend Engineer |

---

## 2. Pre-Launch Verification Checklist

Before toggling DNS or opening GouNow to public commercial transactions, the operator must execute:

- [ ] 1. Run `php artisan config:audit-production` on the production server. All checks must display `[PASS]`.
- [ ] 2. Confirm `APP_DEBUG=false` and `APP_ENV=production` in the production `.env`.
- [ ] 3. Ensure `SESSION_SECURE_COOKIE=true` and HTTPS is strictly enforced via TLS 1.3 certificate.
- [ ] 4. Run `php artisan test tests/Feature/PostgresBookingConcurrencyTest.php` against the live PostgreSQL database.
- [ ] 5. Confirm that `/storage/receipts` is completely isolated from public webroot.
