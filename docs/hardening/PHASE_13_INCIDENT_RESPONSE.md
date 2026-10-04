# Phase 13 — Incident Response & Triage Playbook

**Project**: GouNow Lifestyle Platform  
**Phase**: 13 (Final Production Readiness & Backend Closure)  
**Date**: 2026-10-04  
**Audience**: DevOps, On-Call Engineers, Security Incident Response Team (SIRT)  

---

## 1. Incident Classification & Severity Levels

| Severity | Definition | Target Response (MTTD / MTTR) | Examples |
|---|---|---|---|
| **SEV-0** (Catastrophic) | System offline, active security breach, secret leak, or financial compromise. | < 5 min / < 30 min | Database unreachable, payment gateway compromise, unauthorized super-admin access. |
| **SEV-1** (Critical) | Major business function impaired; critical feature unavailable for all users. | < 15 min / < 1 hour | Webhook verification failure, checkout booking lockouts, double-booking constraint violation. |
| **SEV-2** (High) | Degraded performance or secondary feature outage; workaround available. | < 30 min / < 4 hours | Media upload failure, email notification queue backlog, catalog search latency spikes. |
| **SEV-3** (Medium / Low) | Minor anomaly, cosmetic issue, or isolated user impact. | < 2 hours / < 24 hours | Broken SEO meta tags, isolated customer inquiry delivery delay. |

---

## 2. Emergency Containment Actions

### 2.1 Placing Application in Maintenance Mode
To isolate the system while allowing on-call staff debugging access:
```bash
cd /var/www/gounow/current
php artisan down --secret="gounow-oncall-bypass-key" --render="errors::503"
```
Access via bypass URL: `https://gounow.com/gounow-oncall-bypass-key`

To restore regular traffic:
```bash
php artisan up
```

### 2.2 Suspected Token or Account Compromise
If an admin or customer account is suspected of compromise:
1. Immediately deactivate account and revoke tokens:
   ```bash
   php artisan tinker --execute="
   \$user = \App\Models\User::where('email', 'compromised@user.com')->first();
   if (\$user) {
       \$user->is_active = false;
       \$user->save();
       \$user->tokens()->delete();
       echo 'Account deactivated and all tokens revoked.';
   }
   "
   ```
   *Note*: The `EnsureAccountActive` middleware inspects live database state on every incoming request, terminating ongoing sessions immediately.

### 2.3 Compromised Payment Secrets or Webhook Forgery
If payment secrets or webhook keys are compromised:
1. Rotate `PAYMENT_WEBHOOK_SECRET` and `PAYMOB_HMAC_SECRET` in `/var/www/gounow/shared/.env`.
2. Clear and reload configuration cache:
   ```bash
   php artisan config:cache
   ```
3. Check `payment_transactions` for suspicious transactions in the last 2 hours:
   ```bash
   php artisan tinker --execute="
   \$txns = \App\Models\PaymentTransaction::where('created_at', '>=', now()->subHours(2))->get();
   echo 'Recent transactions count: ' . \$txns->count();
   "
   ```

### 2.4 Distributed Denial of Service or Rapid Brute-Force Attack
Block abusive IP addresses at the Nginx or Cloudflare edge:
```bash
# Add to /etc/nginx/conf.d/blockips.conf
deny 198.51.100.1;
deny 203.0.113.0/24;

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

---

## 3. Investigating Incidents via Logs

### 3.1 Tracing a Request by Correlation ID (`X-Request-ID`)
Every API request is assigned a UUID v4 correlation ID stamped into request headers, responses, and log records.
```bash
grep "YOUR-UUID-REQUEST-ID" /var/log/gounow/laravel.log
```

### 3.2 Finding Unhandled 500 Exceptions
```bash
grep "API Unhandled Exception" /var/log/gounow/laravel.log | tail -n 20
```

### 3.3 Verifying Webhook Errors
```bash
grep -i "webhook" /var/log/gounow/laravel.log | grep -E "(ERROR|WARNING)" | tail -n 30
```

### 3.4 Sensitive Data Redaction Confirmation
Logs automatically pass through `SensitiveDataRedactionProcessor`. Passwords, card numbers, tokens, and authorization headers will appear as `[REDACTED]`. Never output raw unredacted dumps to shared storage.

---

## 4. Post-Incident Review (PIR) Protocol

Within 24 hours of resolving a SEV-0 or SEV-1 incident, the on-call engineer must complete a Post-Incident Report containing:
1. **Summary & Timeline**: Exact timestamps (UTC) of detection, response, containment, and recovery.
2. **Root Cause Analysis (RCA)**: 5 Whys analysis identifying the underlying technical or operational failure.
3. **Business & Customer Impact**: Bookings lost, transactions delayed, user exposure, or financial discrepancy.
4. **Corrective & Preventive Actions**: Action items assigned to owners with GitHub issue links.
