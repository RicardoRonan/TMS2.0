<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Blog & Articles
          </h1>
          <p class="text-xl text-text-secondary mb-8">
            Insights, tutorials, and stories from the developer community
          </p>
          
          <!-- Search and Filters -->
          <div class="max-w-2xl mx-auto">
            <div class="relative mb-6">
              <HIGInput
                v-model="searchQuery"
                type="search"
                placeholder="Search articles..."
                class="pr-12"
                @input="handleSearch"
              >
                <template #right-icon>
                  <Icon
                    name="search"
                    :size="20"
                  />
                </template>
              </HIGInput>
            </div>
            
            <div class="flex flex-wrap gap-2 justify-center">
              <button
                v-for="category in categories"
                :key="category"
                :class="categoryButtonClasses(category)"
                @click="filterByCategory(category)"
              >
                {{ category }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Blog Posts -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div
          v-if="loading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <HIGCard
            v-for="n in 6"
            :key="n"
          >
            <div class="p-6">
              <HIGSkeleton type="blog-card" />
            </div>
          </HIGCard>
        </div>

        <div
          v-else-if="filteredPosts.length === 0"
          class="text-center py-16"
        >
          <div class="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              name="document"
              :size="48"
              class="text-text-tertiary"
            />
          </div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">
            No articles found
          </h3>
          <p class="text-text-secondary mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'No articles match the selected category' }}
          </p>
          <HIGButton
            variant="primary"
            @click="clearFilters"
          >
            Clear Filters
          </HIGButton>
        </div>

        <!-- Grouped by Category -->
        <div
          v-else
          class="space-y-12"
        >
          <template
            v-for="category in groupedCategories"
            :key="category"
          >
            <div v-if="getCategoryPosts(category).length > 0">
              <!-- Category Heading -->
              <h2 class="text-2xl font-bold text-text-primary mb-6">
                {{ category }}
              </h2>
              
              <!-- Blog Posts Grid for this Category -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <HIGCard
                  v-for="post in getCategoryPosts(category)"
                  :key="post.id"
                  class="hover:shadow-hig-lg transition-shadow"
                >
                  <div class="p-6">
                    <!-- Featured Image - Commented out for now -->
                    <!-- <div v-if="post.featuredImageUrl" class="aspect-video bg-bg-tertiary rounded-lg mb-4 overflow-hidden">
                      <img 
                        :src="post.featuredImageUrl" 
                        :alt="post.title"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div v-else class="aspect-video bg-bg-tertiary rounded-lg mb-4 flex items-center justify-center">
                      <span class="text-text-tertiary">No Image</span>
                    </div> -->
                    <div class="space-y-3">
                      <div class="flex items-center space-x-2 text-sm text-text-tertiary">
                        <span
                          v-if="post.category"
                          class="badge badge-secondary"
                        >{{ post.category }}</span>
                        <span v-if="post.category">•</span>
                        <span>{{ formatDate(post.createdAt) }}</span>
                      </div>
                      <h3 class="text-xl font-semibold text-text-primary line-clamp-2">
                        {{ post.title }}
                      </h3>
                      <p class="text-text-secondary line-clamp-3">
                        {{ post.excerpt }}
                      </p>
                      <div class="flex items-center justify-between pt-2">
                        <div class="flex items-center space-x-2 text-sm text-text-tertiary">
                          <span>{{ post.readTime }} min read</span>
                        </div>
                        <router-link 
                          :to="`/blog/${post.slug}`"
                          class="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors"
                        >
                          Read More
                          <Icon
                            name="arrow-right"
                            :size="16"
                            class="ml-1"
                          />
                        </router-link>
                      </div>
                    </div>
                  </div>
                </HIGCard>
              </div>
            </div>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../supabase'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGSkeleton from '../components/hig/HIGSkeleton.vue'
import Icon from '../components/Icon.vue'

const store = useStore()

// State
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('All')
const currentPage = ref(1)
const postsPerPage = 9
const posts = ref<any[]>([])
const categories = ref(['All'])
const blogCategories = ref<any[]>([])
const lastFetchTime = ref<number>(0)
const FETCH_CACHE_TIME = 30000 // 30 seconds - refetch if data is older than this

// Computed
const filteredPosts = computed(() => {
  let filtered = posts.value

  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(post => post.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(post => 
      post.title.toLowerCase().includes(query) ||
      post.excerpt.toLowerCase().includes(query) ||
      post.category.toLowerCase().includes(query)
    )
  }

  // Sort by newest date first
  return filtered.sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA // Descending order (newest first)
  })
})

// Group posts by category
const groupedCategories = computed(() => {
  const categorySet = new Set<string>()
  filteredPosts.value.forEach(post => {
    if (post.category) {
      categorySet.add(post.category)
    }
  })
  // Sort categories alphabetically
  return Array.from(categorySet).sort()
})

// Get posts for a specific category
const getCategoryPosts = (category: string) => {
  return filteredPosts.value.filter(post => post.category === category)
}

const totalPages = computed(() => Math.ceil(filteredPosts.value.length / postsPerPage))

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage
  const end = start + postsPerPage
  return filteredPosts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const handleSearch = () => {
  currentPage.value = 1
}

