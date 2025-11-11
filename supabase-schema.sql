-- ============================================
-- Supabase Database Schema for TMS2.0
-- ============================================
-- Complete setup script with failsafes
-- Safe to run multiple times (idempotent)
-- ============================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- ============================================

-- ============================================
-- PART 1: USERS TABLE
-- ============================================

-- Create users table (with failsafe)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- Enable Row Level Security (idempotent - safe to run multiple times)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;

-- Create policies for users table
CREATE POLICY "Users can view own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Optional: Admins can view all users (uncomment if needed)
-- CREATE POLICY "Admins can view all users"
--   ON public.users
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public.users
--       WHERE id = auth.uid() AND is_admin = TRUE
--     )
--   );

-- ============================================
-- PART 2: FUNCTIONS
-- ============================================

-- Create function to automatically create user profile on signup
-- CREATE OR REPLACE ensures it updates if already exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, photo_url, created_at, last_login_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function (used by multiple tables)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a security definer function to check if user is admin
-- This function bypasses RLS, preventing infinite recursion in policies
-- MUST be created before any policies that use it
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
-- Anonymous users need this for RLS policy evaluation
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

-- ============================================
-- PART 3: TRIGGERS
-- ============================================

-- Drop triggers if they exist (failsafe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
-- Note: blogs trigger will be dropped after blogs table is created

-- Create trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for users updated_at
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 4: USERS TABLE INDEXES
-- ============================================

-- Create indexes for better performance (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- ============================================
-- PART 5: BLOGS TABLE
-- ============================================

-- Create blogs table (with failsafe)
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  category TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  read_time INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security for blogs (idempotent)
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Add author_id column if it doesn't exist (for existing tables)
-- This handles cases where the blogs table was created without author_id
-- Step 1: Add column without constraint (IF NOT EXISTS works here)
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS author_id UUID;

-- Step 2: Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public' 
      AND tc.table_name = 'blogs'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.column_name = 'author_id'
  ) THEN
    ALTER TABLE public.blogs 
    ADD CONSTRAINT blogs_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Anyone can read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can read all blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Admins can delete blogs" ON public.blogs;

-- Create policies for blogs table
-- Everyone can read published blogs
CREATE POLICY "Anyone can read published blogs"
  ON public.blogs
  FOR SELECT
  USING (published = TRUE);

-- Note: Admins policies use is_admin() function (created in PART 17) to avoid recursion

-- Admins can read all blogs (including drafts)
CREATE POLICY "Admins can read all blogs"
  ON public.blogs
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Authenticated users (admins) can insert blogs
CREATE POLICY "Admins can insert blogs"
  ON public.blogs
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update blogs
CREATE POLICY "Admins can update blogs"
  ON public.blogs
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Admins can delete blogs
CREATE POLICY "Admins can delete blogs"
  ON public.blogs
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================
-- PART 6: BLOGS TABLE TRIGGERS
-- ============================================

-- Drop blogs trigger if it exists (failsafe - must be after table creation)
DROP TRIGGER IF EXISTS set_blogs_updated_at ON public.blogs;

-- Create trigger for blogs updated_at
CREATE TRIGGER set_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 7: BLOGS TABLE INDEXES
-- ============================================

-- Create indexes for blogs (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);

-- Create author_id index only if the column exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'blogs' 
    AND column_name = 'author_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);
  END IF;
END $$;

-- ============================================
-- PART 7.5: BLOG LIKES TABLE
-- ============================================

-- Create blog_likes table (with failsafe)
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

-- Enable Row Level Security for blog_likes (idempotent)
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Users can view all blog likes" ON public.blog_likes;
DROP POLICY IF EXISTS "Users can like blogs" ON public.blog_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON public.blog_likes;

-- Create policies for blog_likes table
-- Everyone can view likes (for counting)
CREATE POLICY "Users can view all blog likes"
  ON public.blog_likes
  FOR SELECT
  USING (TRUE);

-- Authenticated users can like blogs
CREATE POLICY "Users can like blogs"
  ON public.blog_likes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can unlike their own likes
CREATE POLICY "Users can unlike their own likes"
  ON public.blog_likes
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Create indexes for blog_likes (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_user ON public.blog_likes(blog_id, user_id);

-- ============================================
-- PART 7.6: BLOG COMMENTS TABLE
-- ============================================

-- Create blog_comments table (with failsafe)
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for blog_comments (idempotent)
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Users can view comments on published blogs" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.blog_comments;

-- Create policies for blog_comments table
-- Everyone can view comments on published blogs
CREATE POLICY "Users can view comments on published blogs"
  ON public.blog_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.blogs
      WHERE blogs.id = blog_comments.blog_id
      AND blogs.published = TRUE
    )
  );

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.blogs
      WHERE blogs.id = blog_comments.blog_id
      AND blogs.published = TRUE
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.blog_comments
  FOR UPDATE
  USING (
    auth.uid() = user_id
  )
  WITH CHECK (
    auth.uid() = user_id
  );

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.blog_comments
  FOR DELETE
  USING (
    auth.uid() = user_id
  );

