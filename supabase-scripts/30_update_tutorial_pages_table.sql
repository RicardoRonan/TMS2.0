-- ============================================
-- Update Tutorial Pages Table
-- ============================================
-- Run this after 19_tutorial_pages_indexes.sql
-- This script adds additional columns to the tutorial_pages table
-- ============================================

-- Add author_id column (to track who created the page)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add excerpt column (for preview text/summary)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS excerpt TEXT;

-- Add featured_image_url column (for optional page image)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS featured_image_url TEXT;

-- Add read_time column (estimated reading time in minutes)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS read_time INTEGER DEFAULT 5;

-- Add tags column (for categorization and search)
ALTER TABLE public.tutorial_pages
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Create index for author_id
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_author_id ON public.tutorial_pages(author_id);

-- Create index for read_time (useful for filtering/sorting)
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_read_time ON public.tutorial_pages(read_time);

-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_tags ON public.tutorial_pages USING GIN(tags);

-- ============================================
-- Update Complete
-- ============================================
-- Added columns:
-- ✅ author_id - References users table
-- ✅ excerpt - Text preview/summary
-- ✅ featured_image_url - Optional page image
-- ✅ read_time - Estimated reading time (default: 5 minutes)
-- ✅ tags - Array of tags for categorization
-- 
-- Added indexes:
-- ✅ idx_tutorial_pages_author_id
-- ✅ idx_tutorial_pages_read_time
-- ✅ idx_tutorial_pages_tags (GIN index for array searches)
-- ============================================

