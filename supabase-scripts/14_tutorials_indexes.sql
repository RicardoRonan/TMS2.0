-- ============================================
-- Tutorials Table Indexes
-- ============================================
-- Run this after 13_tutorials_triggers.sql
-- ============================================

-- Create indexes for tutorials
CREATE INDEX IF NOT EXISTS idx_tutorials_slug ON public.tutorials(slug);
CREATE INDEX IF NOT EXISTS idx_tutorials_published ON public.tutorials(published);
CREATE INDEX IF NOT EXISTS idx_tutorials_level ON public.tutorials(level);
CREATE INDEX IF NOT EXISTS idx_tutorials_created_at ON public.tutorials(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutorials_author_id ON public.tutorials(author_id);
-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tutorials_tags ON public.tutorials USING GIN(tags);

