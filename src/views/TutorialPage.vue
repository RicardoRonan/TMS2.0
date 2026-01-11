<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="container mx-auto px-4 py-16"
    >
      <div class="max-w-4xl mx-auto">
        <div class="animate-pulse space-y-6">
          <div class="h-12 bg-bg-tertiary rounded w-3/4" />
          <div class="h-4 bg-bg-tertiary rounded w-1/4" />
          <div class="space-y-3">
            <div class="h-4 bg-bg-tertiary rounded w-full" />
            <div class="h-4 bg-bg-tertiary rounded w-full" />
            <div class="h-4 bg-bg-tertiary rounded w-5/6" />
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="container mx-auto px-4 py-16"
    >
      <div class="max-w-4xl mx-auto text-center">
        <div class="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon
            name="error"
            :size="48"
            class="text-text-tertiary"
          />
        </div>
        <h2 class="text-2xl font-bold text-text-primary mb-4">
          Page Not Found
        </h2>
        <p class="text-text-secondary mb-8">
          {{ error }}
        </p>
        <HIGButton
          variant="primary"
          @click="$router.push('/tutorials')"
        >
          Back to Tutorials
        </HIGButton>
      </div>
    </div>

    <!-- Page Content -->
    <article
      v-else-if="page"
      class="container mx-auto px-4 py-16"
    >
      <div class="max-w-4xl mx-auto">
        <!-- Admin Edit Button -->
        <div
          v-if="isAdminMode"
          class="mb-6 flex justify-end"
        >
          <HIGButton 
            variant="primary" 
            size="sm"
            class="flex items-center space-x-2"
            @click="navigateToEdit"
          >
            <Icon
              name="edit"
              :size="16"
            />
            <span>Edit Page</span>
          </HIGButton>
        </div>

        <!-- Breadcrumb -->
        <Breadcrumb :items="breadcrumbItems" />

        <!-- Header -->
        <header class="mb-12">
          <div
            v-if="category"
            class="mb-4"
          >
            <div class="flex items-center space-x-4 text-sm text-text-secondary">
              <span class="badge badge-secondary">{{ category.level }}</span>
              <span>{{ category.duration }} min</span>
            </div>
          </div>
          
          <EditableField
            v-if="isAdminMode && page"
            :model-value="page.title"
            entity-type="tutorialPage"
            :entity-id="page.id"
            field="title"
            as="input"
            input-type="text"
            wrapper-class="mb-6"
            content-class="text-4xl md:text-5xl font-bold text-text-primary"
            input-class="text-4xl md:text-5xl font-bold"
            @update:model-value="handleTitleUpdate"
          />
          <h1
            v-else
            class="text-4xl md:text-5xl font-bold text-text-primary mb-6"
          >
            {{ page.title }}
          </h1>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <div class="flex items-center space-x-2">
              <span>Page {{ page.page_order + 1 }}</span>
              <span v-if="category && totalPages > 0">of {{ totalPages }}</span>
            </div>
            <span v-if="page.created_at">{{ formatDate(page.created_at) }}</span>
          </div>
        </header>

        <!-- Page Content -->
        <div
          ref="markdownContentRef"
          class="markdown-content prose prose-invert max-w-none"
        >
          <EditableField
            v-if="isAdminMode && page"
            :model-value="page.content || ''"
            entity-type="tutorialPage"
            :entity-id="page.id"
            field="content"
            as="textarea"
            :rows="20"
            wrapper-class="mb-6"
            content-class="text-lg text-text-secondary leading-relaxed"
            input-class="text-lg text-text-secondary leading-relaxed"
            placeholder="Page content (Markdown supported)..."
            @update:model-value="handleContentUpdate"
          >
            <template #default="{ value }">
              <div 
                class="text-lg text-text-secondary leading-relaxed"
                v-html="renderMarkdown(value || '')"
              />
            </template>
          </EditableField>
          <div 
            v-else
            class="text-lg text-text-secondary leading-relaxed"
          >
            <div
              v-for="(segment, index) in contentSegments"
              :key="index"
            >
              <div 
                v-if="segment.type === 'html'"
                class="interactive-content-segment"
                v-html="segment.content"
              />
              <InteractiveBlock
                v-else-if="segment.type === 'interactive'"
                :block-id="segment.blockId"
                :tutorial-slug="tutorialSlug"
                class="interactive-content-segment"
              />
            </div>
          </div>
        </div>
        
        <!-- Scroll Indicator -->
        <ScrollIndicator :content-ref="markdownContentRef" />

        <!-- Progress Tracking Toggle -->
        <div
          v-if="currentUser"
          class="mt-8 pt-6 border-t border-border-primary"
        >
          <label class="flex items-center space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              :checked="isPageComplete"
              :disabled="isTogglingProgress || loading"
              class="w-5 h-5 rounded border-border-primary bg-bg-secondary text-primary-500 focus:ring-primary-500 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              @change="togglePageProgress"
            >
            <div class="flex-1">
              <span class="text-text-primary font-medium">
                Mark as complete
              </span>
              <p class="text-sm text-text-secondary mt-1">
                {{ isTogglingProgress ? 'Saving...' : 'Track your progress through this tutorial' }}
              </p>
            </div>
            <Icon 
              v-if="isPageComplete && !isTogglingProgress" 
              name="check" 
              :size="20" 
              class="text-primary-500"
            />
            <div
              v-if="isTogglingProgress"
              class="w-5 h-5 flex items-center justify-center"
            >
              <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </label>
        </div>

        <!-- Navigation -->
        <div class="mt-12 pt-8 border-t border-border-primary">
          <div class="flex items-center justify-between">
            <HIGButton 
              v-if="previousPage" 
              variant="secondary" 
              @click="navigateToPage(previousPage)"
            >
              ← Previous: {{ previousPage.title }}
            </HIGButton>
            <div v-else />
            
            <HIGButton
              variant="tertiary"
              @click="$router.push('/tutorials')"
            >
              Back to Tutorials
            </HIGButton>
            
            <HIGButton 
              v-if="nextPage" 
              variant="primary" 
              @click="navigateToPage(nextPage)"
            >
              Next: {{ nextPage.title }} →
            </HIGButton>
            <div v-else />
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { supabase } from '../supabase'
import HIGButton from '../components/hig/HIGButton.vue'
import Icon from '../components/Icon.vue'
import EditableField from '../components/EditableField.vue'
import Breadcrumb from '../components/Breadcrumb.vue'
import ScrollIndicator from '../components/ScrollIndicator.vue'
import { renderMarkdown, parseInteractiveBlockTokens } from '../utils/markdown'
import InteractiveBlock from '../components/InteractiveBlock.vue'
import { useAdminMode } from '../composables/useAdminMode'
import { useStore } from 'vuex'
import 'highlight.js/styles/vs2015.css'

