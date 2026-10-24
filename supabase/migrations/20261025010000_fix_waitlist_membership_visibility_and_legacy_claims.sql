-- Make the account-backed waitlist schema self-contained for clean installs,
-- preserve legacy rows, and expose only each user's own membership to that user.
ALTER TABLE public.waitlist
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'legacy',
  ADD COLUMN IF NOT EXISTS verified_at timestamptz;

ALTER TABLE public.waitlist
  DROP CONSTRAINT IF EXISTS waitlist_verification_status_check;
ALTER TABLE public.waitlist
  ADD CONSTRAINT waitlist_verification_status_check
  CHECK (verification_status IN ('legacy', 'pending', 'verified', 'flagged'));

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_unique_user_per_page
  ON public.waitlist (landing_page_id, user_id)
  WHERE user_id IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can join a published page waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Authenticated users can join a published page waitlist" ON public.waitlist;
CREATE POLICY "Authenticated users can join a published page waitlist"
  ON public.waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.landing_pages lp
      WHERE lp.id = waitlist.landing_page_id
        AND lp.status = 'published'
    )
  );

-- Link pre-account waitlist records only when their email matches a confirmed
-- Supabase account. Existing records and original created_at values are preserved.
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

GRANT INSERT, SELECT, UPDATE ON TABLE public.waitlist TO authenticated;
