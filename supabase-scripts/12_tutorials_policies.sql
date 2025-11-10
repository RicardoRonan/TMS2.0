-- ============================================
-- Tutorials Table RLS Policies
-- ============================================
-- Run this after 11_tutorials_table.sql
-- ============================================

-- Everyone can read published tutorials
CREATE POLICY "Anyone can read published tutorials"
  ON public.tutorials
  FOR SELECT
  USING (published = TRUE);

-- Note: The is_admin() function must be created first (see 24_update_users_policies.sql or 26_fix_users_policies_recursion.sql)

-- Authenticated users (admins) can insert tutorials
CREATE POLICY "Admins can insert tutorials"
  ON public.tutorials
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tutorials
CREATE POLICY "Admins can update tutorials"
  ON public.tutorials
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins can delete tutorials
CREATE POLICY "Admins can delete tutorials"
  ON public.tutorials
  FOR DELETE
  USING (
    public.is_admin()
  );

