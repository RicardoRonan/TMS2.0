-- ============================================
-- Tutorials Table Triggers
-- ============================================
-- Run this after 12_tutorials_policies.sql
-- Requires: 04_updated_at_function.sql (handle_updated_at function)
-- ============================================

-- Create trigger for tutorials updated_at
DROP TRIGGER IF EXISTS set_tutorials_updated_at ON public.tutorials;
CREATE TRIGGER set_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

