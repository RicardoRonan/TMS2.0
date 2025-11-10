-- ============================================
-- Tutorial Pages Table Triggers
-- ============================================
-- Run this after 17_tutorial_pages_policies.sql
-- Requires: 04_updated_at_function.sql (handle_updated_at function)
-- ============================================

-- Create trigger for tutorial_pages updated_at
DROP TRIGGER IF EXISTS set_tutorial_pages_updated_at ON public.tutorial_pages;
CREATE TRIGGER set_tutorial_pages_updated_at
  BEFORE UPDATE ON public.tutorial_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

