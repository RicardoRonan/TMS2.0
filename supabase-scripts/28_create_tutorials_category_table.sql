-- ============================================
-- Tutorials Category Table Setup
-- ============================================
-- Run this after 14_tutorials_indexes.sql and BEFORE 16_tutorial_pages_table.sql
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
-- Tutorials Category Table Triggers
-- ============================================

-- Drop tutorials_category trigger if it exists (failsafe - must be after table creation)
DROP TRIGGER IF EXISTS set_tutorials_category_updated_at ON public.tutorials_category;

-- Create trigger for tutorials_category updated_at
CREATE TRIGGER set_tutorials_category_updated_at
  BEFORE UPDATE ON public.tutorials_category
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- Tutorials Category Table Indexes
-- ============================================

-- Create indexes for tutorials_category (IF NOT EXISTS is failsafe)
CREATE INDEX IF NOT EXISTS idx_tutorials_category_slug ON public.tutorials_category(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_published ON public.tutorials_category(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_level ON public.tutorials_category(level);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_created_at ON public.tutorials_category(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_category_author_id ON public.tutorials_category(author_id);

