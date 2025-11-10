-- ============================================
-- Fix Blogs Anonymous Access
-- ============================================
-- This script fixes the issue where blogs aren't showing for anonymous users
-- The problem: is_admin() function may error for anonymous users (auth.uid() is NULL)
-- Solution: Update is_admin() to handle NULL gracefully and grant to anon role
-- ============================================

-- Update is_admin() function to handle NULL auth.uid() gracefully
-- This prevents errors when anonymous users try to access blogs
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

-- Grant execute permission to anon role (for anonymous users)
-- This allows the function to be called during RLS policy evaluation
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Also update the version with parameter for consistency
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

-- Grant execute permission to anon role for the parameterized version too
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;

-- ============================================
-- Fix Complete
-- ============================================
-- The is_admin() function now:
-- 1. Handles NULL auth.uid() gracefully (returns false)
-- 2. Is accessible to anonymous users (anon role)
-- 3. Won't cause errors during RLS policy evaluation
-- 
-- Anonymous users can now read published blogs without issues.
-- ============================================

