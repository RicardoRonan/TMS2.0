-- ============================================
-- Tools Table Setup
-- ============================================
-- Run this after 19_tutorial_pages_indexes.sql
-- ============================================

-- Create tools table
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

-- Enable Row Level Security for tools
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

