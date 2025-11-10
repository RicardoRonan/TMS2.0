-- ============================================
-- Tutorials Table Setup
-- ============================================
-- Run this after 09_blogs_indexes.sql
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

