<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Interactive Tutorials
          </h1>
          <p class="text-xl text-text-secondary mb-8">
            Learn by doing with hands-on tutorials and code playgrounds
          </p>
        </div>
      </div>
    </section>

    <!-- Categories and Pages -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div v-if="loading" class="space-y-12">
          <div v-for="n in 3" :key="n" class="animate-pulse">
            <div class="h-8 bg-bg-tertiary rounded w-1/4 mb-6"></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="m in 3" :key="m" class="h-24 bg-bg-tertiary rounded"></div>
            </div>
          </div>
        </div>

        <div v-else class="space-y-12">
          <div v-for="category in categories" :key="category.category_id" class="mb-12">
            <!-- Category Header -->
            <div class="flex items-center space-x-3 mb-6">
              <span class="text-3xl">{{ category.icon || '📚' }}</span>
              <div>
                <h2 class="text-2xl font-bold text-text-primary">{{ category.title }}</h2>
                <p class="text-text-secondary">{{ category.description }}</p>
                <div class="flex items-center space-x-4 mt-2 text-sm text-text-tertiary">
                  <span>{{ category.level }}</span>
                  <span>•</span>
                  <span>{{ category.duration }} min</span>
                </div>
              </div>
                </div>

            <!-- Pages Grid -->
            <div v-if="getCategoryPages(category.category_id).length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <HIGCard
                v-for="page in getCategoryPages(category.category_id)"
                :key="page.id"
                class="hover:shadow-hig-lg transition-shadow cursor-pointer"
                @click="openPage(category, page)"
              >
                <div class="p-6">
                  <div class="flex items-start justify-between mb-3">
                    <h3 class="text-lg font-semibold text-text-primary flex-1">
                      {{ page.title }}
                </h3>
                  <span
                      v-if="page.published"
                      class="ml-2 px-2 py-1 rounded text-xs font-medium bg-success-500/20 text-success-500"
                  >
                      Published
                  </span>
                  </div>
                  <div class="text-sm text-text-tertiary mb-3">
                    Page {{ page.page_order + 1 }}
                  </div>
                  <div class="text-sm text-text-secondary line-clamp-2">
                    {{ getPagePreview(page) }}
                  </div>
                </div>
              </HIGCard>
            </div>
            <HIGCard v-else>
              <div class="p-6 text-center py-12 text-text-secondary">
                <p>No pages available for this category yet.</p>
              </div>
            </HIGCard>
          </div>

          <HIGCard v-if="categories.length === 0">
            <div class="p-6 text-center py-12 text-text-secondary">
              <p>No tutorial categories available yet.</p>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import HIGCard from '../components/hig/HIGCard.vue'
import { supabase } from '../supabase'

const router = useRouter()
const loading = ref(true)
const categories = ref<any[]>([])
const pages = ref<any[]>([])

// Dummy data - will be replaced with real data from Supabase
const dummyCategories = [
  {
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Vue 3 Basics',
    description: 'Learn the fundamentals of Vue 3 including components, reactivity, and directives.',
    level: 'Beginner',
    duration: 30,
    icon: '📚',
    slug: 'vue-3-basics'
  },
  {
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'TypeScript for Vue',
    description: 'Master TypeScript integration with Vue 3 for type-safe applications.',
    level: 'Intermediate',
    duration: 45,
    icon: '🔷',
    slug: 'typescript-vue'
  },
  {
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'State Management with Vuex',
    description: 'Understand how to manage application state using Vuex in Vue 3.',
    level: 'Intermediate',
    duration: 40,
    icon: '🗄️',
    slug: 'state-management'
  }
]