const filterByCategory = (category: string) => {
  selectedCategory.value = category
  currentPage.value = 1
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'All'
  currentPage.value = 1
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const categoryButtonClasses = (category: string) => [
  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
  {
    'bg-primary-500 text-white': selectedCategory.value === category,
    'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary': selectedCategory.value !== category
  }
]

const pageButtonClasses = (page: number) => [
  'px-3 py-2 rounded-md text-sm font-medium transition-colors',
  {
    'bg-primary-500 text-white': currentPage.value === page,
    'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary': currentPage.value !== page
  }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
}

const fetchBlogs = async (force = false) => {
  // Check cache first
  if (!force) {
    const cached = store.getters.getCachedData('blogs')
    if (cached && Array.isArray(cached) && cached.length > 0) {
      posts.value = cached
      loading.value = false
      updateCategories()
      // Fetch fresh data in background
      force = true
    }
  }

  // Skip if data was recently fetched (unless forced)
  const now = Date.now()
  if (!force && now - lastFetchTime.value < FETCH_CACHE_TIME && posts.value.length > 0) {
    return
  }

  try {
    // Only show loading if we don't have cached data
    if (posts.value.length === 0) {
      loading.value = true
    }
    
    // Fetch blogs with author_id
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // Get unique author IDs
    const authorIds = [...new Set((data || []).map(blog => blog.author_id).filter(Boolean))]
    
    // Fetch author information separately
    const authorMap = new Map()
    if (authorIds.length > 0) {
      try {
        const { data: authorsData, error: authorsError } = await supabase
          .from('users')
          .select('id, display_name, email, photo_url')
          .in('id', authorIds)

        if (!authorsError && authorsData) {
          authorsData.forEach(author => {
            authorMap.set(author.id, {
              name: author.display_name || author.email?.split('@')[0] || 'Anonymous',
              email: author.email,
              photoUrl: author.photo_url
            })
          })
        }
      } catch (err) {
        // If fetching authors fails (e.g., RLS), continue without author info
      }
    }

    posts.value = (data || []).map(blog => ({
      id: blog.id,
      title: blog.title,
      excerpt: blog.excerpt,
      category: blog.category,
      slug: blog.slug,
      createdAt: blog.created_at,
      readTime: blog.read_time || 5,
      featuredImageUrl: blog.featured_image_url,
      author: blog.author_id ? (authorMap.get(blog.author_id) || {
        name: 'Anonymous',
        email: null,
        photoUrl: null
      }) : {
        name: 'Anonymous',
        email: null,
        photoUrl: null
      }
    }))

    // Update categories - will be set by fetchBlogCategories
    updateCategories()
    lastFetchTime.value = now
    
    // Cache the fetched data
    store.dispatch('setCachedData', { type: 'blogs', data: posts.value })
  } catch (error: any) {
    posts.value = []
    const errorMessage = error?.message || error?.code || 'Failed to load blog posts'
    store.dispatch('addNotification', {
      type: 'error',
      message: `Error loading blogs: ${errorMessage}`,
      duration: 8000
    })
  } finally {
    loading.value = false
  }
}

// Fetch blog categories from blog_categories table
const fetchBlogCategories = async () => {
  // Check cache first
  const cached = store.getters.getCachedData('blogCategories')
  if (cached && Array.isArray(cached) && cached.length > 0) {
    blogCategories.value = cached
    updateCategories()
    // Fetch fresh data in background
  }

  try {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('name')
      .order('name', { ascending: true })

    if (error) {
      // If table doesn't exist or RLS blocks access, silently fall back
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        blogCategories.value = []
        updateCategories()
        return
      }
      
      // For RLS or permission errors, silently fall back
      if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
        blogCategories.value = []
        updateCategories()
        return
      }
      
      // For other errors, still try to use categories from posts
      blogCategories.value = []
      updateCategories()
      return
    }

    blogCategories.value = data || []
    
    // Cache the fetched categories
    if (blogCategories.value.length > 0) {
      store.dispatch('setCachedData', { type: 'blogCategories', data: blogCategories.value })
    }
    
    // If we got categories from the table, use them as primary source
    if (blogCategories.value.length > 0) {
      updateCategories()
    } else {
      // If table exists but is empty, still update to show categories from posts
      updateCategories()
    }
  } catch (error: any) {
    blogCategories.value = []
    updateCategories()
  }
}

// Update categories list - uses blog_categories table as primary source
const updateCategories = () => {
  const uniqueCategories = new Set<string>(['All'])
  
  // PRIMARY: Add all categories from blog_categories table (this is the source of truth)
  if (blogCategories.value.length > 0) {
    blogCategories.value.forEach(cat => {
      if (cat && cat.name) {
        uniqueCategories.add(cat.name)
      }
    })
  }
  
  // FALLBACK: Also add categories from posts (in case some posts have categories not in the table yet)
  // This ensures backward compatibility
  posts.value.forEach(post => {
    if (post.category) {
      uniqueCategories.add(post.category)
    }
  })
  
  const sortedCategories = Array.from(uniqueCategories).sort()
  categories.value = sortedCategories
}

onMounted(async () => {
  // Check cache first for instant display
  const cachedBlogs = store.getters.getCachedData('blogs')
  const cachedCategories = store.getters.getCachedData('blogCategories')
  
  if (cachedBlogs && Array.isArray(cachedBlogs) && cachedBlogs.length > 0) {
    posts.value = cachedBlogs
    loading.value = false
  }
  
  if (cachedCategories && Array.isArray(cachedCategories) && cachedCategories.length > 0) {
    blogCategories.value = cachedCategories
  }
  
  if (posts.value.length > 0) {
    updateCategories()
  }
  
  // Fetch fresh data in background
  // Fetch categories first, then blogs
  // This ensures categories are available when posts are loaded
  await fetchBlogCategories()
  await fetchBlogs()
})

// Refetch when component is activated (navigated back to)
onActivated(async () => {
  const now = Date.now()
  // Always refresh categories first to get any new ones
  await fetchBlogCategories()
  
  // Refetch if data is stale or empty
  if (now - lastFetchTime.value > FETCH_CACHE_TIME || posts.value.length === 0) {
    await fetchBlogs(true)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

