-- ============================================
-- Users Table Indexes
-- ============================================
-- Run this after 04_updated_at_function.sql
-- ============================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

