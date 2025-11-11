<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
            Build the Future with
            <span class="text-primary-500">MetaStack</span>
          </h1>
          <p class="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed">
            A digital community platform for developers, designers, and creators to share knowledge, 
            <!-- collaborate on projects, and --> build innovative solutions together.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <HIGButton variant="primary" size="lg" @click="scrollToFeatures">
              Explore Features
            </HIGButton>
            <HIGButton variant="secondary" size="lg" @click="scrollToCommunity">
              Join Community
            </HIGButton>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="py-20 bg-bg-secondary">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Everything You Need to Succeed
          </h2>
          <p class="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover powerful tools, learn from tutorials, <!-- share your projects, and --> connect with like-minded creators.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard v-for="feature in features" :key="feature.id" class="text-center">
            <div class="p-6">
              <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Icon :name="feature.icon.toLowerCase()" :size="32" class="text-white" />
              </div>
              <h3 class="text-xl font-semibold text-text-primary mb-3">{{ feature.title }}</h3>
              <p class="text-text-secondary">{{ feature.description }}</p>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Blog Preview Section -->
    <section class="py-20 bg-bg-primary">
      <div class="container mx-auto px-4">
        <div class="flex items-center justify-between mb-12">
          <div>
            <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              Latest from Our Blog
            </h2>
            <p class="text-lg text-text-secondary">
              Stay updated with the latest insights, tutorials, and industry trends.
            </p>
          </div>
          <router-link to="/blog" class="hidden md:block">
            <HIGButton variant="tertiary">
              View All Posts
              <Icon name="arrow-right" :size="16" class="ml-2" />
            </HIGButton>
          </router-link>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard v-for="post in featuredPosts" :key="post.id" class="hover:shadow-hig-lg transition-shadow">
            <div class="p-6">
              <!-- Featured Image - Commented out for now -->
              <!-- <div class="aspect-video bg-bg-tertiary rounded-lg mb-4 flex items-center justify-center">
                <span class="text-text-tertiary">Featured Image</span>
              </div> -->
              <div class="space-y-3">
                <div class="flex items-center space-x-2 text-sm text-text-tertiary">
                  <span>{{ post.category }}</span>
                  <span>•</span>
                  <span>{{ formatDate(post.createdAt) }}</span>
                </div>
                <h3 class="text-xl font-semibold text-text-primary line-clamp-2">
                  {{ post.title }}
                </h3>
                <p class="text-text-secondary line-clamp-3">
                  {{ post.excerpt }}
                </p>
                <router-link 
                  :to="`/blog/${post.slug}`"
                  class="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors"
                >
                  Read More
                  <Icon name="arrow-right" :size="16" class="ml-1" />
                </router-link>
              </div>
            </div>
          </HIGCard>
        </div>

        <div class="text-center mt-8 md:hidden">
          <router-link to="/blog">
            <HIGButton variant="tertiary" full-width>
              View All Posts
            </HIGButton>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Tools Preview Section -->
    <section class="py-20 bg-bg-secondary">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Essential Developer Tools
          </h2>
          <p class="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover curated tools and resources to boost your productivity and streamline your workflow.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <HIGCard v-for="tool in featuredTools" :key="tool.id" class="text-center hover:shadow-hig-lg transition-shadow">
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
              <p class="text-sm text-text-secondary mb-4">{{ tool.description }}</p>
              <div class="flex items-center justify-center space-x-2">
                <span class="badge badge-secondary text-xs">{{ tool.category }}</span>
                <a 
                  :href="tool.url" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="text-primary-500 hover:text-primary-600 transition-colors"
                >
                  <Icon name="external-link" :size="16" />
                </a>
              </div>
            </div>
          </HIGCard>
        </div>

        <div class="text-center mt-8">
          <router-link to="/tools">
            <HIGButton variant="primary">
              Explore All Tools
            </HIGButton>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Community Section -->
    <section id="community" class="py-20 bg-bg-primary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Join Our Community
          </h2>
          <p class="text-lg text-text-secondary mb-8">
            Connect with thousands of developers, designers, and creators who are building the future together.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">{{ formatCount(stats.activeMembers) }}</div>
              <div class="text-text-secondary">Active Members</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">{{ formatCount(stats.publishedArticles) }}</div>
              <div class="text-text-secondary">Published Articles</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">{{ formatCount(stats.curatedTools) }}</div>
              <div class="text-text-secondary">Curated Tools</div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <HIGButton variant="primary" size="lg" @click="scrollToTop">
              Get Started Today
            </HIGButton>
            <HIGButton variant="secondary" size="lg" @click="scrollToContact">
              Contact Us
            </HIGButton>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGCard from '../components/hig/HIGCard.vue'