const dummyPages = [
  // Vue 3 Basics pages
  {
    id: 'vue-3-basics-1',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Introduction to Vue 3: Getting Started with the Composition API',
    slug: 'introduction-to-vue-3-getting-started',
    content: 'This page should cover: What is Vue 3, why use it, installation and setup, creating your first component, understanding the Composition API basics.',
    page_order: 0,
    published: true
  },
  {
    id: 'vue-3-basics-2',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Understanding Reactivity: ref(), reactive(), and computed()',
    slug: 'understanding-reactivity-ref-reactive-computed',
    content: 'This page should cover: How Vue 3 reactivity works, using ref() for primitive values, using reactive() for objects, computed properties, watch and watchEffect.',
    page_order: 1,
    published: true
  },
  {
    id: 'vue-3-basics-3',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Components and Props: Building Reusable UI Elements',
    slug: 'components-and-props-building-reusable-ui',
    content: 'This page should cover: Creating components, passing props, prop validation, emitting events, component communication patterns.',
    page_order: 2,
    published: true
  },
  {
    id: 'vue-3-basics-4',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Directives and Template Syntax: v-if, v-for, v-bind, and More',
    slug: 'directives-and-template-syntax',
    content: 'This page should cover: Template syntax basics, conditional rendering with v-if/v-show, list rendering with v-for, binding attributes with v-bind, event handling with v-on.',
    page_order: 3,
    published: true
  },
  {
    id: 'vue-3-basics-5',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Lifecycle Hooks: Understanding Component Lifecycle',
    slug: 'lifecycle-hooks-understanding-component-lifecycle',
    content: 'This page should cover: onMounted, onUpdated, onUnmounted, onBeforeMount, onBeforeUpdate, onBeforeUnmount, when to use each hook.',
    page_order: 4,
    published: true
  },
  {
    id: 'vue-3-basics-6',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Event Handling: v-on, Event Modifiers, and Custom Events',
    slug: 'event-handling-v-on-event-modifiers-custom-events',
    content: 'This page should cover: Handling click events, keyboard events, form events, event modifiers (.stop, .prevent, .once), custom events with $emit, event payloads, listening to events in parent components.',
    page_order: 5,
    published: true
  },
  {
    id: 'vue-3-basics-7',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Form Handling: Two-Way Data Binding with v-model',
    slug: 'form-handling-two-way-data-binding-v-model',
    content: 'This page should cover: Using v-model for input, textarea, select, checkbox, radio buttons, v-model modifiers (.lazy, .number, .trim), custom v-model in components, form validation basics.',
    page_order: 6,
    published: true
  },
  {
    id: 'vue-3-basics-8',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Computed Properties and Watchers: Reactive Data Transformations',
    slug: 'computed-properties-watchers-reactive-data-transformations',
    content: 'This page should cover: When to use computed vs methods, computed property caching, watch() for side effects, watchEffect() for automatic tracking, deep watching, watching multiple sources.',
    page_order: 7,
    published: true
  },
  {
    id: 'vue-3-basics-9',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Slots: Flexible Component Composition',
    slug: 'slots-flexible-component-composition',
    content: 'This page should cover: Default slots, named slots, scoped slots, slot props, slot fallback content, when to use slots vs props.',
    page_order: 8,
    published: true
  },
  {
    id: 'vue-3-basics-10',
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Dynamic Components and Keep-Alive: Switching Between Components',
    slug: 'dynamic-components-keep-alive-switching-between-components',
    content: 'This page should cover: Using :is directive for dynamic components, component switching, keep-alive for component state preservation, include/exclude props, lifecycle hooks with keep-alive.',
    page_order: 9,
    published: true
  },
  // TypeScript for Vue pages
  {
    id: 'typescript-vue-1',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Setting Up TypeScript in a Vue 3 Project',
    slug: 'setting-up-typescript-in-vue-3-project',
    content: 'This page should cover: Installing TypeScript, configuring tsconfig.json, setting up Vite with TypeScript, type checking setup, IDE configuration.',
    page_order: 0,
    published: true
  },
  {
    id: 'typescript-vue-2',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Typing Components: defineComponent and Component Props',
    slug: 'typing-components-definecomponent-and-props',
    content: 'This page should cover: Using defineComponent, typing props with interfaces, optional and required props, default values, prop validation with TypeScript.',
    page_order: 1,
    published: true
  },
  {
    id: 'typescript-vue-3',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Composition API with TypeScript: Type-Safe Reactive State',
    slug: 'composition-api-with-typescript-type-safe-reactive-state',
    content: 'This page should cover: Typing ref() and reactive(), typing computed properties, typing functions and methods, generic types in composition functions.',
    page_order: 2,
    published: true
  },
  {
    id: 'typescript-vue-4',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Type Inference and Type Guards in Vue Components',
    slug: 'type-inference-and-type-guards-in-vue-components',
    content: 'This page should cover: How TypeScript infers types in Vue, using type guards, narrowing types, working with union types, type assertions when needed.',
    page_order: 3,
    published: true
  },
  {
    id: 'typescript-vue-5',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Typing Emits: Type-Safe Custom Events',
    slug: 'typing-emits-type-safe-custom-events',
    content: 'This page should cover: Typing emit definitions, typed event payloads, optional and required events, using defineEmits with TypeScript, type checking emitted events.',
    page_order: 4,
    published: true
  },
  {
    id: 'typescript-vue-6',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Typing Slots: Type-Safe Slot Props and Named Slots',
    slug: 'typing-slots-type-safe-slot-props-named-slots',
    content: 'This page should cover: Typing default slots, typing named slots, typing scoped slot props, slot type inference, generic slot types.',
    page_order: 5,
    published: true
  },
  {
    id: 'typescript-vue-7',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Composables with TypeScript: Reusable Type-Safe Logic',
    slug: 'composables-with-typescript-reusable-type-safe-logic',
    content: 'This page should cover: Creating typed composables, generic composables, return type inference, typing composable parameters, sharing types between composables.',
    page_order: 6,
    published: true
  },
  {
    id: 'typescript-vue-8',
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'Type Utilities: Working with Vue Types and Helpers',
    slug: 'type-utilities-working-with-vue-types-helpers',
    content: 'This page should cover: PropType utility, ExtractPropTypes, ComponentPublicInstance, Ref types, UnwrapRef, working with template refs types.',
    page_order: 7,
    published: true
  },
  // State Management pages
  {
    id: 'state-management-1',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Introduction to Vuex: Centralized State Management',
    slug: 'introduction-to-vuex-centralized-state-management',
    content: 'This page should cover: What is Vuex, when to use it, installing Vuex 4, creating a store, state, getters, mutations, and actions basics.',
    page_order: 0,
    published: true
  },
  {
    id: 'state-management-2',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Store Structure: Organizing State, Getters, and Mutations',
    slug: 'store-structure-organizing-state-getters-mutations',
    content: 'This page should cover: Store architecture, defining state, creating getters for computed state, mutations for synchronous updates, actions for async operations.',
    page_order: 1,
    published: true
  },
  {
    id: 'state-management-3',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Modules: Splitting Your Store into Manageable Pieces',
    slug: 'modules-splitting-store-into-manageable-pieces',
    content: 'This page should cover: Why use modules, creating module structure, namespaced modules, accessing module state and actions, module organization patterns.',
    page_order: 2,
    published: true
  },
  {
    id: 'state-management-4',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Using Vuex in Components: mapState, mapGetters, and mapActions',
    slug: 'using-vuex-in-components-mapstate-mapgetters-mapactions',
    content: 'This page should cover: Accessing store in components, mapState helper, mapGetters helper, mapActions helper, using store directly in Composition API.',
    page_order: 3,
    published: true
  },
  {
    id: 'state-management-5',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Vuex with Composition API: useStore and Reactive State',
    slug: 'vuex-with-composition-api-usestore-reactive-state',
    content: 'This page should cover: Using useStore() hook, accessing state reactively, calling mutations and actions, computed properties from store, watch store changes.',
    page_order: 4,
    published: true
  },
  {
    id: 'state-management-6',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Pinia: Modern State Management for Vue 3',
    slug: 'pinia-modern-state-management-for-vue-3',
    content: 'This page should cover: What is Pinia, why use Pinia over Vuex, installing Pinia, creating stores, defining state, getters, and actions, using stores in components.',
    page_order: 5,
    published: true
  },
  {
    id: 'state-management-7',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'Pinia Stores: Setup Stores vs Options Stores',
    slug: 'pinia-stores-setup-stores-vs-options-stores',
    content: 'This page should cover: Options API style stores, Setup stores with Composition API, when to use each, store composition, sharing state between stores.',
    page_order: 6,
    published: true
  },
  {
    id: 'state-management-8',
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'State Persistence: Saving and Restoring Application State',
    slug: 'state-persistence-saving-restoring-application-state',
    content: 'This page should cover: Persisting Vuex state to localStorage, using vuex-persistedstate, Pinia persistence plugins, selective state persistence, handling state hydration.',
    page_order: 7,
    published: true
  }
]

