-- Align the existing waitlist table with authenticated waitlist subscriptions.
-- Additive only: existing email-based rows are preserved and marked as legacy.

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
CREATE POLICY "Authenticated users can join a published page waitlist"
  ON public.waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1
      FROM public.landing_pages lp
      WHERE lp.id = waitlist.landing_page_id
        AND lp.status = 'published'
    )
  );

GRANT INSERT ON TABLE public.waitlist TO authenticated;
GRANT SELECT ON TABLE public.waitlist TO authenticated;
