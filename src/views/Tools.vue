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
          <HIGCard v-for="n in 8" :key="n" class="animate-pulse">
            <div class="p-6 text-center">
              <div class="w-20 h-20 bg-bg-tertiary rounded-xl mx-auto mb-4"></div>
              <div class="h-4 bg-bg-tertiary rounded w-3/4 mx-auto mb-2"></div>
              <div class="h-3 bg-bg-tertiary rounded w-full mb-4"></div>
              <div class="h-6 bg-bg-tertiary rounded w-1/3 mx-auto"></div>
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
                :style="{ backgroundColor: logoColors[tool.id] || 'var(--bg-secondary)' }"
              >
                <img 
                  :src="getBrandfetchLogoUrl(tool.name, tool.url, { size: 80 })" 
                  :alt="`${tool.name} logo`"
                  class="max-w-full max-h-full w-auto h-auto object-contain"
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
                  >
                    <Icon name="external-link" :size="16" />
                  </a>
                  <button
                    class="text-text-tertiary hover:text-primary-500 transition-colors"
                    :title="`Add ${tool.name} to favorites`"
                    @click="toggleFavorite(tool.id)"
                  >
                    <Icon 
                      name="favorite" 
                      :size="16" 
                      :class="{ 'text-primary-500': tool.isFavorite }"
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
import { ref, computed, onMounted } from 'vue'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGBadge from '../components/hig/HIGBadge.vue'
import Icon from '../components/Icon.vue'
import { getBrandfetchLogoUrl } from '../utils/brandfetch'
import { getLogoBackgroundColor, extractBackgroundColor } from '../utils/logoColors'

// State
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('All')
const currentPage = ref(1)
const toolsPerPage = 12
const logoColors = ref<Record<number, string>>({})

// Mock data
const tools = ref([
  {
    id: 1,
    name: 'Vite',
    description: 'Next generation frontend tooling for fast development',
    category: 'Build Tool',
    url: 'https://vitejs.dev',
    isFavorite: false
  },
  {
    id: 2,
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework for rapid UI development',
    category: 'CSS Framework',
    url: 'https://tailwindcss.com',
    isFavorite: true
  },
  {
    id: 3,
    name: 'TypeScript',
    description: 'Typed JavaScript at any scale',
    category: 'Language',
    url: 'https://typescriptlang.org',
    isFavorite: false
  },
  {
    id: 4,
    name: 'Firebase',
    description: 'Backend-as-a-Service platform for web and mobile',
    category: 'Backend',
    url: 'https://firebase.google.com',
    isFavorite: true
  },
  {
    id: 5,
    name: 'Vue.js',
    description: 'Progressive JavaScript framework for building UIs',
    category: 'Framework',
    url: 'https://vuejs.org',
    isFavorite: false
  },
  {
    id: 6,
    name: 'VS Code',
    description: 'Free source-code editor made by Microsoft',
    category: 'Editor',
    url: 'https://code.visualstudio.com',
    isFavorite: true
  },
  {
    id: 7,
    name: 'GitHub',
    description: 'Web-based version control and collaboration platform',
    category: 'Version Control',
    url: 'https://github.com',
    isFavorite: false
  },
  {
    id: 8,
    name: 'Figma',
    description: 'Collaborative interface design tool',
    category: 'Design',
    url: 'https://figma.com',
    isFavorite: true
  },
  {
    id: 9,
    name: 'Postman',
    description: 'API development and testing platform',
    category: 'API Testing',
    url: 'https://postman.com',
    isFavorite: false
  },
  {
    id: 10,
    name: 'Docker',
    description: 'Containerization platform for applications',
    category: 'DevOps',
    url: 'https://docker.com',
    isFavorite: false
  },
  {
    id: 11,
    name: 'ESLint',
    description: 'JavaScript and TypeScript linter',
    category: 'Code Quality',
    url: 'https://eslint.org',
    isFavorite: true
  },
  {
    id: 12,
    name: 'Prettier',
    description: 'Code formatter for consistent code style',
    category: 'Code Quality',
    url: 'https://prettier.io',
    isFavorite: false
  }
])

const categories = ref(['All', 'Build Tool', 'CSS Framework', 'Language', 'Backend', 'Framework', 'Editor', 'Version Control', 'Design', 'API Testing', 'DevOps', 'Code Quality'])

// Computed
const filteredTools = computed(() => {
  let filtered = tools.value

  // Filter by category
  if (selectedCategory.value !== 'All') {
    filtered = filtered.filter(tool => tool.category === selectedCategory.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(tool => 
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query)
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

const toggleFavorite = (toolId: number) => {
  const tool = tools.value.find(t => t.id === toolId)
  if (tool) {
    tool.isFavorite = !tool.isFavorite
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
    img.parentElement.innerHTML = `<span class="text-primary-500 font-bold text-2xl">${toolName[0]}</span>`
    img.parentElement.classList.add('bg-primary-100')
  }
}

const handleLogoLoad = async (event: Event, toolId: number, toolName: string) => {
  const img = event.target as HTMLImageElement
  
  // First try to get known background color
  const bgColor = getLogoBackgroundColor(toolName)
  if (bgColor) {
    logoColors.value[toolId] = bgColor
    return
  }
  
  // Otherwise, extract background color from image edges
  try {
    const backgroundColor = await extractBackgroundColor(img.src)
    logoColors.value[toolId] = backgroundColor
  } catch (error) {
    // Fallback to default background if extraction fails
    logoColors.value[toolId] = 'var(--bg-secondary)'
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

onMounted(() => {
  // Simulate loading
  setTimeout(() => {
    loading.value = false
  }, 1000)
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

