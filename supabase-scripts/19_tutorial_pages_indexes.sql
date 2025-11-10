-- ============================================
-- Tutorial Pages Table Indexes
-- ============================================
-- Run this after 18_tutorial_pages_triggers.sql
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

