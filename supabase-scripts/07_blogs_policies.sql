-- ============================================
-- Blogs Table RLS Policies
-- ============================================
-- Run this after 06_blogs_table.sql
-- ============================================

-- Everyone can read published blogs
CREATE POLICY "Anyone can read published blogs"
  ON public.blogs
  FOR SELECT
  USING (published = TRUE);

-- Note: The is_admin() function must be created first (see 24_update_users_policies.sql or 26_fix_users_policies_recursion.sql)

-- Admins can read all blogs (including drafts)
-- Uses is_admin() function to avoid recursion
CREATE POLICY "Admins can read all blogs"
  ON public.blogs
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Authenticated users (admins) can insert blogs
CREATE POLICY "Admins can insert blogs"
  ON public.blogs
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update blogs
CREATE POLICY "Admins can update blogs"
  ON public.blogs
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Admins can delete blogs
CREATE POLICY "Admins can delete blogs"
  ON public.blogs
  FOR DELETE
  USING (
    public.is_admin()
  );