import Icon from '../components/Icon.vue'
import { getBrandfetchLogoUrl } from '../utils/brandfetch'
import { getLogoBackgroundColor, extractBackgroundColor } from '../utils/logoColors'
import { supabase } from '../supabase'

// Features data
const features = ref([
  {
    id: 1,
    title: 'Blog & Articles',
    description: 'Share knowledge through detailed articles, tutorials, and insights from industry experts.',
    icon: 'DocumentTextIcon'
  },
  {
    id: 2,
    title: 'Tool Directory',
    description: 'Discover and share essential development tools, libraries, and resources.',
    icon: 'WrenchScrewdriverIcon'
  },
  {
    id: 3,
    title: 'Interactive Tutorials',
    description: 'Learn with hands-on tutorials and code playgrounds for practical experience.',
    icon: 'AcademicCapIcon'
  },
  // {
  //   id: 4,
  //   title: 'Project Showcase',
  //   description: 'Showcase your projects and get feedback from the community.',
  //   icon: 'FolderIcon'
  // }
])

// Featured blog posts
const featuredPosts = ref([
  {
    id: 1,
    title: 'Getting Started with Vue 3 Composition API',
    excerpt: 'Learn the fundamentals of Vue 3\'s Composition API and how it can improve your development workflow.',
    category: 'Vue.js',
    slug: 'getting-started-vue3-composition-api',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 2,
    title: 'Building Scalable React Applications',
    excerpt: 'Best practices and patterns for creating maintainable and scalable React applications.',
    category: 'React',
    slug: 'building-scalable-react-applications',
    createdAt: new Date('2024-01-12')
  },
  {
    id: 3,
    title: 'CSS Grid vs Flexbox: When to Use What',
    excerpt: 'A comprehensive comparison of CSS Grid and Flexbox to help you choose the right layout method.',
    category: 'CSS',
    slug: 'css-grid-vs-flexbox-comparison',
    createdAt: new Date('2024-01-10')
  }
])

// Featured tools
const featuredTools = ref([
  {
    id: 1,
    name: 'Vite',
    description: 'Next generation frontend tooling',
    category: 'Build Tool',
    url: 'https://vitejs.dev'
  },
  {
    id: 2,
    name: 'Tailwind CSS',
    description: 'Utility-first CSS framework',
    category: 'CSS Framework',
    url: 'https://tailwindcss.com'
  },
  {
    id: 3,
    name: 'TypeScript',
    description: 'Typed JavaScript at scale',
    category: 'Language',
    url: 'https://typescriptlang.org'
  },
  {
    id: 4,
    name: 'Firebase',
    description: 'Backend-as-a-Service platform',
    category: 'Backend',
    url: 'https://firebase.google.com'
  }
])

const logoColors = ref<Record<number, string>>({})

// Stats
const stats = ref({
  activeMembers: 0,
  publishedArticles: 0,
  curatedTools: 0
})

// Format count for display
const formatCount = (count: number): string => {
  if (count >= 1000) {
    const k = Math.floor(count / 1000)
    return `${k}K+`
  }
  return `${count}+`
}

// Fetch stats from database
const fetchStats = async () => {
  try {
    // Supabase session is automatically managed - no need to call getSession()
    
    // Fetch users count using database function
    try {
      const { data: usersCount, error: usersError } = await supabase
        .rpc('get_user_count')
      
      if (!usersError && usersCount !== null && usersCount !== undefined) {
        stats.value.activeMembers = usersCount
      }
    } catch (err) {
      console.log('Could not fetch users count:', err)
      // Keep default value
    }
    
    // Fetch published blogs count
    try {
      const { count: blogsCount, error: blogsError } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
      
      if (!blogsError && blogsCount !== null) {
        stats.value.publishedArticles = blogsCount
      }
    } catch (err) {
      console.log('Could not fetch blogs count:', err)
      // Keep default value
    }
    
    // Fetch tools count
    try {
      const { count: toolsCount, error: toolsError } = await supabase
        .from('tools')
        .select('*', { count: 'exact', head: true })
      
      if (!toolsError && toolsCount !== null) {
        stats.value.curatedTools = toolsCount
      }
    } catch (err) {
      console.log('Could not fetch tools count:', err)
      // Keep default value
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    // Keep default values of 0 if fetch fails
  }
}

// Methods
const scrollToFeatures = () => {
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToCommunity = () => {
  document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' })
}

const scrollToContact = () => {
  // This would scroll to contact section if it exists
  window.location.href = '/contact'
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  })
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

onMounted(() => {
  fetchStats()
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

