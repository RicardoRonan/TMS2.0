-- ============================================
-- Create is_admin() Function (RUN THIS FIRST!)
-- ============================================
-- This function must be created BEFORE any policies that use it
-- Run this script first if you get "function does not exist" errors
-- ============================================

-- Drop function if it exists (allows re-running this script)
DROP FUNCTION IF EXISTS public.is_admin(UUID);
DROP FUNCTION IF EXISTS public.is_admin();

-- Create a security definer function to check if user is admin
-- This function bypasses RLS, preventing infinite recursion in policies
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

-- ============================================
-- Function Created Successfully
-- ============================================
-- You can now run other scripts that use is_admin()
-- ============================================

