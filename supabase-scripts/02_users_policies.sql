-- ============================================
-- Users Table RLS Policies
-- ============================================
-- Run this after 01_users_table.sql
-- ============================================

-- Users can read their own data
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own data
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can view all users (optional - uncomment if needed)
-- CREATE POLICY "Admins can view all users"
--   ON public.users
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.users
--       WHERE id = auth.uid() AND is_admin = TRUE
--     )
--   );