const route = useRoute()
const router = useRouter()
const { isAdminMode } = useAdminMode()
const store = useStore()

const loading = ref(true)
const error = ref<string | null>(null)
const page = ref<any>(null)
const category = ref<any>(null)
const allPages = ref<any[]>([])
const totalPages = ref(0)
const markdownContentRef = ref<HTMLElement | null>(null)

// Tutorial progress state
const isPageComplete = ref(false)
const isTogglingProgress = ref(false)
const currentUser = computed(() => store.getters.currentUser)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

interface ContentSegment {
  type: 'html' | 'interactive'
  content?: string
  blockId?: string
}

const tutorialSlug = computed(() => {
  const categorySlug = route.params.categorySlug as string
  const pageSlug = route.params.pageSlug as string
  return categorySlug && pageSlug ? `${categorySlug}/${pageSlug}` : undefined
})

const contentSegments = computed<ContentSegment[]>(() => {
  if (!page.value?.content) {
    return [{ type: 'html', content: '<p>Content coming soon...</p>' }]
  }

  const markdown = page.value.content
  const tokens = parseInteractiveBlockTokens(markdown)
  
  if (tokens.length === 0) {
    // No interactive blocks, just render markdown
    return [{ type: 'html', content: renderMarkdown(markdown) }]
  }

  // Split markdown into segments
  const segments: ContentSegment[] = []
  let lastIndex = 0

  for (const token of tokens) {
    // Add HTML content before token
    if (token.startIndex > lastIndex) {
      const beforeContent = markdown.substring(lastIndex, token.startIndex)
      if (beforeContent.trim()) {
        segments.push({
          type: 'html',
          content: renderMarkdown(beforeContent)
        })
      }
    }

    // Add interactive block
    segments.push({
      type: 'interactive',
      blockId: token.id
    })

    lastIndex = token.endIndex
  }

  // Add remaining content after last token
  if (lastIndex < markdown.length) {
    const afterContent = markdown.substring(lastIndex)
    if (afterContent.trim()) {
      segments.push({
        type: 'html',
        content: renderMarkdown(afterContent)
      })
    }
  }

  return segments
})

const breadcrumbItems = computed(() => {
  const categorySlug = category.value?.slug
  const categoryPath = categorySlug ? `/tutorials?category=${categorySlug}` : '/tutorials'
  return [
    { label: 'Tutorials', to: '/tutorials' },
    { label: category.value?.title || 'Category', to: categoryPath },
    { label: page.value?.title || '' }
  ]
})

const currentPageIndex = computed(() => {
  if (!page.value || !allPages.value.length) return -1
  return allPages.value.findIndex(p => p.id === page.value.id)
})

const previousPage = computed(() => {
  const index = currentPageIndex.value
  if (index > 0) {
    return allPages.value[index - 1]
  }
  return null
})

const nextPage = computed(() => {
  const index = currentPageIndex.value
  if (index >= 0 && index < allPages.value.length - 1) {
    return allPages.value[index + 1]
  }
  return null
})

const navigateToPage = (targetPage: any) => {
  const categorySlug = route.params.categorySlug as string
  router.push(`/tutorials/${categorySlug}/${targetPage.slug}`)
}

