# GouNow Authorization Matrix (P3-T02)

> **Document Status**: ENFORCED & TESTED  
> **Standard**: Standard S5 (Zero-Trust RBAC & Model Policies)  
> **Audience**: Security Team, Backend Developers, QA Engineers

---

## 1. Role Definitions & Scopes

| Role Key | Role Display Name | Scope Allowed | Primary Responsibilities |
|---|---|---|---|
| `super_admin` | Super Administrator | **all** | System settings, staff/admin management, global platform oversight. |
| `property_manager`| Property Manager | **assigned** / **all** | Rental properties, seasonal pricing, availability blocks, bookings. |
| `sales` | Sales & Real Estate Agent | **own** / **assigned** | Properties for sale, customer viewing inquiries, leads. No financial access. |
| `events_manager` | Events & Experiences Manager | **all** | Curated experiences, event ticket tiers, QR scanning check-ins. |
| `content_manager` | Content & Marketing Manager | **all** | CMS pages, blog articles, FAQs, SEO metadata, media assets. |
| `finance` | Finance & Accounting | **all** | Payment transactions, refunds, reconciliations, financial reports. |
| `staff` | Operations & Field Staff | **assigned** | View-only property details, ticket scanning & check-in. |

---

## 2. Complete Administrative Route Matrix

| Route URI / Action | Permission Key | Canonical (`resource.action`) | Super Admin | Property Manager | Sales | Events Manager | Content Manager | Finance | Staff | State / Scope Conditions |
|---|---|---|---|---|---|---|---|---|---|---|
| `GET /admin` | `view_dashboard` | `dashboard.view` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | Scoped metrics per role |
| `GET /admin/analytics/reports` | `view_reports` | `reports.view` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | Financial figures only |
| `GET /admin/analytics/tracking` | `manage_seo` | `analytics.view` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | Tracking pixels/GTM |
| `GET /admin/properties` | `view_properties` | `properties.view` | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | Published & draft |
| `GET /admin/properties/create` | `create_properties`| `properties.create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Sale or rent |
| `POST /admin/properties` | `create_properties`| `properties.create` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Validated FormRequest |
| `GET /admin/properties/{p}/edit` | `edit_properties` | `properties.update` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Assigned or all |
| `PUT /admin/properties/{p}` | `edit_properties` | `properties.update` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Invariants checked |
| `DELETE /admin/properties/{p}` | `delete_properties`| `properties.delete` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | **Staff/Sales forbidden** |
| `GET /admin/bookings` | `manage_bookings` | `bookings.view` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | **Sales forbidden** |
| `GET /admin/bookings/confirmed` | `manage_bookings` | `bookings.view` | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | Filtered |
| `GET /admin/bookings/payments` | `manage_payments` | `payments.view` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | **Property Mgr forbidden** |
| `POST /admin/bookings/{b}/refund`| `manage_payments` | `payments.refund` | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | SuperAdmin & Finance only |
| `GET /admin/experiences` | `manage_experiences`| `experiences.view`| ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `POST /admin/experiences` | `manage_experiences`| `experiences.create`| ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `PUT /admin/experiences/{e}` | `manage_experiences`| `experiences.update`| ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `DELETE /admin/experiences/{e}` | `manage_experiences`| `experiences.delete`| ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `GET /admin/events` | `manage_events` | `events.view` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `POST /admin/events` | `manage_events` | `events.create` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `PUT /admin/events/{ev}` | `manage_events` | `events.update` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `DELETE /admin/events/{ev}` | `manage_events` | `events.delete` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | - |
| `GET /admin/events/checkin` | `manage_tickets` | `tickets.scan` | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ | **Staff permitted** |
| `GET /admin/customers` | `manage_customers` | `customers.view` | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | Customer profiles |
| `GET /admin/customers/leads` | `manage_leads` | `leads.view` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | Concierge & buying |
| `GET /admin/cms/*` | `manage_content` | `cms.manage` | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | CMS pages & blogs |
| `GET /admin/users` | `manage_users` | `users.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Super Admin only |
| `POST /admin/users` | `manage_users` | `users.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | No self-escalation |
| `DELETE /admin/users/{u}` | `manage_users` | `users.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | Cannot delete last admin |
| `GET /admin/settings` | `manage_settings` | `settings.manage` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | System keys & env |

---

## 3. Explicit Security Answers & Clarifications (G22)

1. **Who can issue refunds?**
   - **Only `super_admin` and `finance`** have `payments.refund` capability. Property Managers and Content Managers are strictly forbidden.
2. **Can Sales view financial booking payments?**
   - **No.** Real Estate Sales agents have access to properties and buyer leads only. Payment transactions and booking revenues are restricted to Finance and Super Admin.
3. **Can Staff delete properties or cancel bookings?**
   - **No.** Staff permissions are restricted to property view-only and ticket scanning / guest check-in.
4. **403 vs 404 leakage policy:**
   - Standard guests querying someone else's booking receive **404 Resource Not Found** (preventing reference enumeration).
   - Staff/Admin querying a forbidden admin section receive **403 Forbidden**.
