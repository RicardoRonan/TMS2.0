<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Developer Tools
          </h1>
          <p class="text-xl text-text-secondary mb-8">
            Curated collection of essential tools and resources for developers
          </p>
          
          <!-- Search and Filters -->
          <div class="max-w-2xl mx-auto">
            <div class="relative mb-6">
              <HIGInput
                v-model="searchQuery"
                type="search"
                placeholder="Search tools..."
                class="pr-12"
                @input="handleSearch"
              >
                <template #right-icon>
                  <Icon name="search" :size="20" class="text-text-tertiary" />
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

    <!-- Tools Grid -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <HIGCard v-for="n in 8" :key="n">
            <div class="p-6">
              <HIGSkeleton type="tool-card" />
            </div>
          </HIGCard>
        </div>

        <div v-else-if="filteredTools.length === 0" class="text-center py-16">
          <div class="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="settings" :size="48" class="text-text-tertiary" />
          </div>
          <h3 class="text-xl font-semibold text-text-primary mb-2">No tools found</h3>
          <p class="text-text-secondary mb-6">
            {{ searchQuery ? 'Try adjusting your search terms' : 'No tools match the selected category' }}
          </p>
          <HIGButton variant="primary" @click="clearFilters">
            Clear Filters
          </HIGButton>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <HIGCard v-for="tool in paginatedTools" :key="tool.id" class="text-center hover:shadow-hig-lg transition-shadow">
            <div class="p-6">
              <div 
                class="w-20 h-20 border border-border-primary rounded-xl flex items-center justify-center mx-auto mb-4 p-4 shadow-sm transition-colors"
                :style="{ backgroundColor: logoColors[String(tool.id)] || 'var(--bg-secondary)' }"
              >
                <img 
                  :src="getBrandfetchLogoUrl(tool.name, tool.url, { size: 80 })" 
                  :alt="`${tool.name} logo`"
                  class="max-w-full max-h-full w-auto h-auto object-contain"
                  loading="lazy"
                  @error="handleLogoError"
                  @load="(e) => handleLogoLoad(e, tool.id, tool.name)"
                />
              </div>
              <h3 class="font-semibold text-text-primary mb-2">{{ tool.name }}</h3>
              <p class="text-sm text-text-secondary mb-4 line-clamp-2">{{ tool.description }}</p>
              <div class="space-y-2">
                <div class="flex items-center justify-center">
                  <HIGBadge :variant="getCategoryVariant(tool.category)" size="sm">
                    {{ tool.category }}
                  </HIGBadge>
                </div>
                <div class="flex items-center justify-center space-x-2">
                  <a 
                    :href="tool.url" 
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-primary-500 hover:text-primary-600 transition-colors"
                    :title="`Visit ${tool.name}`"
                    @click.stop
                  >
                    <Icon name="external-link" :size="16" />
                  </a>
                  <button
                    type="button"
                    :class="[
                      'transition-colors cursor-pointer p-1 rounded hover:bg-bg-tertiary flex items-center justify-center',
                      tool.isFavorite ? 'text-primary-500' : 'text-text-tertiary hover:text-primary-500'
                    ]"
                    :title="tool.isFavorite ? `Remove ${tool.name} from favorites` : `Add ${tool.name} to favorites`"
                    @click="(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(tool.id); }"
                  >
                    <Icon 
                      name="favorite" 
                      :size="16" 
                      :class="tool.isFavorite ? 'text-primary-500 fill-primary-500' : ''"
                      style="pointer-events: none;"
                    />
                  </button>
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
import { ref, computed, onMounted, onActivated, watch } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../supabase'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGBadge from '../components/hig/HIGBadge.vue'
import HIGSkeleton from '../components/hig/HIGSkeleton.vue'
import Icon from '../components/Icon.vue'
import { getBrandfetchLogoUrl } from '../utils/brandfetch'
import { getLogoBackgroundColor, extractBackgroundColor } from '../utils/logoColors'
import { setSafeInnerHTML } from '../utils/sanitize'