// Navigate to admin edit page
const navigateToEdit = () => {
  if (page.value?.id) {
    router.push(`/admin?tab=tutorials&edit=${page.value.id}`)
  } else {
    router.push('/admin?tab=tutorials')
  }
}

// Handle title update
const handleTitleUpdate = (newTitle: string) => {
  if (page.value) {
    page.value.title = newTitle
  }
}

// Handle content update
const handleContentUpdate = (newContent: string) => {
  if (page.value) {
    page.value.content = newContent
  }
}

// Check if page is already marked as complete
const checkPageProgress = async () => {
  if (!currentUser.value?.uid || !page.value || !category.value) {
    return
  }

  try {
    // First try with tutorial_page_id (per-page tracking)
    let { data, error } = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', currentUser.value.uid)
      .eq('tutorial_category_id', category.value.category_id)
      .eq('tutorial_page_id', page.value.id)
      .eq('completed', true)
      .maybeSingle()

    // If that fails due to missing column, try without tutorial_page_id
    if (error && (error.message?.includes('tutorial_page_id') || error.code === '42703')) {
      const result = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', currentUser.value.uid)
        .eq('tutorial_category_id', category.value.category_id)
        .eq('completed', true)
        .maybeSingle()
      
      data = result.data
      error = result.error
    }

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking progress:', error)
      return
    }

    isPageComplete.value = !!data
  } catch (err) {
    console.error('Error checking page progress:', err)
  }
}

// Automatically update tutorial progress when page is viewed
const updateTutorialProgress = async () => {
  if (!currentUser.value?.uid || !page.value || !category.value) {
    return
  }

  // Wait a bit to ensure checkPageProgress has completed
  await new Promise(resolve => setTimeout(resolve, 100))

  // Don't auto-update if user has already marked it (to respect their choice)
  if (isPageComplete.value) {
    return
  }

  try {
    // First try checking with tutorial_page_id
    let existingProgress = null
    let checkError = null
    
    let result = await supabase
      .from('tutorial_progress')
      .select('*')
      .eq('user_id', currentUser.value.uid)
      .eq('tutorial_category_id', category.value.category_id)
      .eq('tutorial_page_id', page.value.id)
      .maybeSingle()
    
    existingProgress = result.data
    checkError = result.error

    // If that fails due to missing column, try without tutorial_page_id
    if (checkError && (checkError.message?.includes('tutorial_page_id') || checkError.code === '42703')) {
      const fallbackResult = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', currentUser.value.uid)
        .eq('tutorial_category_id', category.value.category_id)
        .maybeSingle()
      
      existingProgress = fallbackResult.data
      checkError = fallbackResult.error
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking progress:', checkError)
      return
    }

    // If progress doesn't exist, create it automatically
    if (!existingProgress) {
      let insertError = null
      
      // Try with tutorial_page_id first
      let insertResult = await supabase
        .from('tutorial_progress')
        .insert({
          user_id: currentUser.value.uid,
          tutorial_category_id: category.value.category_id,
          tutorial_page_id: page.value.id,
          completed: true,
          completed_at: new Date().toISOString()
        })
      
      insertError = insertResult.error

      // If insert fails due to missing column, try without tutorial_page_id
      if (insertError && (insertError.message?.includes('tutorial_page_id') || insertError.code === '42703')) {
        const fallbackResult = await supabase
          .from('tutorial_progress')
          .upsert({
            user_id: currentUser.value.uid,
            tutorial_category_id: category.value.category_id,
            completed: true,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,tutorial_category_id'
          })
        
        insertError = fallbackResult.error
        
        if (insertError) {
          console.error('Error saving progress (fallback):', insertError)
        } else {
          isPageComplete.value = true
        }
      } else if (insertError) {
        console.error('Error saving progress:', insertError)
      } else {
        isPageComplete.value = true
      }
    } else if (existingProgress.completed) {
      isPageComplete.value = true
    }
  } catch (err) {
    console.error('Error updating tutorial progress:', err)
  }
}

