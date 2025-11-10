-- ============================================
-- Update Users Table RLS Policies
-- ============================================
-- Run this after 05_users_indexes.sql
-- Adds admin policies for user management
-- FIXED: Uses security definer function to prevent infinite recursion
-- ============================================

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS, preventing infinite recursion
-- Two versions: one with parameter, one without (uses auth.uid() internally)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = user_id AND is_admin = TRUE
  );
END;
$$;

-- Create overloaded version without parameters (uses auth.uid() as default)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Admins can view all users (using function to avoid recursion)
CREATE POLICY "Admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    auth.uid() = id OR
    public.is_admin()
  );

-- Admins can update any user (for managing admin status, etc.)
CREATE POLICY "Admins can update any user"
  ON public.users
  FOR UPDATE
  USING (
    public.is_admin()
  );

