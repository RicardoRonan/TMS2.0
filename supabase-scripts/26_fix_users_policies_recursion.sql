-- ============================================
-- Fix Infinite Recursion in Users Policies
-- ============================================
-- This script fixes the infinite recursion error (42P17)
-- by creating a security definer function to check admin status
-- ============================================

-- Drop existing policies that cause recursion
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
  -- Return false if user_id is NULL
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
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
  -- Return false immediately if user is not authenticated
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() AND is_admin = TRUE
  );
END;
$$;

-- Grant execute permission to authenticated and anonymous users
-- Anonymous users need this for RLS policy evaluation (e.g., reading published blogs)
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- Create new admin policies using the function (no recursion!)
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

-- ============================================
-- Fix Complete
-- ============================================
-- The infinite recursion error should now be resolved.
-- The is_admin() function bypasses RLS, so it won't trigger
-- another policy check when checking admin status.
-- ============================================