// Toggle page progress (mark/unmark as complete)
const togglePageProgress = async (event: Event) => {
  if (!currentUser.value?.uid || !page.value || !category.value) {
    alert('Please make sure you are logged in and the page has loaded completely.')
    return
  }

  const target = event.target as HTMLInputElement
  const shouldComplete = target.checked

  isTogglingProgress.value = true
  try {
    if (shouldComplete) {
      // Mark as complete - try with tutorial_page_id first
      let result = await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: currentUser.value.uid,
          tutorial_category_id: category.value.category_id,
          tutorial_page_id: page.value.id,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,tutorial_category_id,tutorial_page_id'
        })

      let error = result.error

      // If that fails due to missing column, try without tutorial_page_id
      if (error && (error.message?.includes('tutorial_page_id') || error.code === '42703' || error.code === '42P01')) {
        const fallbackResult = await supabase
          .from('tutorial_progress')
          .upsert({
            user_id: currentUser.value.uid,
            tutorial_category_id: category.value.category_id,
            completed: true,
            completed_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,tutorial_category_id'
          })
        
        error = fallbackResult.error
        
        if (error) {
          console.error('Error saving progress (fallback):', error)
          throw error
        }
      } else if (error) {
        console.error('Error saving progress:', error)
        throw error
      }
      
      isPageComplete.value = true
    } else {
      // Unmark as complete - delete the progress entry
      // Try with tutorial_page_id first
      let result = await supabase
        .from('tutorial_progress')
        .delete()
        .eq('user_id', currentUser.value.uid)
        .eq('tutorial_category_id', category.value.category_id)
        .eq('tutorial_page_id', page.value.id)

      let error = result.error

      // If that fails, try without tutorial_page_id
      if (error && (error.message?.includes('tutorial_page_id') || error.code === '42703')) {
        const fallbackResult = await supabase
          .from('tutorial_progress')
          .delete()
          .eq('user_id', currentUser.value.uid)
          .eq('tutorial_category_id', category.value.category_id)
        
        error = fallbackResult.error
        
        if (error) {
          console.error('Error deleting progress (fallback):', error)
          throw error
        }
      } else if (error) {
        console.error('Error deleting progress:', error)
        throw error
      }
      
      isPageComplete.value = false
    }
  } catch (err: any) {
    console.error('Error toggling page progress:', err)
    // Revert checkbox state on error
    target.checked = !shouldComplete
    isPageComplete.value = !shouldComplete
    alert(`Error ${shouldComplete ? 'saving' : 'removing'} progress: ${err.message || 'Unknown error'}`)
  } finally {
    isTogglingProgress.value = false
  }
}