-- Admins can delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.blog_comments
  FOR DELETE
  USING (
    public.is_admin()
  );

-- Create trigger for blog_comments updated_at
DROP TRIGGER IF EXISTS set_blog_comments_updated_at ON public.blog_comments;

CREATE TRIGGER set_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for blog_comments (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON public.blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON public.blog_comments(created_at DESC);

-- ============================================
-- PART 8: TUTORIALS TABLE
-- ============================================

-- Create tutorials table (with failsafe)
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration INTEGER DEFAULT 30,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  icon TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security for tutorials (idempotent)
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Anyone can read published tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admins can insert tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admins can update tutorials" ON public.tutorials;
DROP POLICY IF EXISTS "Admins can delete tutorials" ON public.tutorials;

-- Create policies for tutorials table
-- Everyone can read published tutorials
CREATE POLICY "Anyone can read published tutorials"
  ON public.tutorials
  FOR SELECT
  USING (published = TRUE);

-- Note: Admins policies use is_admin() function (created in PART 17) to avoid recursion

-- Authenticated users (admins) can insert tutorials
CREATE POLICY "Admins can insert tutorials"
  ON public.tutorials
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tutorials
CREATE POLICY "Admins can update tutorials"
  ON public.tutorials
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins can delete tutorials
CREATE POLICY "Admins can delete tutorials"
  ON public.tutorials
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================
-- PART 9: TUTORIALS TABLE TRIGGERS
-- ============================================

-- Drop tutorials trigger if it exists (failsafe - must be after table creation)
DROP TRIGGER IF EXISTS set_tutorials_updated_at ON public.tutorials;

-- Create trigger for tutorials updated_at
CREATE TRIGGER set_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 10: TUTORIALS TABLE INDEXES
-- ============================================

-- Create indexes for tutorials (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON public.tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON public.tutorials(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_level ON public.tutorials(level);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON public.tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_author_id ON public.tutorials(author_id);
-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tutorials_tags ON public.tutorials USING GIN(tags);

-- ============================================
-- PART 11: TUTORIAL PAGES TABLE
-- ============================================

-- Create tutorial_pages table (with failsafe)
CREATE TABLE IF NOT EXISTS public.tutorial_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.tutorials_category(category_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image_url TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  page_order INTEGER DEFAULT 0,
  read_time INTEGER DEFAULT 5,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security for tutorial_pages (idempotent)
ALTER TABLE public.tutorial_pages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Anyone can read published tutorial pages" ON public.tutorial_pages;
DROP POLICY IF EXISTS "Admins can insert tutorial pages" ON public.tutorial_pages;
DROP POLICY IF EXISTS "Admins can update tutorial pages" ON public.tutorial_pages;
DROP POLICY IF EXISTS "Admins can delete tutorial pages" ON public.tutorial_pages;

-- Create policies for tutorial_pages table
-- Everyone can read published tutorial pages
CREATE POLICY "Anyone can read published tutorial pages"
  ON public.tutorial_pages
  FOR SELECT
  USING (published = TRUE);

-- Note: Admins policies use is_admin() function (created in PART 17) to avoid recursion

-- Authenticated users (admins) can insert tutorial pages
CREATE POLICY "Admins can insert tutorial pages"
  ON public.tutorial_pages
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tutorial pages
CREATE POLICY "Admins can update tutorial pages"
  ON public.tutorial_pages
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins can delete tutorial pages
CREATE POLICY "Admins can delete tutorial pages"
  ON public.tutorial_pages
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================
-- PART 12: TUTORIAL PAGES TABLE TRIGGERS
-- ============================================

-- Drop tutorial_pages trigger if it exists (failsafe - must be after table creation)
DROP TRIGGER IF EXISTS set_tutorial_pages_updated_at ON public.tutorial_pages;

-- Create trigger for tutorial_pages updated_at
CREATE TRIGGER set_tutorial_pages_updated_at
  BEFORE UPDATE ON public.tutorial_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 13: TUTORIAL PAGES TABLE INDEXES
-- ============================================

-- Create indexes for tutorial_pages (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_slug ON public.tutorial_pages(slug);
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_published ON public.tutorial_pages(published);
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_category_id ON public.tutorial_pages(category_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_created_at ON public.tutorial_pages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_order ON public.tutorial_pages(category_id, page_order);
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_author_id ON public.tutorial_pages(author_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_read_time ON public.tutorial_pages(read_time);
-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_tags ON public.tutorial_pages USING GIN(tags);

-- ============================================
-- PART 14: TOOLS TABLE
-- ============================================

-- Create tools table (with failsafe)
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  url TEXT NOT NULL,
  logo_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security for tools (idempotent)
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Anyone can read tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can insert tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can update tools" ON public.tools;
DROP POLICY IF EXISTS "Admins can delete tools" ON public.tools;

-- Create policies for tools table
-- Everyone can read tools
CREATE POLICY "Anyone can read tools"
  ON public.tools
  FOR SELECT
  USING (true);

-- Note: Admins policies use is_admin() function (created in PART 17) to avoid recursion

-- Authenticated users (admins) can insert tools
CREATE POLICY "Admins can insert tools"
  ON public.tools
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tools
CREATE POLICY "Admins can update tools"
  ON public.tools
  FOR UPDATE
  USING (
    public.is_admin()
  );

-- Admins can delete tools
CREATE POLICY "Admins can delete tools"
  ON public.tools
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================
-- PART 15: TOOLS TABLE TRIGGERS
-- ============================================

-- Drop tools trigger if it exists (failsafe - must be after table creation)
DROP TRIGGER IF EXISTS set_tools_updated_at ON public.tools;

-- Create trigger for tools updated_at
CREATE TRIGGER set_tools_updated_at
  BEFORE UPDATE ON public.tools
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 16: TOOLS TABLE INDEXES
-- ============================================

-- Create indexes for tools (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_tools_name ON public.tools(name);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON public.tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON public.tools(created_at DESC);
-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tools_tags ON public.tools USING GIN(tags);

-- ============================================
-- PART 17: UPDATE USERS POLICIES (FIXED - NO RECURSION)
-- ============================================
-- Note: The is_admin() function is created in PART 2 (Functions section)
-- This section only creates the admin policies that use it

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

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

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- 
-- What was created:
-- ✅ users table with RLS policies
-- ✅ blogs table with RLS policies
-- ✅ tutorials_category table with RLS policies
-- ✅ tutorial_pages table with RLS policies
-- ✅ tools table with RLS policies
-- ✅ Automatic user profile creation trigger
-- ✅ Updated timestamp triggers
-- ✅ Performance indexes
-- ✅ Admin user management policies
--
-- Next steps:
-- 1. Make a user an admin (if needed):
--    UPDATE public.users SET is_admin = TRUE WHERE email = 'your-email@example.com';
--
-- 2. Test the setup by creating a user account
--
-- 3. (Optional) Import sample data:
--    - Run 10_import_sample_blogs.sql for sample blogs
--    - Run 15_import_sample_tutorials.sql for sample tutorials
--
-- ============================================