const store = useStore()
const isAuthenticated = computed(() => store.getters.isAuthenticated)
const currentUser = computed(() => store.getters.currentUser)

// State
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('All')
const currentPage = ref(1)
const toolsPerPage = 12
const logoColors = ref<Record<string, string>>({})
const tools = ref<any[]>([])
const categories = ref(['All'])
const lastFetchTime = ref<number>(0)
const FETCH_CACHE_TIME = 30000 // 30 seconds - refetch if data is older than this

// Load favorites from localStorage (for guests)
const loadFavoritesFromLocalStorage = (): Set<string> => {
  try {
    const stored = localStorage.getItem('toolFavorites')
    if (stored) {
      const parsed = JSON.parse(stored)
      // Convert to strings to handle both old (number) and new (UUID string) formats
      return new Set(parsed.map((id: any) => String(id)))
    }
  } catch (err) {
    // Silently fail - return empty set
  }
  return new Set<string>()
}

// Save favorites to localStorage (for guests)
const saveFavoritesToLocalStorage = (favorites: Set<string>) => {
  try {
    localStorage.setItem('toolFavorites', JSON.stringify(Array.from(favorites)))
  } catch (err) {
    // Silently fail - favorites will still work in memory
  }
}

// Load favorites from database (for logged-in users)
const loadFavoritesFromDatabase = async (): Promise<Set<string>> => {
  if (!isAuthenticated.value || !currentUser.value?.uid) {
    return new Set<string>()
  }

  try {
    const { data, error } = await supabase
      .from('user_tool_favorites')
      .select('tool_id')
      .eq('user_id', currentUser.value.uid)

    if (error) {
      // If table doesn't exist, return empty set
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return new Set<string>()
      }
      throw error
    }

    return new Set<string>((data || []).map((fav: any) => String(fav.tool_id)))
  } catch (err: any) {
    return new Set<string>()
  }
}

// Save favorites to database (for logged-in users)
const saveFavoritesToDatabase = async (favorites: Set<string>) => {
  if (!isAuthenticated.value || !currentUser.value?.uid) {
    return
  }

  try {
    const favoriteArray = Array.from(favorites)
    
    // Delete all existing favorites for this user
    const { error: deleteError } = await supabase
      .from('user_tool_favorites')
      .delete()
      .eq('user_id', currentUser.value.uid)

    if (deleteError && deleteError.code !== '42P01') {
      // Ignore "table doesn't exist" error
      if (!deleteError.message?.includes('does not exist')) {
        throw deleteError
      }
    }

    // Insert new favorites
    if (favoriteArray.length > 0) {
      const favoritesToInsert = favoriteArray.map(toolId => ({
        user_id: currentUser.value.uid,
        tool_id: toolId
      }))

      const { error: insertError } = await supabase
        .from('user_tool_favorites')
        .insert(favoritesToInsert)

      if (insertError && insertError.code !== '42P01') {
        // Ignore "table doesn't exist" error
        if (!insertError.message?.includes('does not exist')) {
          throw insertError
        }
      }
    }
  } catch (err: any) {
    // Silently fail - favorites will still work with localStorage
  }
}

// Sync localStorage favorites to database when user logs in
const syncFavoritesToDatabase = async () => {
  if (!isAuthenticated.value || !currentUser.value?.uid) {
    return
  }

  const localFavorites = loadFavoritesFromLocalStorage()
  if (localFavorites.size === 0) {
    return
  }

  try {
    const dbFavorites = await loadFavoritesFromDatabase()
    
    // Merge: add any localStorage favorites that aren't in database
    const mergedFavorites = new Set([...dbFavorites, ...localFavorites])
    
    if (mergedFavorites.size > dbFavorites.size) {
      // Save merged favorites to database
      await saveFavoritesToDatabase(mergedFavorites)
      favorites.value = mergedFavorites
      
      // Clear localStorage after successful sync
      localStorage.removeItem('toolFavorites')
    } else {
      // Database already has all favorites, just use database
      favorites.value = dbFavorites
    }
  } catch (err) {
    // Keep using localStorage favorites
    favorites.value = localFavorites
  }
}