// Dummy data fallback
const dummyPages: Record<string, any[]> = {
  'vue-3-basics': [
    {
      id: 'vue-3-basics-1',
      category_id: 'vue-3-basics',
      title: 'Introduction to Vue 3: Getting Started with the Composition API',
      slug: 'introduction-to-vue-3-getting-started',
      content: `# Introduction to Vue 3: Getting Started with the Composition API

This page should cover:
- What is Vue 3
- Why use Vue 3
- Installation and setup
- Creating your first component
- Understanding the Composition API basics

## What is Vue 3?

Vue 3 is the latest version of the Vue.js framework, bringing improved performance, better TypeScript support, and the powerful Composition API.

## Getting Started

To get started with Vue 3, you'll need to install it using npm or yarn...`,
      page_order: 0,
      published: true
    },
    {
      id: 'vue-3-basics-2',
      category_id: 'vue-3-basics',
      title: 'Understanding Reactivity: ref(), reactive(), and computed()',
      slug: 'understanding-reactivity-ref-reactive-computed',
      content: `# Understanding Reactivity: ref(), reactive(), and computed()

This page should cover:
- How Vue 3 reactivity works
- Using ref() for primitive values
- Using reactive() for objects
- Computed properties
- watch and watchEffect

## Reactivity in Vue 3

Vue 3's reactivity system is built on JavaScript Proxies, providing a more efficient and powerful way to track changes...`,
      page_order: 1,
      published: true
    },
    {
      id: 'vue-3-basics-3',
      category_id: 'vue-3-basics',
      title: 'Components and Props: Building Reusable UI Elements',
      slug: 'components-and-props-building-reusable-ui',
      content: `# Components and Props: Building Reusable UI Elements

This page should cover:
- Creating components
- Passing props
- Prop validation
- Emitting events
- Component communication patterns

## Creating Components

Components are the building blocks of Vue applications...`,
      page_order: 2,
      published: true
    },
    {
      id: 'vue-3-basics-4',
      category_id: 'vue-3-basics',
      title: 'Directives and Template Syntax: v-if, v-for, v-bind, and More',
      slug: 'directives-and-template-syntax',
      content: `# Directives and Template Syntax: v-if, v-for, v-bind, and More

This page should cover:
- Template syntax basics
- Conditional rendering with v-if/v-show
- List rendering with v-for
- Binding attributes with v-bind
- Event handling with v-on

## Template Syntax

Vue uses a template syntax that extends HTML...`,
      page_order: 3,
      published: true
    },
    {
      id: 'vue-3-basics-5',
      category_id: 'vue-3-basics',
      title: 'Lifecycle Hooks: Understanding Component Lifecycle',
      slug: 'lifecycle-hooks-understanding-component-lifecycle',
      content: `# Lifecycle Hooks: Understanding Component Lifecycle

This page should cover:
- onMounted
- onUpdated
- onUnmounted
- onBeforeMount
- onBeforeUpdate
- onBeforeUnmount
- When to use each hook

## Component Lifecycle

Every Vue component goes through a series of lifecycle stages...`,
      page_order: 4,
      published: true
    },
    {
      id: 'vue-3-basics-6',
      category_id: 'vue-3-basics',
      title: 'Event Handling: v-on, Event Modifiers, and Custom Events',
      slug: 'event-handling-v-on-event-modifiers-custom-events',
      content: `# Event Handling: v-on, Event Modifiers, and Custom Events

This page should cover:
- Handling click events
- Keyboard events
- Form events
- Event modifiers (.stop, .prevent, .once)
- Custom events with $emit
- Event payloads
- Listening to events in parent components

## Event Handling Basics

Vue provides powerful event handling capabilities...`,
      page_order: 5,
      published: true
    },
    {
      id: 'vue-3-basics-7',
      category_id: 'vue-3-basics',
      title: 'Form Handling: Two-Way Data Binding with v-model',
      slug: 'form-handling-two-way-data-binding-v-model',
      content: `# Form Handling: Two-Way Data Binding with v-model

This page should cover:
- Using v-model for input, textarea, select
- Checkbox and radio buttons
- v-model modifiers (.lazy, .number, .trim)
- Custom v-model in components
- Form validation basics

## Two-Way Data Binding

v-model provides a convenient way to bind form inputs...`,
      page_order: 6,
      published: true
    },
    {
      id: 'vue-3-basics-8',
      category_id: 'vue-3-basics',
      title: 'Computed Properties and Watchers: Reactive Data Transformations',
      slug: 'computed-properties-watchers-reactive-data-transformations',
      content: `# Computed Properties and Watchers: Reactive Data Transformations

This page should cover:
- When to use computed vs methods
- Computed property caching
- watch() for side effects
- watchEffect() for automatic tracking
- Deep watching
- Watching multiple sources

## Computed Properties

Computed properties are cached based on their reactive dependencies...`,
      page_order: 7,
      published: true
    },
    {
      id: 'vue-3-basics-9',
      category_id: 'vue-3-basics',
      title: 'Slots: Flexible Component Composition',
      slug: 'slots-flexible-component-composition',
      content: `# Slots: Flexible Component Composition

This page should cover:
- Default slots
- Named slots
- Scoped slots
- Slot props
- Slot fallback content
- When to use slots vs props

## Understanding Slots

Slots allow you to compose components in flexible ways...`,
      page_order: 8,
      published: true
    },
    {
      id: 'vue-3-basics-10',
      category_id: 'vue-3-basics',
      title: 'Dynamic Components and Keep-Alive: Switching Between Components',
      slug: 'dynamic-components-keep-alive-switching-between-components',
      content: `# Dynamic Components and Keep-Alive: Switching Between Components

This page should cover:
- Using :is directive for dynamic components
- Component switching
- keep-alive for component state preservation
- include/exclude props
- Lifecycle hooks with keep-alive

## Dynamic Components

Vue allows you to dynamically switch between components...`,
      page_order: 9,
      published: true
    }
  ],
  'typescript-vue': [
    {
      id: 'typescript-vue-1',
      category_id: 'typescript-vue',
      title: 'Setting Up TypeScript in a Vue 3 Project',
      slug: 'setting-up-typescript-in-vue-3-project',
      content: `# Setting Up TypeScript in a Vue 3 Project

This page should cover:
- Installing TypeScript
- Configuring tsconfig.json
- Setting up Vite with TypeScript
- Type checking setup
- IDE configuration

## Installation

To add TypeScript to your Vue 3 project...`,
      page_order: 0,
      published: true
    },
    {
      id: 'typescript-vue-2',
      category_id: 'typescript-vue',
      title: 'Typing Components: defineComponent and Component Props',
      slug: 'typing-components-definecomponent-and-props',
      content: `# Typing Components: defineComponent and Component Props

This page should cover:
- Using defineComponent
- Typing props with interfaces
- Optional and required props
- Default values
- Prop validation with TypeScript

## defineComponent

The defineComponent function provides type inference for Vue components...`,
      page_order: 1,
      published: true
    },
    {
      id: 'typescript-vue-3',
      category_id: 'typescript-vue',
      title: 'Composition API with TypeScript: Type-Safe Reactive State',
      slug: 'composition-api-with-typescript-type-safe-reactive-state',
      content: `# Composition API with TypeScript: Type-Safe Reactive State

This page should cover:
- Typing ref() and reactive()
- Typing computed properties
- Typing functions and methods
- Generic types in composition functions

## Typing Reactive State

TypeScript provides excellent support for Vue's reactivity system...`,
      page_order: 2,
      published: true
    },
    {
      id: 'typescript-vue-4',
      category_id: 'typescript-vue',
      title: 'Type Inference and Type Guards in Vue Components',
      slug: 'type-inference-and-type-guards-in-vue-components',
      content: `# Type Inference and Type Guards in Vue Components

This page should cover:
- How TypeScript infers types in Vue
- Using type guards
- Narrowing types
- Working with union types
- Type assertions when needed

## Type Inference

TypeScript's type inference works seamlessly with Vue...`,
      page_order: 3,
      published: true
    },
    {
      id: 'typescript-vue-5',
      category_id: 'typescript-vue',
      title: 'Typing Emits: Type-Safe Custom Events',
      slug: 'typing-emits-type-safe-custom-events',
      content: `# Typing Emits: Type-Safe Custom Events

This page should cover:
- Typing emit definitions
- Typed event payloads
- Optional and required events
- Using defineEmits with TypeScript
- Type checking emitted events

## Typed Events

TypeScript provides excellent support for typing component events...`,
      page_order: 4,
      published: true
    },
    {
      id: 'typescript-vue-6',
      category_id: 'typescript-vue',
      title: 'Typing Slots: Type-Safe Slot Props and Named Slots',
      slug: 'typing-slots-type-safe-slot-props-named-slots',
      content: `# Typing Slots: Type-Safe Slot Props and Named Slots

This page should cover:
- Typing default slots
- Typing named slots
- Typing scoped slot props
- Slot type inference
- Generic slot types

## Typed Slots

Slots can be fully typed in TypeScript...`,
      page_order: 5,
      published: true
    },
    {
      id: 'typescript-vue-7',
      category_id: 'typescript-vue',
      title: 'Composables with TypeScript: Reusable Type-Safe Logic',
      slug: 'composables-with-typescript-reusable-type-safe-logic',
      content: `# Composables with TypeScript: Reusable Type-Safe Logic

This page should cover:
- Creating typed composables
- Generic composables
- Return type inference
- Typing composable parameters
- Sharing types between composables

## Typed Composables

Composables are a powerful pattern for code reuse...`,
      page_order: 6,
      published: true
    },
    {
      id: 'typescript-vue-8',
      category_id: 'typescript-vue',
      title: 'Type Utilities: Working with Vue Types and Helpers',
      slug: 'type-utilities-working-with-vue-types-helpers',
      content: `# Type Utilities: Working with Vue Types and Helpers

This page should cover:
- PropType utility
- ExtractPropTypes
- ComponentPublicInstance
- Ref types
- UnwrapRef
- Working with template refs types

## Vue Type Utilities

Vue provides several type utilities to help with TypeScript...`,
      page_order: 7,
      published: true
    }
  ],
  'state-management': [
    {
      id: 'state-management-1',
      category_id: 'state-management',
      title: 'Introduction to Vuex: Centralized State Management',
      slug: 'introduction-to-vuex-centralized-state-management',
      content: `# Introduction to Vuex: Centralized State Management

This page should cover:
- What is Vuex
- When to use it
- Installing Vuex 4
- Creating a store
- State, getters, mutations, and actions basics

## What is Vuex?

Vuex is a state management pattern and library for Vue.js applications...`,
      page_order: 0,
      published: true
    },
    {
      id: 'state-management-2',
      category_id: 'state-management',
      title: 'Store Structure: Organizing State, Getters, and Mutations',
      slug: 'store-structure-organizing-state-getters-mutations',
      content: `# Store Structure: Organizing State, Getters, and Mutations

This page should cover:
- Store architecture
- Defining state
- Creating getters for computed state
- Mutations for synchronous updates
- Actions for async operations

## Store Architecture

A Vuex store contains four main parts...`,
      page_order: 1,
      published: true
    },
    {
      id: 'state-management-3',
      category_id: 'state-management',
      title: 'Modules: Splitting Your Store into Manageable Pieces',
      slug: 'modules-splitting-store-into-manageable-pieces',
      content: `# Modules: Splitting Your Store into Manageable Pieces

This page should cover:
- Why use modules
- Creating module structure
- Namespaced modules
- Accessing module state and actions
- Module organization patterns

## Why Modules?

As your application grows, your Vuex store can become large...`,
      page_order: 2,
      published: true
    },
    {
      id: 'state-management-4',
      category_id: 'state-management',
      title: 'Using Vuex in Components: mapState, mapGetters, and mapActions',
      slug: 'using-vuex-in-components-mapstate-mapgetters-mapactions',
      content: `# Using Vuex in Components: mapState, mapGetters, and mapActions

This page should cover:
- Accessing store in components
- mapState helper
- mapGetters helper
- mapActions helper
- Using store directly in Composition API

## Accessing the Store

There are several ways to access Vuex store data in components...`,
      page_order: 3,
      published: true
    },
    {
      id: 'state-management-5',
      category_id: 'state-management',
      title: 'Vuex with Composition API: useStore and Reactive State',
      slug: 'vuex-with-composition-api-usestore-reactive-state',
      content: `# Vuex with Composition API: useStore and Reactive State

This page should cover:
- Using useStore() hook
- Accessing state reactively
- Calling mutations and actions
- Computed properties from store
- Watch store changes

## Composition API Integration

Vuex works seamlessly with the Composition API...`,
      page_order: 4,
      published: true
    },
    {
      id: 'state-management-6',
      category_id: 'state-management',
      title: 'Pinia: Modern State Management for Vue 3',
      slug: 'pinia-modern-state-management-for-vue-3',
      content: `# Pinia: Modern State Management for Vue 3

This page should cover:
- What is Pinia
- Why use Pinia over Vuex
- Installing Pinia
- Creating stores
- Defining state, getters, and actions
- Using stores in components

## Introduction to Pinia

Pinia is the officially recommended state management solution for Vue 3...`,
      page_order: 5,
      published: true
    },
    {
      id: 'state-management-7',
      category_id: 'state-management',
      title: 'Pinia Stores: Setup Stores vs Options Stores',
      slug: 'pinia-stores-setup-stores-vs-options-stores',
      content: `# Pinia Stores: Setup Stores vs Options Stores

This page should cover:
- Options API style stores
- Setup stores with Composition API
- When to use each
- Store composition
- Sharing state between stores

## Store Styles

Pinia supports two styles of store definition...`,
      page_order: 6,
      published: true
    },
    {
      id: 'state-management-8',
      category_id: 'state-management',
      title: 'State Persistence: Saving and Restoring Application State',
      slug: 'state-persistence-saving-restoring-application-state',
      content: `# State Persistence: Saving and Restoring Application State

This page should cover:
- Persisting Vuex state to localStorage
- Using vuex-persistedstate
- Pinia persistence plugins
- Selective state persistence
- Handling state hydration

## State Persistence

Sometimes you need to persist application state across page reloads...`,
      page_order: 7,
      published: true
    }
  ]
}

