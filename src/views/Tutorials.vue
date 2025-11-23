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

    <!-- Categories and Pages View -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <div v-if="loading" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <HIGSkeleton v-for="n in 8" :key="n" type="tutorial-category" />
        </div>

        <!-- Category Detail View (when a category is selected) -->
        <div v-else-if="selectedCategory" class="max-w-4xl mx-auto">
          <!-- Breadcrumb -->
          <Breadcrumb :items="breadcrumbItems" />
          
          <h2 class="text-3xl font-bold text-text-primary mb-8">{{ selectedCategory.title }}</h2>
          <div class="space-y-2">
            <a
              v-for="(page, index) in getCategoryPages(selectedCategory.category_id)"
              :key="page.id"
              @click.prevent="openPage(selectedCategory, page)"
              class="lesson-link"
            >
              {{ index + 1 }}. {{ page.title }}
            </a>
          </div>
        </div>

        <!-- Categories Grid View -->
        <div v-else class="space-y-12">
          <!-- Grouped by Top-Level Group -->
          <template v-for="group in topLevelGroups" :key="group.id">
            <div v-if="getGroupCategories(group.id).length > 0">
              <!-- Category Heading -->
              <h2 class="text-2xl font-bold text-text-primary mb-6">{{ group.title }}</h2>
              
              <!-- Categories Grid -->
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
                <div
                  v-for="category in getGroupCategories(group.id)"
                  :key="category.category_id"
                  @click="selectCategory(category)"
                  class="category-square"
                >
                  <FontAwesomeIcon 
                    :icon="getCategoryIcon(category.icon)" 
                    class="category-icon"
                  />
                  <h3 class="category-square-title">{{ category.title }}</h3>
                </div>
              </div>
            </div>
          </template>

          <!-- Categories without a group -->
          <div v-if="getUncategorizedCategories().length > 0">
            <h2 class="text-2xl font-bold text-text-primary mb-6">Other Tutorials</h2>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="category in getUncategorizedCategories()"
                :key="category.category_id"
                @click="selectCategory(category)"
                class="category-square"
              >
                <FontAwesomeIcon 
                  :icon="getCategoryIcon(category.icon)" 
                  class="category-icon"
                />
                <h3 class="category-square-title">{{ category.title }}</h3>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="categories.length === 0" class="text-center py-12 text-text-secondary">
            <p>No tutorial categories available yet.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Breadcrumb from '../components/Breadcrumb.vue'
import HIGSkeleton from '../components/hig/HIGSkeleton.vue'
import { 
  faBook, 
  faCode, 
  faDatabase, 
  faLaptopCode, 
  faRobot, 
  faGears,
  faGraduationCap,
  faFileCode,
  faCircleNodes
} from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../supabase'

const router = useRouter()
const store = useStore()
const loading = ref(true)
const topLevelGroups = ref<any[]>([])
const categories = ref<any[]>([])
const pages = ref<any[]>([])
const selectedCategory = ref<any>(null)

// Dummy data - will be replaced with real data from Supabase
const dummyCategories = [
  {
    category_id: '550e8400-e29b-41d4-a716-446655440001', // Vue 3 Basics UUID
    title: 'Vue 3 Basics',
    description: 'Learn the fundamentals of Vue 3 including components, reactivity, and directives.',
    level: 'Beginner',
    duration: 30,
    icon: 'book',
    slug: 'vue-3-basics'
  },
  {
    category_id: '550e8400-e29b-41d4-a716-446655440002', // TypeScript for Vue UUID
    title: 'TypeScript for Vue',
    description: 'Master TypeScript integration with Vue 3 for type-safe applications.',
    level: 'Intermediate',
    duration: 45,
    icon: 'code',
    slug: 'typescript-vue'
  },
  {
    category_id: '550e8400-e29b-41d4-a716-446655440003', // State Management UUID
    title: 'State Management with Vuex',
    description: 'Understand how to manage application state using Vuex in Vue 3.',
    level: 'Intermediate',
    duration: 40,
    icon: 'database',
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

const openPage = (category: any, page: any) => {
  router.push(`/tutorials/${category.slug}/${page.slug}`)
}

const selectCategory = (category: any) => {
  selectedCategory.value = category
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const breadcrumbItems = computed(() => {
  if (!selectedCategory.value) return []
  return [
    { label: 'Tutorials', to: '/tutorials' },
    { label: selectedCategory.value.title || 'Category' }
  ]
})

const getGroupCategories = (groupId: string) => {
  return categories.value
    .filter(cat => cat.top_level_group_id === groupId)
    .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
}

const getUncategorizedCategories = () => {
  return categories.value
    .filter(cat => !cat.top_level_group_id)
    .sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''))
}

// Map category icons to FontAwesome icons
const getCategoryIcon = (iconName: string | null | undefined) => {
  if (!iconName) return faBook
  
  const iconMap: Record<string, any> = {
    '📚': faBook,
    '🔷': faCode,
    '🗄️': faDatabase,
    '💻': faLaptopCode,
    '⚙️': faGears,
    '🤖': faRobot,
    '🎓': faGraduationCap,
    '📄': faFileCode,
    '🔗': faCircleNodes,
    // Also handle icon names directly
    'book': faBook,
    'code': faCode,
    'database': faDatabase,
    'laptop': faLaptopCode,
    'gears': faGears,
    'robot': faRobot,
    'graduation': faGraduationCap,
    'file': faFileCode,
    'nodes': faCircleNodes
  }
  
  return iconMap[iconName.toLowerCase()] || faBook
}

const fetchTopLevelGroups = async () => {
  // Check cache first
  const cached = store.getters.getCachedData('tutorialGroups')
  if (cached && Array.isArray(cached) && cached.length > 0) {
    topLevelGroups.value = cached
    // Fetch fresh data in background
  }

  try {
    const { data, error } = await supabase
      .from('tutorial_top_level_groups')
      .select('*')
      .eq('published', true)
      .order('display_order', { ascending: true })

    if (error) {
      // Check if table doesn't exist (PGRST205 error)
      if (error.code === 'PGRST205') {
        topLevelGroups.value = []
        return
      }
      topLevelGroups.value = []
      return
    }
    
    if (data && data.length > 0) {
      topLevelGroups.value = data
      // Cache the fetched data
      store.dispatch('setCachedData', { type: 'tutorialGroups', data })
    } else {
      topLevelGroups.value = []
    }
  } catch (error: any) {
    topLevelGroups.value = []
    const errorMessage = error?.message || error?.code || 'Failed to load tutorial groups'
    store.dispatch('addNotification', {
      type: 'error',
      message: `Error loading tutorial groups: ${errorMessage}`,
      duration: 6000
    })
  }
}

const fetchCategories = async () => {
  // Check cache first
  const cached = store.getters.getCachedData('categories')
  if (cached && Array.isArray(cached) && cached.length > 0) {
    categories.value = cached
    // Fetch fresh data in background
  }

  try {
    const { data, error } = await supabase
      .from('tutorials_category')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }
    
    // Use fetched data if available, otherwise fall back to dummy data
    if (data && data.length > 0) {
      categories.value = data
      // Cache the fetched data
      store.dispatch('setCachedData', { type: 'categories', data })
    } else {
      categories.value = dummyCategories
    }
  } catch (error: any) {
    // Use dummy data if fetch fails
    categories.value = dummyCategories
    const errorMessage = error?.message || error?.code || 'Failed to load categories'
    store.dispatch('addNotification', {
      type: 'error',
      message: `Error loading categories: ${errorMessage}`,
      duration: 6000
    })
  }
}