const favorites = ref<Set<string>>(new Set<string>())

// Computed
const filteredTools = computed(() => {
  let filtered = tools.value.map(tool => ({
    ...tool,
    isFavorite: favorites.value.has(String(tool.id))
  }))

  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(tool => tool.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tool => 
      tool.name?.toLowerCase().includes(query) ||
      tool.description?.toLowerCase().includes(query) ||
      tool.category?.toLowerCase().includes(query)
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredTools.value.length / toolsPerPage))

const paginatedTools = computed(() => {
  const start = (currentPage.value - 1) * toolsPerPage
  const end = start + toolsPerPage
  return filteredTools.value.slice(start, end)
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

const toggleFavorite = async (toolId: string | number) => {
  try {
    const toolIdStr = String(toolId)
    
    // Find the tool to get its name for the notification
    const tool = tools.value.find(t => String(t.id) === toolIdStr)
    const toolName = tool?.name || 'Tool'
    
    // Create a new Set to trigger Vue reactivity
    const newFavorites = new Set(favorites.value)
    
    let isAdding = false
    if (newFavorites.has(toolIdStr)) {
      newFavorites.delete(toolIdStr)
      isAdding = false
    } else {
      newFavorites.add(toolIdStr)
      isAdding = true
    }
    
    // Update the ref with the new Set to trigger reactivity
    favorites.value = newFavorites

    // Save to appropriate storage
    if (isAuthenticated.value) {
      await saveFavoritesToDatabase(favorites.value)
    } else {
      saveFavoritesToLocalStorage(favorites.value)
    }
    
    // Show success notification
    store.dispatch('addNotification', {
      type: 'success',
      message: isAdding 
        ? `${toolName} added to favorites` 
        : `${toolName} removed from favorites`,
      duration: 3000
    })
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to update favorite. Please try again.',
      duration: 3000
    })
  }
}

const getCategoryVariant = (category: string) => {
  const variants: Record<string, string> = {
    'Build Tool': 'primary',
    'CSS Framework': 'info',
    'Language': 'warning',
    'Backend': 'danger',
    'Framework': 'success',
    'Editor': 'secondary',
    'Version Control': 'info',
    'Design': 'primary',
    'API Testing': 'warning',
    'DevOps': 'danger',
    'Code Quality': 'success'
  }
  return variants[category] || 'secondary'
}

const handleLogoError = (event: Event) => {
  // Fallback to showing first letter if logo fails to load
  const img = event.target as HTMLImageElement
  if (img && img.parentElement) {
    const toolName = img.alt.replace(' logo', '')
    const firstLetter = toolName[0] || '?'
    setSafeInnerHTML(
      img.parentElement,
      `<span class="text-primary-500 font-bold text-2xl">${firstLetter}</span>`
    )
    img.parentElement.classList.add('bg-primary-100')
  }
}

const handleLogoLoad = async (event: Event, toolId: string | number, toolName: string) => {
  const img = event.target as HTMLImageElement
  const toolIdStr = String(toolId)
  
  // First try to get known background color
  const bgColor = getLogoBackgroundColor(toolName)
  if (bgColor) {
    logoColors.value[toolIdStr] = bgColor
    return
  }
  
  // Otherwise, extract background color from image edges
  try {
    const backgroundColor = await extractBackgroundColor(img.src)
    logoColors.value[toolIdStr] = backgroundColor
  } catch (error) {
    // Fallback to default background if extraction fails
    logoColors.value[toolIdStr] = 'var(--bg-secondary)'
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

// Fetch tools from Supabase
const fetchTools = async (force = false) => {
  // Check cache first
  if (!force) {
    const cached = store.getters.getCachedData('tools')
    if (cached && Array.isArray(cached) && cached.length > 0) {
      tools.value = cached
      loading.value = false
      updateCategories()
      // Fetch fresh data in background
      force = true
    }
  }

  // Skip if data was recently fetched (unless forced)
  const now = Date.now()
  if (!force && now - lastFetchTime.value < FETCH_CACHE_TIME && tools.value.length > 0) {
    return
  }

  try {
    // Only show loading if we don't have cached data
    if (tools.value.length === 0) {
      loading.value = true
    }
    
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    tools.value = (data || []).map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      category: tool.category,
      url: tool.url,
      isFavorite: favorites.value.has(String(tool.id))
    }))

    updateCategories()
    lastFetchTime.value = now
    
    // Cache the fetched data
    store.dispatch('setCachedData', { type: 'tools', data: tools.value })
  } catch (error: any) {
    tools.value = []
    const errorMessage = error?.message || error?.code || 'Failed to load tools'
    store.dispatch('addNotification', {
      type: 'error',
      message: `Error loading tools: ${errorMessage}`,
      duration: 8000
    })
  } finally {
    loading.value = false
  }
}

