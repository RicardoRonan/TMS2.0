-- Database Schema for Interactive Tutorial Exercises
-- This file documents the required database schema changes
-- Execute these migrations in your Supabase SQL editor

-- 1. Update tutorial_pages table
ALTER TABLE tutorial_pages 
ADD COLUMN IF NOT EXISTS page_type TEXT DEFAULT 'content' CHECK (page_type IN ('content', 'qa', 'mini_project', 'capstone')),
ADD COLUMN IF NOT EXISTS exercise_config JSONB;

-- Create index for page_type
CREATE INDEX IF NOT EXISTS idx_tutorial_pages_page_type ON tutorial_pages(page_type);

-- 2. Create tutorial_exercises table
CREATE TABLE IF NOT EXISTS tutorial_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_page_id UUID NOT NULL REFERENCES tutorial_pages(id) ON DELETE CASCADE,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('code_editor', 'multiple_choice', 'text_input', 'mixed')),
  language TEXT DEFAULT 'javascript',
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB DEFAULT '[]'::jsonb,
  instructions TEXT NOT NULL,
  hints JSONB DEFAULT '[]'::jsonb,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutorial_exercises_page_id ON tutorial_exercises(tutorial_page_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_exercises_type ON tutorial_exercises(exercise_type);

-- 3. Create tutorial_qa_questions table
CREATE TABLE IF NOT EXISTS tutorial_qa_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_page_id UUID NOT NULL REFERENCES tutorial_pages(id) ON DELETE CASCADE,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'text_input', 'code')),
  question_text TEXT NOT NULL,
  options JSONB, -- For multiple choice: [{"value": "A", "text": "Option A"}, ...]
  correct_answer TEXT, -- For text_input and code
  correct_answers JSONB, -- For multiple choice: ["A", "B"] or single answer
  explanation TEXT,
  points INTEGER DEFAULT 5,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutorial_qa_questions_page_id ON tutorial_qa_questions(tutorial_page_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_qa_questions_order ON tutorial_qa_questions(tutorial_page_id, order_index);

-- 4. Create tutorial_exercise_submissions table
CREATE TABLE IF NOT EXISTS tutorial_exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_page_id UUID NOT NULL REFERENCES tutorial_pages(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES tutorial_exercises(id) ON DELETE SET NULL,
  question_id UUID REFERENCES tutorial_qa_questions(id) ON DELETE SET NULL,
  submission_code TEXT,
  submission_answer TEXT, -- For text_input and multiple_choice
  test_results JSONB DEFAULT '[]'::jsonb,
  passed BOOLEAN DEFAULT FALSE,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  attempts INTEGER DEFAULT 1
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tutorial_exercise_submissions_user_id ON tutorial_exercise_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_exercise_submissions_page_id ON tutorial_exercise_submissions(tutorial_page_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_exercise_submissions_exercise_id ON tutorial_exercise_submissions(exercise_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_exercise_submissions_question_id ON tutorial_exercise_submissions(question_id);
CREATE INDEX IF NOT EXISTS idx_tutorial_exercise_submissions_user_page ON tutorial_exercise_submissions(user_id, tutorial_page_id);

-- Enable Row Level Security (RLS)
ALTER TABLE tutorial_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_qa_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_exercise_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutorial_exercises (read-only for authenticated users)
CREATE POLICY "Users can view exercises" ON tutorial_exercises
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage exercises" ON tutorial_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
    )
  );

-- RLS Policies for tutorial_qa_questions (read-only for authenticated users)
CREATE POLICY "Users can view QA questions" ON tutorial_qa_questions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage QA questions" ON tutorial_qa_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
    )
  );

-- RLS Policies for tutorial_exercise_submissions
CREATE POLICY "Users can view their own submissions" ON tutorial_exercise_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own submissions" ON tutorial_exercise_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own submissions" ON tutorial_exercise_submissions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all submissions" ON tutorial_exercise_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_user_meta_data->>'isAdmin')::boolean = true
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_tutorial_exercises_updated_at
  BEFORE UPDATE ON tutorial_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutorial_qa_questions_updated_at
  BEFORE UPDATE ON tutorial_qa_questions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

