-- ============================================
-- Fix Blogs UPDATE Policy
-- ============================================
-- This fixes the UPDATE policy to include WITH CHECK clause
-- PostgreSQL RLS requires both USING and WITH CHECK for UPDATE operations
-- ============================================

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;

-- Recreate with both USING and WITH CHECK
CREATE POLICY "Admins can update blogs"
  ON public.blogs
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- ============================================
-- Policy Fixed Successfully
-- ============================================
-- The UPDATE policy now includes both USING and WITH CHECK clauses
-- This ensures updates are properly validated by RLS
-- ============================================

