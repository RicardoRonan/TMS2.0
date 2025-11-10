-- ============================================
-- Update Blogs Table RLS Policies
-- ============================================
-- Run this to allow admins to read all blogs (including drafts)
-- FIXED: Uses is_admin() function to prevent infinite recursion
-- ============================================

-- Drop existing policy if it exists (failsafe)
DROP POLICY IF EXISTS "Admins can read all blogs" ON public.blogs;

-- Admins can read all blogs (including drafts)
-- Uses is_admin() function to avoid recursion
CREATE POLICY "Admins can read all blogs"
  ON public.blogs
  FOR SELECT
  USING (
    public.is_admin()
  );