const getCategoryPages = (categoryId: string) => {
  if (!categoryId || !pages.value || pages.value.length === 0) {
    return []
  }
  
  const matchedPages = pages.value
    .filter(page => {
      // Handle both UUID and string category_id matching
      const pageCategoryId = page.category_id?.toString() || ''
      const catId = categoryId?.toString() || ''
      return pageCategoryId === catId
    })
    .sort((a, b) => (a.page_order || 0) - (b.page_order || 0))
  
  return matchedPages
}

const getPagePreview = (page: any) => {
  if (page.content) {
    return page.content.substring(0, 150) + '...'
  }
  return 'Click to read this tutorial page.'
}

const openPage = (category: any, page: any) => {
  router.push(`/tutorials/${category.slug}/${page.slug}`)
}

const fetchCategories = async () => {
  try {
    await supabase.auth.getSession()
    const { data, error } = await supabase
      .from('tutorials_category')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
    
    // Use fetched data if available, otherwise fall back to dummy data
    if (data && data.length > 0) {
      console.log('Fetched categories from Supabase:', data.length)
      categories.value = data
    } else {
      console.log('No categories found in Supabase, using dummy data')
      categories.value = dummyCategories
    }
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    // Use dummy data if fetch fails
    console.log('Using dummy categories data due to error')
    categories.value = dummyCategories
  }
}

const fetchPages = async () => {
  try {
    await supabase.auth.getSession()
    const { data, error } = await supabase
      .from('tutorial_pages')
      .select('*')
      .eq('published', true)
      .order('page_order', { ascending: true })

    if (error) {
      console.error('Error fetching pages:', error)
      throw error
    }
    
    // Use fetched data if available, otherwise fall back to dummy data
    if (data && data.length > 0) {
      console.log('Fetched pages from Supabase:', data.length)
      pages.value = data
    } else {
      console.log('No pages found in Supabase, using dummy data')
      pages.value = dummyPages
    }
  } catch (error: any) {
    console.error('Error fetching pages:', error)
    // Use dummy data if fetch fails
    console.log('Using dummy pages data due to error')
    pages.value = dummyPages
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([fetchCategories(), fetchPages()])
  loading.value = false
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
