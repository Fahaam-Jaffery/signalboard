# Waitlist anti-spam rollout

## What this change does

- New submissions are **pending** until the visitor explicitly confirms a one-time email link.
- Only **verified** signups count in the validation dashboard's headline totals and time series.
- Existing records are preserved as `legacy` and excluded from confirmed metrics; they are never silently upgraded to verified.
- Email addresses are trimmed/lowercased and protected by a database-enforced case-insensitive, per-page unique index.
- Database-backed limits allow at most 12 requests per IP key and 3 per email key per hour.
- A hidden honeypot catches simple bots.
- A signed, HttpOnly, SameSite=Lax cookie remembers pending/verified membership on refresh without putting an email address in the cookie.
- Verification tokens are stored as hashes, expire after 30 minutes, and are single-use. The email-link GET is side-effect-free so common email link scanners do not automatically verify a signup.

## Required environment configuration

Set these **server-side** variables in Vercel (Preview and Production as appropriate) and local `.env.local`:

- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Project Settings → API keys → service_role/secret key. Never prefix this with `NEXT_PUBLIC_`; never commit it.
- `WAITLIST_COOKIE_SECRET`: a private random secret of at least 32 characters. Keep the same value across deployments so existing membership cookies remain valid.
- `RESEND_API_KEY`: API key from Resend.
- `WAITLIST_EMAIL_FROM`: sender identity on a domain verified with Resend, for example `SignalBoard <waitlist@your-verified-domain.com>`.
- `NEXT_PUBLIC_SITE_URL`: exact public origin used in confirmation links, with no trailing slash (for production, `https://signalsboard.vercel.app`).

Resend currently advertises a $0 transactional-email tier with 3,000 emails/month and a 100/day limit. Sending from a production sender generally requires a domain you control and have verified. Check the provider's current terms before launch: https://www.resend.com/pricing?product=transactional

## Database migration — manual approval required

The migration is `supabase/migrations/20261024230000_waitlist_verification_antispam.sql`. It has **not** been applied to the connected production Supabase database by this change. Review it, then apply it to the intended environment before enabling the new route. It creates private token/rate-limit tables and service-role-only RPCs.

A read-only preflight on the connected database found no current case-insensitive duplicate pairs, so the new unique index should not collide with the current rows. Re-run the duplicate check immediately before applying the migration if new submissions can arrive in the meantime:

```sql
select landing_page_id, lower(email) as normalized_email, count(*)
from public.waitlist
group by landing_page_id, lower(email)
having count(*) > 1;
```

After migration, old rows remain `legacy`. A legacy address is moved to `pending` only when that person requests a new confirmation link. Do not run any backfill that marks existing rows verified.

## Review / smoke-test checklist

1. Invalid syntax is rejected; mixed-case variants for the same page cannot create two rows.
2. Submitting a real address shows the pending message and sends one confirmation email.
3. The row is not counted as verified until the user submits the confirmation form in the email.
4. Opening the link in a mail scanner / HTTP GET alone does not verify the row.
5. A confirmation link expires after 30 minutes; a consumed token cannot be reused.
6. Refreshing the page preserves the pending/verified state in the same browser; another device requires the email link.
7. Repeated submissions hit the rate limits; a non-empty honeypot is never persisted.
8. Pending and legacy records are excluded from verified totals; per-page counts and charts use only verified rows.
9. Published page, auth, Product Studio, page edit/update/delete, and existing homepage flows remain unchanged.
10. Check provider logs for delivery failures and configure a verified sender before production testing.

## Known limitations / next hardening pass

- Email confirmation proves access to an inbox at that moment, not that the person is unique, human, or a qualified customer.
- MX/DNS checks cannot prove a specific mailbox exists and are not used as a false-positive-prone gate.
- This first pass uses a honeypot and durable server-side rate limits. A Cloudflare Turnstile challenge for higher-risk traffic should be added after site/secret keys are configured; do not treat the honeypot alone as enterprise bot protection.
- Delivery/bounce webhooks, disposable-domain intelligence, and automated pruning/retention are follow-up work. Do not represent a pending or legacy row as verified.
