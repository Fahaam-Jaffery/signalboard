-- Fix membership persistence and metrics visibility for authenticated waitlist users.
-- Backfill legacy rows only when the signup email matches a confirmed auth account.

UPDATE public.waitlist AS w
SET user_id = u.id,
    verification_status = 'verified',
    verified_at = COALESCE(w.verified_at, u.email_confirmed_at, w.created_at)
FROM auth.users AS u
WHERE w.user_id IS NULL
  AND lower(trim(w.email)) = lower(trim(u.email))
  AND u.email_confirmed_at IS NOT NULL;

DROP POLICY IF EXISTS "Users can view own waitlist memberships" ON public.waitlist;
CREATE POLICY "Users can view own waitlist memberships"
  ON public.waitlist
  FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR (
      user_id IS NULL
      AND lower(trim(email)) = lower(trim((SELECT auth.jwt() ->> 'email')))
    )
  );

DROP POLICY IF EXISTS "Users can claim matching legacy waitlist entries" ON public.waitlist;
CREATE POLICY "Users can claim matching legacy waitlist entries"
  ON public.waitlist
  FOR UPDATE
  TO authenticated
  USING (
    user_id IS NULL
    AND lower(trim(email)) = lower(trim((SELECT auth.jwt() ->> 'email')))
  )
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND lower(trim(email)) = lower(trim((SELECT auth.jwt() ->> 'email')))
  );

GRANT UPDATE ON TABLE public.waitlist TO authenticated;
