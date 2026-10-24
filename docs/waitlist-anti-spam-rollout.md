# Waitlist authentication rollout

## What this change does

- Visitors must sign in or create a SignalBoard account before joining a public waitlist.
- The account's email must be confirmed by Supabase Auth. No separate Resend account, waitlist email, token, or purchased domain is required.
- Every new subscription is linked to `auth.users.id`; the email comes from the authenticated Supabase user, never from a form field.
- A database unique index allows one subscription per authenticated user per landing page. Refreshing, signing out and back in, or opening the page again cannot create a second subscription.
- Row Level Security rejects anonymous inserts, unconfirmed accounts, mismatched email identities, and subscriptions to unpublished pages.
- Existing waitlist rows are preserved. Migration links a legacy row only when its email matches a Supabase account whose email is already confirmed; other historical rows remain legacy/unlinked.
- Validation Results counts only confirmed-account subscriptions as verified interest. Existing legacy rows remain excluded unless safely linked by the migration.
- Existing authentication, page CRUD, publishing, Product Studio, and homepage are otherwise unchanged.

## Environment configuration

This approach removes the waitlist-specific environment requirements for Resend, `WAITLIST_COOKIE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, and Turnstile. It uses the existing public Supabase URL/key and existing Supabase Auth email-confirmation setup.

For production, configure Supabase Auth's Site URL and redirect URLs to include your free Vercel origin, `https://signalsboard.vercel.app`, and the local development origin you use. Supabase's built-in email service may be rate-limited for public usage; that is separate from the waitlist logic and does not require Resend for local development.

## Database migration — review before applying

Migration: `supabase/migrations/20261024230000_waitlist_verification_antispam.sql`

The migration has not been applied to the connected production Supabase project by this PR. Review and apply it only after preview testing and explicit approval. It preserves rows, adds an optional authenticated user link, replaces anonymous insert access with confirmed-authenticated insert rules, and creates a unique user/page index.

## Smoke-test checklist

1. Signed-out visitor sees sign-in and create-account actions that return to the same public page.
2. A signed-in but unconfirmed account cannot join.
3. A confirmed account joins successfully; the email is sourced from Supabase Auth.
4. Refreshing the page shows the joined state from the database.
5. Submitting again or joining from another tab/device reports already joined and creates no duplicate row.
6. Anonymous insert attempts and inserts for unpublished pages are rejected by RLS.
7. Existing legacy waitlist rows remain present; only records linked to confirmed accounts count as verified.
8. Auth, dashboard, Product Studio, publish/edit/update/delete, and homepage flows still work.