const fetchPages = async () => {
  // Check cache first - note: pages are cached as part of tutorials, but we can cache them separately
  // For now, we'll cache them as 'tutorialPages' but they're used differently
  // Actually, let's use a more specific cache key or just cache the pages array
  const cached = store.getters.getCachedData('tutorialPages')
  if (cached && Array.isArray(cached) && cached.length > 0) {
    pages.value = cached
    // Fetch fresh data in background
  }

  try {
    const { data, error } = await supabase
      .from('tutorial_pages')
      .select('*')
      .eq('published', true)
      .order('page_order', { ascending: true })

    if (error) {
      throw error
    }
    
    // Use fetched data if available, otherwise fall back to dummy data
    if (data && data.length > 0) {
      pages.value = data
      // Cache the fetched data
      store.dispatch('setCachedData', { type: 'tutorialPages', data })
    } else {
      pages.value = dummyPages
    }
  } catch (error: any) {
    // Use dummy data if fetch fails
    pages.value = dummyPages
    const errorMessage = error?.message || error?.code || 'Failed to load pages'
    store.dispatch('addNotification', {
      type: 'error',
      message: `Error loading pages: ${errorMessage}`,
      duration: 6000
    })
  }
}

onMounted(async () => {
  // Check cache first for instant display
  const cachedGroups = store.getters.getCachedData('tutorialGroups')
  const cachedCategories = store.getters.getCachedData('categories')
  const cachedPages = store.getters.getCachedData('tutorialPages')
  
  if (cachedGroups && Array.isArray(cachedGroups) && cachedGroups.length > 0) {
    topLevelGroups.value = cachedGroups
  }
  
  if (cachedCategories && Array.isArray(cachedCategories) && cachedCategories.length > 0) {
    categories.value = cachedCategories
  }
  
  if (cachedPages && Array.isArray(cachedPages) && cachedPages.length > 0) {
    pages.value = cachedPages
  }
  
  // Only show loading if we don't have cached data
  if (!cachedGroups && !cachedCategories && !cachedPages) {
    loading.value = true
  }
  
  // Fetch fresh data in background
  await Promise.all([fetchTopLevelGroups(), fetchCategories(), fetchPages()])
  loading.value = false
})
</script>

<style scoped>
/* Category Square */
.category-square {
  aspect-ratio: 1;
  background-color: var(--color-bg-tertiary);
  border: 1px solid var(--color-border-primary);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.category-square:hover {
  background-color: var(--color-bg-elevated);
  border-color: var(--color-primary-500);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(235, 94, 40, 0.2);
}

.category-icon {
  font-size: 48px;
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.category-square-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-align: center;
  line-height: 1.3;
}

/* Lesson Link */
.lesson-link {
  display: block;
  padding: 12px 0;
  color: var(--color-primary-500);
  text-decoration: none;
  font-size: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.lesson-link:hover {
  color: var(--color-primary-600);
  text-decoration: underline;
  padding-left: 8px;
}
</style>
