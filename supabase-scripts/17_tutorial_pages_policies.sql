-- ============================================
-- Tutorial Pages Table RLS Policies
-- ============================================
-- Run this after 16_tutorial_pages_table.sql
-- ============================================

-- Everyone can read published tutorial pages
CREATE POLICY "Anyone can read published tutorial pages"
  ON public.tutorial_pages
  FOR SELECT
  USING (published = TRUE);

-- Note: The is_admin() function must be created first (see 24_update_users_policies.sql or 26_fix_users_policies_recursion.sql)

-- Authenticated users (admins) can insert tutorial pages
CREATE POLICY "Admins can insert tutorial pages"
  ON public.tutorial_pages
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tutorial pages
CREATE POLICY "Admins can update tutorial pages"
  ON public.tutorial_pages
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins can delete tutorial pages
CREATE POLICY "Admins can delete tutorial pages"
  ON public.tutorial_pages
  FOR DELETE
  USING (
    public.is_admin()
  );

