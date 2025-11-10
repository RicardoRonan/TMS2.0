-- ============================================
-- Import Tutorial Categories and Pages
-- ============================================
-- Run this after 19_tutorial_pages_indexes.sql
-- This script imports all tutorial categories and their pages
-- ============================================
-- IMPORTANT PREREQUISITES:
-- 1. Make sure the tutorials_category table exists!
--    If it doesn't exist, run 28_create_tutorials_category_table.sql first
-- 2. If your tutorial_pages table was created before the update, run:
--    30_update_tutorial_pages_table.sql to add the new columns
-- ============================================
-- Note: Make sure you have at least one admin user in the users table
-- You can get an admin user_id by running:
-- SELECT id FROM public.users WHERE is_admin = TRUE LIMIT 1;
-- ============================================

-- Insert Tutorial Categories
INSERT INTO public.tutorials_category (
  category_id,
  title,
  slug,
  description,
  level,
  duration,
  icon,
  published,
  published_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Vue 3 Basics',
  'vue-3-basics',
  'Learn the fundamentals of Vue 3 including components, reactivity, and directives.',
  'Beginner',
  30,
  '📚',
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'TypeScript for Vue',
  'typescript-vue',
  'Master TypeScript integration with Vue 3 for type-safe applications.',
  'Intermediate',
  45,
  '🔷',
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'State Management with Vuex',
  'state-management',
  'Understand how to manage application state using Vuex in Vue 3.',
  'Intermediate',
  40,
  '🗄️',
  TRUE,
  NOW()
)
ON CONFLICT (category_id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  duration = EXCLUDED.duration,
  icon = EXCLUDED.icon,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

-- Insert Tutorial Pages for Vue 3 Basics
INSERT INTO public.tutorial_pages (
  category_id,
  title,
  slug,
  content,
  page_order,
  published,
  published_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Introduction to Vue 3: Getting Started with the Composition API',
  'introduction-to-vue-3-getting-started',
  'This page should cover: What is Vue 3, why use it, installation and setup, creating your first component, understanding the Composition API basics.',
  0,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Understanding Reactivity: ref(), reactive(), and computed()',
  'understanding-reactivity-ref-reactive-computed',
  'This page should cover: How Vue 3 reactivity works, using ref() for primitive values, using reactive() for objects, computed properties, watch and watchEffect.',
  1,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Components and Props: Building Reusable UI Elements',
  'components-and-props-building-reusable-ui',
  'This page should cover: Creating components, passing props, prop validation, emitting events, component communication patterns.',
  2,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Directives and Template Syntax: v-if, v-for, v-bind, and More',
  'directives-and-template-syntax',
  'This page should cover: Template syntax basics, conditional rendering with v-if/v-show, list rendering with v-for, binding attributes with v-bind, event handling with v-on.',
  3,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Lifecycle Hooks: Understanding Component Lifecycle',
  'lifecycle-hooks-understanding-component-lifecycle',
  'This page should cover: onMounted, onUpdated, onUnmounted, onBeforeMount, onBeforeUpdate, onBeforeUnmount, when to use each hook.',
  4,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Event Handling: v-on, Event Modifiers, and Custom Events',
  'event-handling-v-on-event-modifiers-custom-events',
  'This page should cover: Handling click events, keyboard events, form events, event modifiers (.stop, .prevent, .once), custom events with $emit, event payloads, listening to events in parent components.',
  5,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Form Handling: Two-Way Data Binding with v-model',
  'form-handling-two-way-data-binding-v-model',
  'This page should cover: Using v-model for input, textarea, select, checkbox, radio buttons, v-model modifiers (.lazy, .number, .trim), custom v-model in components, form validation basics.',
  6,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Computed Properties and Watchers: Reactive Data Transformations',
  'computed-properties-watchers-reactive-data-transformations',
  'This page should cover: When to use computed vs methods, computed property caching, watch() for side effects, watchEffect() for automatic tracking, deep watching, watching multiple sources.',
  7,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Slots: Flexible Component Composition',
  'slots-flexible-component-composition',
  'This page should cover: Default slots, named slots, scoped slots, slot props, slot fallback content, when to use slots vs props.',
  8,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440001'::UUID,
  'Dynamic Components and Keep-Alive: Switching Between Components',
  'dynamic-components-keep-alive-switching-between-components',
  'This page should cover: Using :is directive for dynamic components, component switching, keep-alive for component state preservation, include/exclude props, lifecycle hooks with keep-alive.',
  9,
  TRUE,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  page_order = EXCLUDED.page_order,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

-- Insert Tutorial Pages for TypeScript for Vue
INSERT INTO public.tutorial_pages (
  category_id,
  title,
  slug,
  content,
  page_order,
  published,
  published_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Setting Up TypeScript in a Vue 3 Project',
  'setting-up-typescript-in-vue-3-project',
  'This page should cover: Installing TypeScript, configuring tsconfig.json, setting up Vite with TypeScript, type checking setup, IDE configuration.',
  0,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Typing Components: defineComponent and Component Props',
  'typing-components-definecomponent-and-props',
  'This page should cover: Using defineComponent, typing props with interfaces, optional and required props, default values, prop validation with TypeScript.',
  1,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Composition API with TypeScript: Type-Safe Reactive State',
  'composition-api-with-typescript-type-safe-reactive-state',
  'This page should cover: Typing ref() and reactive(), typing computed properties, typing functions and methods, generic types in composition functions.',
  2,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Type Inference and Type Guards in Vue Components',
  'type-inference-and-type-guards-in-vue-components',
  'This page should cover: How TypeScript infers types in Vue, using type guards, narrowing types, working with union types, type assertions when needed.',
  3,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Typing Emits: Type-Safe Custom Events',
  'typing-emits-type-safe-custom-events',
  'This page should cover: Typing emit definitions, typed event payloads, optional and required events, using defineEmits with TypeScript, type checking emitted events.',
  4,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Typing Slots: Type-Safe Slot Props and Named Slots',
  'typing-slots-type-safe-slot-props-named-slots',
  'This page should cover: Typing default slots, typing named slots, typing scoped slot props, slot type inference, generic slot types.',
  5,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Composables with TypeScript: Reusable Type-Safe Logic',
  'composables-with-typescript-reusable-type-safe-logic',
  'This page should cover: Creating typed composables, generic composables, return type inference, typing composable parameters, sharing types between composables.',
  6,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440002'::UUID,
  'Type Utilities: Working with Vue Types and Helpers',
  'type-utilities-working-with-vue-types-helpers',
  'This page should cover: PropType utility, ExtractPropTypes, ComponentPublicInstance, Ref types, UnwrapRef, working with template refs types.',
  7,
  TRUE,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  page_order = EXCLUDED.page_order,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

-- Insert Tutorial Pages for State Management
INSERT INTO public.tutorial_pages (
  category_id,
  title,
  slug,
  content,
  page_order,
  published,
  published_at
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Introduction to Vuex: Centralized State Management',
  'introduction-to-vuex-centralized-state-management',
  'This page should cover: What is Vuex, when to use it, installing Vuex 4, creating a store, state, getters, mutations, and actions basics.',
  0,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Store Structure: Organizing State, Getters, and Mutations',
  'store-structure-organizing-state-getters-mutations',
  'This page should cover: Store architecture, defining state, creating getters for computed state, mutations for synchronous updates, actions for async operations.',
  1,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Modules: Splitting Your Store into Manageable Pieces',
  'modules-splitting-store-into-manageable-pieces',
  'This page should cover: Why use modules, creating module structure, namespaced modules, accessing module state and actions, module organization patterns.',
  2,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Using Vuex in Components: mapState, mapGetters, and mapActions',
  'using-vuex-in-components-mapstate-mapgetters-mapactions',
  'This page should cover: Accessing store in components, mapState helper, mapGetters helper, mapActions helper, using store directly in Composition API.',
  3,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Vuex with Composition API: useStore and Reactive State',
  'vuex-with-composition-api-usestore-reactive-state',
  'This page should cover: Using useStore() hook, accessing state reactively, calling mutations and actions, computed properties from store, watch store changes.',
  4,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Pinia: Modern State Management for Vue 3',
  'pinia-modern-state-management-for-vue-3',
  'This page should cover: What is Pinia, why use Pinia over Vuex, installing Pinia, creating stores, defining state, getters, and actions, using stores in components.',
  5,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'Pinia Stores: Setup Stores vs Options Stores',
  'pinia-stores-setup-stores-vs-options-stores',
  'This page should cover: Options API style stores, Setup stores with Composition API, when to use each, store composition, sharing state between stores.',
  6,
  TRUE,
  NOW()
),
(
  '550e8400-e29b-41d4-a716-446655440003'::UUID,
  'State Persistence: Saving and Restoring Application State',
  'state-persistence-saving-restoring-application-state',
  'This page should cover: Persisting Vuex state to localStorage, using vuex-persistedstate, Pinia persistence plugins, selective state persistence, handling state hydration.',
  7,
  TRUE,
  NOW()
)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  page_order = EXCLUDED.page_order,
  published = EXCLUDED.published,
  published_at = EXCLUDED.published_at;

-- Note: If you want to assign authors to categories, uncomment and update the following:
-- UPDATE public.tutorials_category 
-- SET author_id = (SELECT id FROM public.users WHERE is_admin = TRUE LIMIT 1)
-- WHERE author_id IS NULL;