const dummyCategories: Record<string, any> = {
  'vue-3-basics': {
    category_id: 'vue-3-basics',
    title: 'Vue 3 Basics',
    description: 'Learn the fundamentals of Vue 3 including components, reactivity, and directives.',
    level: 'Beginner',
    duration: 30,
    icon: '📚',
    slug: 'vue-3-basics'
  },
  'typescript-vue': {
    category_id: 'typescript-vue',
    title: 'TypeScript for Vue',
    description: 'Master TypeScript integration with Vue 3 for type-safe applications.',
    level: 'Intermediate',
    duration: 45,
    icon: '🔷',
    slug: 'typescript-vue'
  },
  'state-management': {
    category_id: 'state-management',
    title: 'State Management with Vuex',
    description: 'Understand how to manage application state using Vuex in Vue 3.',
    level: 'Intermediate',
    duration: 40,
    icon: '🗄️',
    slug: 'state-management'
  }
}

// Fetch tutorial page function
const fetchTutorialPage = async (categorySlug: string, pageSlug: string) => {
  try {
    // Check cache first
    const cachedPages = store.getters.getCachedData('tutorialPages')
    const cachedCategories = store.getters.getCachedData('categories')
    
    // Try to find page and category from cache
    if (cachedPages && Array.isArray(cachedPages)) {
      const cachedPage = cachedPages.find((p: any) => p.slug === pageSlug)
      if (cachedPage) {
        page.value = {
          ...cachedPage,
          created_at: cachedPage.created_at || new Date().toISOString()
        }
        
        // Find category from cache
        if (cachedCategories && Array.isArray(cachedCategories)) {
          const cachedCategory = cachedCategories.find((c: any) => c.slug === categorySlug)
          if (cachedCategory) {
            category.value = cachedCategory
          }
        }
        
        // Get all pages in category for navigation
        if (cachedPage.category_id) {
          const categoryPages = cachedPages.filter((p: any) => p.category_id === cachedPage.category_id)
          allPages.value = categoryPages.sort((a: any, b: any) => (a.page_order || 0) - (b.page_order || 0))
          totalPages.value = allPages.value.length
        }
        
        // Check and update progress if we have cached data
        if (currentUser.value?.uid && page.value && category.value) {
          // First check existing progress, then auto-update if needed
          checkPageProgress().then(() => {
            updateTutorialProgress()
          })
        }
        
        // Only show loading if we don't have cached data
        if (!page.value || !category.value) {
          loading.value = true
        } else {
          loading.value = false
        }
        
        // Fetch fresh data in background
      } else {
        loading.value = true
      }
    } else {
      loading.value = true
    }
    
    error.value = null
    
    // Fetch category
    let categoryData = null
    try {
      const { data: catData, error: catError } = await supabase
        .from('tutorials_category')
        .select('*')
        .eq('slug', categorySlug)
        .eq('published', true)
        .single()

      if (!catError && catData) {
        categoryData = catData
      }
    } catch (err) {
      // Silently fall back to dummy data
    }

    // Fetch page
    let pageData = null
    try {
      const { data: pgData, error: pgError } = await supabase
        .from('tutorial_pages')
        .select('*')
        .eq('slug', pageSlug)
        .eq('published', true)
        .single()

      if (!pgError && pgData) {
        pageData = pgData
      }
    } catch (err) {
      // Silently fall back to dummy data
    }

    // Use dummy data if fetch fails
    if (!categoryData) {
      categoryData = dummyCategories[categorySlug]
    }
    if (!pageData) {
      const dummyCategoryPages = dummyPages[categorySlug] || []
      pageData = dummyCategoryPages.find(p => p.slug === pageSlug)
    }

    if (!pageData) {
      error.value = 'Page not found'
      return
    }

    // Fetch all pages in category for navigation
    let allPagesData: any[] = []
    try {
      const { data: pagesData, error: pagesError } = await supabase
        .from('tutorial_pages')
        .select('*')
        .eq('category_id', pageData.category_id)
        .eq('published', true)
        .order('page_order', { ascending: true })

      if (!pagesError && pagesData) {
        allPagesData = pagesData
      }
    } catch (err) {
      // Silently fall back to dummy data
    }

    if (allPagesData.length === 0) {
      allPagesData = dummyPages[categorySlug] || []
    }

    category.value = categoryData
    page.value = {
      ...pageData,
      created_at: pageData.created_at || new Date().toISOString()
    }
    allPages.value = allPagesData.sort((a, b) => a.page_order - b.page_order)
    totalPages.value = allPages.value.length
    
    // Check and update progress after page is loaded
    if (currentUser.value?.uid) {
      // First check existing progress, then auto-update if needed
      await checkPageProgress()
      // Automatically mark as complete when page is viewed (if not already complete)
      await updateTutorialProgress()
    }
    
    // Update cache - add/update this page in the cached pages array
    const cachedPagesForUpdate = store.getters.getCachedData('tutorialPages') || []
    const pageIndex = cachedPagesForUpdate.findIndex((p: any) => p.id === pageData.id)
    if (pageIndex >= 0) {
      cachedPagesForUpdate[pageIndex] = pageData
    } else {
      cachedPagesForUpdate.push(pageData)
    }
    store.dispatch('setCachedData', { type: 'tutorialPages', data: cachedPagesForUpdate })
    
    // Update categories cache if needed
    if (categoryData) {
      const cachedCategories = store.getters.getCachedData('categories') || []
      const catIndex = cachedCategories.findIndex((c: any) => c.category_id === categoryData.category_id)
      if (catIndex >= 0) {
        cachedCategories[catIndex] = categoryData
      } else {
        cachedCategories.push(categoryData)
      }
      store.dispatch('setCachedData', { type: 'categories', data: cachedCategories })
    }
  } catch (err: any) {
    console.error('Error fetching tutorial page:', err)
    error.value = err.message || 'Failed to load page. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Fetch on mount
onMounted(() => {
  const categorySlug = route.params.categorySlug as string
  const pageSlug = route.params.pageSlug as string
  if (categorySlug && pageSlug) {
    fetchTutorialPage(categorySlug, pageSlug)
  } else {
    error.value = 'Invalid page URL'
    loading.value = false
  }
})

// Watch for route param changes
watch(() => [route.params.categorySlug, route.params.pageSlug], ([newCategorySlug, newPageSlug]) => {
  if (newCategorySlug && newPageSlug) {
    fetchTutorialPage(newCategorySlug as string, newPageSlug as string)
  }
})

// Handle navigation within the same component
onBeforeRouteUpdate((to, from, next) => {
  const categorySlug = to.params.categorySlug as string
  const pageSlug = to.params.pageSlug as string
  if (categorySlug && pageSlug) {
    fetchTutorialPage(categorySlug, pageSlug)
  }
  next()
})
</script>

<style scoped>
/* Markdown Content Styles */
.markdown-content {
  @apply text-text-secondary;
}

.markdown-content :deep(h1) {
  @apply text-4xl font-bold text-text-primary mt-8 mb-4;
}

.markdown-content :deep(h2) {
  @apply text-3xl font-bold text-text-primary mt-6 mb-3;
}

.markdown-content :deep(h3) {
  @apply text-2xl font-semibold text-text-primary mt-5 mb-2;
  font-family: var(--font-family-content);
}

.markdown-content :deep(h4) {
  @apply text-xl font-semibold text-text-primary mt-4 mb-2;
}

.markdown-content :deep(h5) {
  @apply text-lg font-semibold text-text-primary mt-3 mb-2;
}

.markdown-content :deep(h6) {
  @apply text-base font-semibold text-text-primary mt-3 mb-2;
}

.markdown-content :deep(p) {
  @apply mb-4 leading-relaxed;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  @apply mb-4 ml-6;
}

.markdown-content :deep(ul) {
  @apply list-disc;
}

.markdown-content :deep(ol) {
  @apply list-decimal;
}

.markdown-content :deep(li) {
  @apply mb-2;
}

.markdown-content :deep(li > p) {
  @apply mb-2;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-text-secondary bg-bg-secondary rounded-r;
}

.markdown-content :deep(a) {
  @apply text-primary-500 hover:text-primary-600 no-underline hover:underline transition-colors;
}

.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

.markdown-content :deep(code) {
  @apply bg-bg-tertiary text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply rounded-lg p-4 my-4 overflow-x-auto;
  border: 1px solid var(--color-border-primary);
  background: var(--color-bg-tertiary) !important;
}

.markdown-content :deep(pre code) {
  @apply p-0 text-sm;
  background: transparent !important;
  color: inherit;
}

.markdown-content :deep(pre code.hljs) {
  background: transparent !important;
  padding: 0;
}

.markdown-content :deep(hr) {
  @apply border-border-primary my-8;
}

.markdown-content :deep(table) {
  @apply w-full border-collapse my-4;
}

.markdown-content :deep(thead) {
  @apply bg-bg-secondary;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  @apply border border-border-primary px-4 py-2 text-left;
}

.markdown-content :deep(th) {
  @apply font-semibold text-text-primary;
}

.markdown-content :deep(td) {
  @apply text-text-secondary;
}

.markdown-content :deep(strong) {
  @apply font-semibold text-text-primary;
}

.markdown-content :deep(em) {
  @apply italic;
}
</style>

