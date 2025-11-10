-- ============================================
-- Import Sample Tutorials
-- ============================================
-- Run this after 14_tutorials_indexes.sql
-- Optional: Only run if you want sample data
-- ============================================
-- Note: Make sure you have at least one admin user in the users table
-- You can get an admin user_id by running:
-- SELECT id FROM public.users WHERE is_admin = TRUE LIMIT 1;
-- ============================================

-- Insert sample tutorials
-- Replace 'YOUR_ADMIN_USER_ID' with an actual admin user UUID from your users table
-- Or comment out the author_id line if you want to test without author

INSERT INTO public.tutorials (
  title,
  slug,
  description,
  content,
  level,
  duration,
  tags,
  icon,
  published,
  published_at
) VALUES
(
  'Vue 3 Basics',
  'vue-3-basics',
  'Learn the fundamentals of Vue 3 including components, reactivity, and directives.',
  '# Vue 3 Basics Tutorial

This comprehensive tutorial covers the core concepts of Vue 3.

## What You''ll Learn
- Component structure
- Reactivity system
- Directives and templates
- Event handling

## Getting Started
...',
  'Beginner',
  30,
  ARRAY['Vue.js', 'Basics', 'Frontend'],
  '📚',
  TRUE,
  NOW()
),
(
  'TypeScript for Vue',
  'typescript-for-vue',
  'Master TypeScript integration with Vue 3 for type-safe applications.',
  '# TypeScript for Vue Tutorial

Learn how to build type-safe Vue applications with TypeScript.

## Topics Covered
- TypeScript setup
- Component typing
- Composition API with types
- Type inference

...',
  'Intermediate',
  45,
  ARRAY['TypeScript', 'Vue.js', 'Type Safety'],
  '🔷',
  TRUE,
  NOW()
),
(
  'State Management with Vuex',
  'state-management-with-vuex',
  'Understand how to manage application state using Vuex in Vue 3.',
  '# State Management with Vuex

Comprehensive guide to state management in Vue applications.

## Key Concepts
- Store structure
- Mutations and actions
- Getters
- Modules

...',
  'Intermediate',
  40,
  ARRAY['Vuex', 'State Management', 'Vue.js'],
  '🗄️',
  TRUE,
  NOW()
),
(
  'Building REST APIs',
  'building-rest-apis',
  'Learn how to build and consume RESTful APIs in your Vue applications.',
  '# Building REST APIs

Complete guide to API development and consumption.

## What You''ll Build
- RESTful endpoints
- API client setup
- Error handling
- Authentication

...',
  'Advanced',
  60,
  ARRAY['API', 'Backend', 'REST'],
  '🌐',
  TRUE,
  NOW()
),
(
  'CSS Grid Layout',
  'css-grid-layout',
  'Master CSS Grid for creating complex, responsive layouts.',
  '# CSS Grid Layout Tutorial

Learn to create beautiful, responsive layouts with CSS Grid.

## Topics
- Grid basics
- Responsive design
- Advanced techniques
- Best practices

...',
  'Beginner',
  25,
  ARRAY['CSS', 'Layout', 'Responsive Design'],
  '📐',
  TRUE,
  NOW()
),
(
  'Supabase Integration',
  'supabase-integration',
  'Integrate Supabase authentication, database, and storage in your Vue app.',
  '# Supabase Integration

Complete guide to using Supabase with Vue 3.

## Features Covered
- Authentication
- Database queries
- Real-time subscriptions
- Storage

...',
  'Intermediate',
  50,
  ARRAY['Supabase', 'Backend', 'Database'],
  '🔥',
  TRUE,
  NOW()
)
ON CONFLICT (slug) DO NOTHING;

-- Note: If you want to assign authors, uncomment and update the following:
-- UPDATE public.tutorials 
-- SET author_id = (SELECT id FROM public.users WHERE is_admin = TRUE LIMIT 1)
-- WHERE author_id IS NULL;

