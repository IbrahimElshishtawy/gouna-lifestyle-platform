# PHASE 7 — SECRETS & CREDENTIALS MATRIX

## 1. Secrets Inventory & Storage Model

All production secrets are strictly injected via runtime environment variables and must NEVER be committed to version control.

| Secret Identifier | Configuration Key | Storage Source | Rotation Policy | Production Fail-Closed Action |
|---|---|---|---|---|
| **App Encryption Key** | `app.key` (`APP_KEY`) | Environment / Vault | Annual or post-incident | Application terminates with HTTP 500 / startup abort. |
| **PostgreSQL Password** | `database.connections.pgsql.password` (`DB_PASSWORD`) | Environment / Secret Store | 90 days | Database connection fails; healthcheck emits HTTP 503. |
| **Paymob HMAC Secret** | `services.payment.paymob.hmac_secret` (`PAYMOB_HMAC_SECRET`) | Environment / KMS | 180 days | Webhook verifier rejects requests with HTTP 401; placeholder values rejected. |
| **Generic Webhook Secret** | `services.payment.webhook_secret` (`PAYMENT_WEBHOOK_SECRET`) | Environment / KMS | 180 days | Webhook verifier rejects requests with HTTP 401. |
| **Stripe Webhook Secret** | `services.payment.stripe.webhook_secret` (`STRIPE_WEBHOOK_SECRET`) | Environment / KMS | 180 days | Webhook verifier rejects requests with HTTP 401. |
| **SMTP / Mail Credentials** | `mail.mailers.smtp.password` (`MAIL_PASSWORD`) | Environment / KMS | As provider requires | Queued email jobs fail and move to `failed_jobs` table. |
| **AWS S3 Credentials** | `filesystems.disks.s3.secret` (`AWS_SECRET_ACCESS_KEY`) | IAM Role / Environment | Automatic via IAM Role | Storage operations fail with access denied error. |
| **Redis Auth Password** | `database.redis.default.password` (`REDIS_PASSWORD`) | Environment / Vault | 90 days | Cache/session connections fail; logs alert on connection failure. |

---

## 2. Secrets Separation Across Environments

- **Local Development**: Uses local SQLite or local PostgreSQL docker container (`POSTGRES_PASSWORD=gounow_test_secret`), mock payment drivers, and log mailers.
- **Automated Testing (`.env.testing`)**: Uses in-memory / temporary databases, ephemeral mock secrets, and array cache/session drivers.
- **Staging / QA**: Dedicated sandbox gateway credentials, isolated staging PostgreSQL database, and staging CORS origin whitelists.
- **Production**: Isolated VPC database credentials, live merchant HMAC keys, strict CORS whitelist (`https://gounow.com`), and encrypted sessions.

---

## 3. Git History & Accidental Leak Audit Findings

- **Repository Git Scan**: Executed comprehensive git history scan for committed `.env` files and hardcoded API tokens:
  ```bash
  git log --all --full-history -- ".env" ".env.*"
  ```
- **Result**: Zero `.env` files found in commit history.
- **Ignore Integrity**: Root `.gitignore` correctly contains `.env`, `**/.env`, `.env.*`, `**/.env.*`, and `storage/*.key`.
- **Fail-Closed Placeholder Defense**: `WebhookSignatureVerifier::verify()` rejects `whsec_placeholder` in production.
