-- ============================================
-- Tools Table Triggers
-- ============================================
-- Run this after 21_tools_policies.sql
-- Requires: 04_updated_at_function.sql (handle_updated_at function)
-- ============================================

-- Create trigger for tools updated_at
DROP TRIGGER IF EXISTS set_tools_updated_at ON public.tools;
CREATE TRIGGER set_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

