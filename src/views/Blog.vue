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
                  <Icon name="search" :size="20" />
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
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard v-for="n in 6" :key="n" class="animate-pulse">
            <div class="p-6">
              <div class="aspect-video bg-bg-tertiary rounded-lg mb-4"></div>
              <div class="space-y-3">
                <div class="h-4 bg-bg-tertiary rounded w-1/4"></div>
                <div class="h-6 bg-bg-tertiary rounded w-3/4"></div>
                <div class="h-4 bg-bg-tertiary rounded w-full"></div>
                <div class="h-4 bg-bg-tertiary rounded w-2/3"></div>
              </div>
            </div>
          </HIGCard>
        </div>

        <div v-else-if="filteredPosts.length === 0" class="text-center py-16">
          <div class="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="document" :size="48" class="text-text-tertiary" />
          </div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No articles found</h3>
          <p class="text-text-secondary mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'No articles match the selected category' }}
          </p>
          <HIGButton variant="primary" @click="clearFilters">
            Clear Filters
          </HIGButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard v-for="post in paginatedPosts" :key="post.id" class="hover:shadow-hig-lg transition-shadow">
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
                  <span v-if="post.category" class="badge badge-secondary">{{ post.category }}</span>
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
                    <Icon name="arrow-right" :size="16" class="ml-1" />
                  </router-link>
                </div>
              </div>
            </div>
          </HIGCard>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center mt-12">
          <div class="flex items-center space-x-2">
            <HIGButton
              variant="secondary"
              size="sm"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              Previous
            </HIGButton>
            
            <div class="flex space-x-1">
              <button
                v-for="page in visiblePages"
                :key="page"
                :class="pageButtonClasses(page)"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            
            <HIGButton
              variant="secondary"
              size="sm"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Next
            </HIGButton>
          </div>
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
  // Skip if data was recently fetched (unless forced)
  const now = Date.now()
  if (!force && now - lastFetchTime.value < FETCH_CACHE_TIME && posts.value.length > 0) {
    return
  }

  try {
    loading.value = true
    
    // Try fetching with author join first
    let { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!author_id (
          id,
          display_name,
          email,
          photo_url
        )
      `)
      .eq('published', true)
      .order('created_at', { ascending: false })

    // If the join fails (e.g., RLS on users table), try without the join
    if (error) {
      const { data: blogsData, error: blogsError } = await supabase
        .from('blogs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
      
      if (blogsError) {
        throw blogsError
      }
      
      data = blogsData
      error = null
    }

    if (error) {
      throw error
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
      author: blog.author ? {
        name: blog.author.display_name || blog.author.email?.split('@')[0] || 'Anonymous',
        email: blog.author.email,
        photoUrl: blog.author.photo_url
      } : null
    }))

    // Extract unique categories
    const uniqueCategories = new Set<string>(['All'])
    posts.value.forEach(post => {
      if (post.category) {
        uniqueCategories.add(post.category)
      }
    })
    categories.value = Array.from(uniqueCategories)
    lastFetchTime.value = now
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

onMounted(() => {
  fetchBlogs()
})

// Refetch when component is activated (navigated back to)
onActivated(() => {
  const now = Date.now()
  // Refetch if data is stale or empty
  if (now - lastFetchTime.value > FETCH_CACHE_TIME || posts.value.length === 0) {
    fetchBlogs(true)
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

