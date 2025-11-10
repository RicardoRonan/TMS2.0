-- ============================================
-- Complete Tutorial System Setup
-- ============================================
-- This script combines all tutorial-related SQL scripts into one file
-- Run this after: 09_blogs_indexes.sql (or after your blogs setup)
-- ============================================
-- PREREQUISITES:
-- 1. Users table must exist (01_users_table.sql)
-- 2. is_admin() function must exist (00_create_is_admin_function.sql)
-- 3. handle_updated_at() function must exist (04_updated_at_function.sql)
-- ============================================

-- ============================================
-- PART 1: TUTORIALS TABLE
-- ============================================

-- Create tutorials table
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

-- Enable Row Level Security for tutorials
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
-- PART 2: TUTORIALS TABLE TRIGGERS
-- ============================================

-- Drop tutorials trigger if it exists (failsafe)
DROP TRIGGER IF EXISTS set_tutorials_updated_at ON public.tutorials;

-- Create trigger for tutorials updated_at
CREATE TRIGGER set_tutorials_updated_at
  BEFORE UPDATE ON public.tutorials
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 3: TUTORIALS TABLE INDEXES
-- ============================================

-- Create indexes for tutorials
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON public.tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON public.tutorials(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_level ON public.tutorials(level);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON public.tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_author_id ON public.tutorials(author_id);
-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tutorials_tags ON public.tutorials USING GIN(tags);

-- ============================================
-- PART 4: TUTORIALS CATEGORY TABLE
-- ============================================
-- This must be created BEFORE tutorial_pages table
-- ============================================

-- Create tutorials_category table
CREATE TABLE IF NOT EXISTS public.tutorials_category (
  category_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')),
  duration INTEGER DEFAULT 30,
  icon TEXT,
  author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Enable Row Level Security for tutorials_category
ALTER TABLE public.tutorials_category ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (failsafe)
DROP POLICY IF EXISTS "Anyone can read published tutorial categories" ON public.tutorials_category;
DROP POLICY IF EXISTS "Admins can read all tutorial categories" ON public.tutorials_category;
DROP POLICY IF EXISTS "Admins can insert tutorial categories" ON public.tutorials_category;
DROP POLICY IF EXISTS "Admins can update tutorial categories" ON public.tutorials_category;
DROP POLICY IF EXISTS "Admins can delete tutorial categories" ON public.tutorials_category;

-- Create policies for tutorials_category table
-- Everyone can read published tutorial categories
CREATE POLICY "Anyone can read published tutorial categories"
  ON public.tutorials_category
  FOR SELECT
  USING (published = TRUE);

-- Admins can read all tutorial categories (including drafts)
CREATE POLICY "Admins can read all tutorial categories"
  ON public.tutorials_category
  FOR SELECT
  USING (
    public.is_admin()
  );

-- Authenticated users (admins) can insert tutorial categories
CREATE POLICY "Admins can insert tutorial categories"
  ON public.tutorials_category
  FOR INSERT
  WITH CHECK (
    public.is_admin()
  );

-- Admins can update tutorial categories
CREATE POLICY "Admins can update tutorial categories"
  ON public.tutorials_category
  FOR UPDATE
  USING (
    public.is_admin()
  )
  WITH CHECK (
    public.is_admin()
  );

-- Admins can delete tutorial categories
CREATE POLICY "Admins can delete tutorial categories"
  ON public.tutorials_category
  FOR DELETE
  USING (
    public.is_admin()
  );

-- ============================================
-- PART 5: TUTORIALS CATEGORY TABLE TRIGGERS
-- ============================================

-- Drop tutorials_category trigger if it exists (failsafe)
DROP TRIGGER IF EXISTS set_tutorials_category_updated_at ON public.tutorials_category;

-- Create trigger for tutorials_category updated_at
CREATE TRIGGER set_tutorials_category_updated_at
  BEFORE UPDATE ON public.tutorials_category
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 6: TUTORIALS CATEGORY TABLE INDEXES
-- ============================================

-- Create indexes for tutorials_category
CREATE INDEX IF NOT EXISTS idx_tutorials_category_slug ON public.tutorials_category(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_published ON public.tutorials_category(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_level ON public.tutorials_category(level);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_created_at ON public.tutorials_category(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_author_id ON public.tutorials_category(author_id);

-- ============================================
-- PART 7: TUTORIAL PAGES TABLE
-- ============================================

-- Create tutorial_pages table
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

-- Enable Row Level Security for tutorial_pages
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
-- PART 8: TUTORIAL PAGES TABLE TRIGGERS
-- ============================================

-- Drop tutorial_pages trigger if it exists (failsafe)
DROP TRIGGER IF EXISTS set_tutorial_pages_updated_at ON public.tutorial_pages;

-- Create trigger for tutorial_pages updated_at
CREATE TRIGGER set_tutorial_pages_updated_at
  BEFORE UPDATE ON public.tutorial_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- PART 9: TUTORIAL PAGES TABLE INDEXES
-- ============================================

-- Create indexes for tutorial_pages
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
-- PART 10: MIGRATION - ADD MISSING COLUMNS (IF NEEDED)
-- ============================================
-- This section ensures all columns exist even if table was created with old structure
-- Safe to run multiple times (uses IF NOT EXISTS)
-- ============================================

-- Add author_id column to tutorial_pages (if it doesn't exist)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add excerpt column to tutorial_pages (if it doesn't exist)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Add featured_image_url column to tutorial_pages (if it doesn't exist)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Add read_time column to tutorial_pages (if it doesn't exist)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5;

-- Add tags column to tutorial_pages (if it doesn't exist)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- 
-- What was created:
-- ✅ tutorials table with RLS policies, triggers, and indexes
-- ✅ tutorials_category table with RLS policies, triggers, and indexes
-- ✅ tutorial_pages table with RLS policies, triggers, and indexes
-- ✅ All columns including: author_id, excerpt, featured_image_url, read_time, tags
-- ✅ All necessary indexes for performance
-- 
-- Next steps:
-- 1. Import sample data (optional):
--    - Run 29_import_tutorial_categories_and_pages.sql for sample categories and pages
-- 
-- 2. Test the setup by creating a tutorial category and page in the admin panel
--
-- ============================================

