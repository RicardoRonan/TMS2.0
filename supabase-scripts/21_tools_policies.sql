-- ============================================
-- Tools Table RLS Policies
-- ============================================
-- Run this after 20_tools_table.sql
-- ============================================

-- Everyone can read tools
CREATE POLICY "Anyone can read tools"
  ON public.tools
  FOR SELECT
  USING (true);

-- Note: The is_admin() function must be created first (see 24_update_users_policies.sql or 26_fix_users_policies_recursion.sql)

-- Authenticated users (admins) can insert tools
CREATE POLICY "Admins can insert tools"
  ON public.tools
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tools
CREATE POLICY "Admins can update tools"
  ON public.tools
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins can delete tools
CREATE POLICY "Admins can delete tools"
  ON public.tools
  FOR DELETE
  USING (
    public.is_admin()
  );

