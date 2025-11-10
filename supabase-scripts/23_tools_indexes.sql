-- ============================================
-- Tools Table Indexes
-- ============================================
-- Run this after 22_tools_triggers.sql
-- ============================================

-- Create indexes for tools
CREATE INDEX IF NOT EXISTS idx_tools_name ON public.tools(name);
CREATE INDEX IF NOT EXISTS idx_tools_category ON public.tools(category);
CREATE INDEX IF NOT EXISTS idx_tools_is_featured ON public.tools(is_featured);
CREATE INDEX IF NOT EXISTS idx_tools_created_at ON public.tools(created_at DESC);
-- GIN index for array tags column for efficient tag searches
CREATE INDEX IF NOT EXISTS idx_tools_tags ON public.tools USING GIN(tags);

