-- ============================================
-- Blogs Table Triggers
-- ============================================
-- Run this after 07_blogs_policies.sql
-- Requires: 04_updated_at_function.sql (handle_updated_at function)
-- ============================================

-- Create trigger for blogs updated_at
DROP TRIGGER IF EXISTS set_blogs_updated_at ON public.blogs;
CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

