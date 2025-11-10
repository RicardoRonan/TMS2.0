-- ============================================
-- Tutorial Pages Table Setup
-- ============================================
-- Run this after 14_tutorials_indexes.sql
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