// Update categories list from fetched tools
const updateCategories = () => {
  const uniqueCategories = new Set<string>(['All'])
  tools.value.forEach(tool => {
    if (tool.category) {
      uniqueCategories.add(tool.category)
    }
  })
  categories.value = Array.from(uniqueCategories).sort()
}

// Load favorites when component mounts or user logs in
const loadFavorites = async () => {
  if (isAuthenticated.value) {
    const dbFavorites = await loadFavoritesFromDatabase()
    favorites.value = dbFavorites
    
    // Sync localStorage favorites to database if any exist
    await syncFavoritesToDatabase()
  } else {
    const localFavorites = loadFavoritesFromLocalStorage()
    favorites.value = localFavorites
  }
  
  // Update tools with favorite status after loading favorites
  updateToolsFavoriteStatus()
}

// Update all tools with current favorite status
const updateToolsFavoriteStatus = () => {
  tools.value = tools.value.map(tool => ({
    ...tool,
    isFavorite: favorites.value.has(String(tool.id))
  }))
}

// Watch for authentication changes to sync favorites
watch(isAuthenticated, async (newValue) => {
  if (newValue) {
    await loadFavorites()
  } else {
    // User logged out - switch to localStorage
    favorites.value = loadFavoritesFromLocalStorage()
  }
})

onMounted(async () => {
  // Load favorites FIRST before loading tools
  await loadFavorites()
  
  // Check cache first for instant display
  const cached = store.getters.getCachedData('tools')
  
  if (cached && Array.isArray(cached) && cached.length > 0) {
    // Update cached tools with favorite status
    tools.value = cached.map(tool => ({
      ...tool,
      isFavorite: favorites.value.has(String(tool.id))
    }))
    loading.value = false
    updateCategories()
  }
  
  // Fetch fresh data in background
  await fetchTools()
  
  // Update tools again after fetch to ensure favorite status is correct
  updateToolsFavoriteStatus()
})

// Watch favorites and update tools when favorites change
// Watch the Set by converting to array for proper reactivity tracking
watch(() => Array.from(favorites.value), () => {
  updateToolsFavoriteStatus()
}, { deep: true })

// Refetch when component is activated (navigated back to)
onActivated(async () => {
  // Reload favorites when navigating back to the page
  await loadFavorites()
  
  const now = Date.now()
  // Refetch if data is stale or empty
  if (now - lastFetchTime.value > FETCH_CACHE_TIME || tools.value.length === 0) {
    await fetchTools(true)
  } else {
    // Even if not refetching, update favorite status
    updateToolsFavoriteStatus()
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
</style>

