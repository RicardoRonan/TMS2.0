-- ============================================
-- Blog Likes Table Setup
-- ============================================
-- Run this after blogs table is created
-- ============================================

-- Create blog_likes table
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(blog_id, user_id)
);

-- Enable Row Level Security for blog_likes
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

-- Create indexes for blog_likes
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_user ON public.blog_likes(blog_id, user_id);

