-- ============================================
-- Add author_id column to blogs table
-- ============================================
-- Run this if your blogs table was created without the author_id column
-- Safe to run multiple times
-- ============================================

-- Step 1: Add author_id column (without constraint first)
ALTER TABLE public.blogs 
ADD COLUMN IF NOT EXISTS author_id UUID;

-- Step 2: Add foreign key constraint if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_schema = 'public' 
      AND tc.table_name = 'blogs'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.column_name = 'author_id'
  ) THEN
    ALTER TABLE public.blogs 
    ADD CONSTRAINT blogs_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES public.users(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Step 3: Create index for author_id
CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON public.blogs(author_id);

