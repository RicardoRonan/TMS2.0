<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Hero Section -->
    <section class="py-20 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            About MetaStack
          </h1>
          <p class="text-xl text-text-secondary leading-relaxed">
            We're building the future of developer communities, one connection at a time.
          </p>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 class="text-3xl font-bold text-text-primary mb-6">
                Our Mission
              </h2>
              <p class="text-lg text-text-secondary mb-6">
                MetaStack was born from a simple belief: developers, designers, and creators 
                are stronger when they work together. We're creating a platform where knowledge 
                flows freely, ideas flourish, and innovation happens at the intersection of 
                different perspectives.
              </p>
              <p class="text-lg text-text-secondary">
                Our mission is to democratize access to high-quality development resources, 
                foster meaningful connections, and empower creators to build amazing things 
                that make a difference in the world.
              </p>
            </div>
            <div class="bg-bg-secondary rounded-2xl p-8">
              <div class="space-y-6">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-text-primary">
                      Innovation
                    </h3>
                    <p class="text-text-secondary">
                      Pushing boundaries of what's possible
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-text-primary">
                      Community
                    </h3>
                    <p class="text-text-secondary">
                      Building connections that matter
                    </p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-text-primary">
                      Learning
                    </h3>
                    <p class="text-text-secondary">
                      Continuous growth and development
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="py-20 bg-bg-secondary">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Our Values
          </h2>
          <p class="text-lg text-text-secondary max-w-2xl mx-auto">
            These principles guide everything we do and shape the community we're building.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard
            v-for="value in values"
            :key="value.id"
            class="text-center"
          >
            <div class="p-6">
              <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon
                  :icon="value.icon"
                  class="w-8 h-8 text-white"
                />
              </div>
              <h3 class="text-xl font-semibold text-text-primary mb-3">
                {{ value.title }}
              </h3>
              <p class="text-text-secondary">
                {{ value.description }}
              </p>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Team Section -->
    <section class="py-20">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-4">
            Meet Our Team
          </h2>
          <p class="text-lg text-text-secondary max-w-2xl mx-auto">
            The passionate people behind MetaStack, working to make developer communities better.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard
            v-for="member in team"
            :key="member.id"
            class="text-center"
          >
            <div class="p-6">
              <div class="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl font-bold">{{ member.name[0] }}</span>
              </div>
              <h3 class="text-xl font-semibold text-text-primary mb-1">
                {{ member.name }}
              </h3>
              <p class="text-primary-500 mb-3">
                {{ member.role }}
              </p>
              <p class="text-text-secondary text-sm mb-4">
                {{ member.bio }}
              </p>
              <div class="flex justify-center space-x-3">
                <a
                  v-if="member.linkedin"
                  :href="member.linkedin"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-text-tertiary hover:text-primary-500 transition-colors"
                >
                  <FontAwesomeIcon
                    :icon="['fab', 'linkedin']"
                    class="w-5 h-5"
                  />
                </a>
                <a
                  v-if="member.github"
                  :href="member.github"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-text-tertiary hover:text-primary-500 transition-colors"
                >
                  <FontAwesomeIcon
                    :icon="['fab', 'github']"
                    class="w-5 h-5"
                  />
                </a>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Community Section -->
    <section
      id="community"
      class="py-20 bg-bg-primary"
    >
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
              <div class="text-4xl font-bold text-primary-500 mb-2">
                {{ formatCount(stats.activeMembers) }}
              </div>
              <div class="text-text-secondary">
                Active Members
              </div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">
                {{ formatCount(stats.publishedArticles) }}
              </div>
              <div class="text-text-secondary">
                Published Articles
              </div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">
                {{ formatCount(stats.curatedTools) }}
              </div>
              <div class="text-text-secondary">
                Curated Tools
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <HIGButton
              variant="primary"
              size="lg"
              @click="handleGetStarted"
            >
              Get Started Today
            </HIGButton>
            <HIGButton
              variant="secondary"
              size="lg"
              @click="scrollToContact"
            >
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
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faCodeBranch, 
  faUsers, 
  faAward, 
  faLightbulb, 
  faHeart, 
  faBook 
} from '@fortawesome/free-solid-svg-icons'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import { supabase } from '../supabase'

const router = useRouter()

// Values data
const values = ref([
  {
    id: 1,
    title: 'Open Source',
    description: 'We believe in transparency, collaboration, and giving back to the community.',
    icon: faCodeBranch
  },
  {
    id: 2,
    title: 'Inclusivity',
    description: 'Everyone deserves a seat at the table, regardless of background or experience level.',
    icon: faUsers
  },
  {
    id: 3,
    title: 'Quality',
    description: 'We maintain high standards in everything we do, from code to content.',
    icon: faAward
  },
  {
    id: 4,
    title: 'Innovation',
    description: 'We embrace new technologies and approaches to solve real-world problems.',
    icon: faLightbulb
  },
  {
    id: 5,
    title: 'Community',
    description: 'Strong communities are built on trust, respect, and mutual support.',
    icon: faHeart
  },
  {
    id: 6,
    title: 'Learning',
    description: 'We foster a culture of continuous learning and knowledge sharing.',
    icon: faBook
  }
])

// Team data
const team = ref([
  {
    id: 1,
    name: 'Ricardo Moses',
    role: 'Co-Founder and Full-Stack Developer',
    bio: 'Full-stack developer with 3+ years of experience building scalable web applications.',
    linkedin: 'https://www.linkedin.com/in/the-dev-ricardo/',
    github: 'https://github.com/RicardoRonan'
  },
  {
    id: 2,
    name: 'Jesse Spence',
    role: 'Co-Founder and Seo Specialist',
    bio: 'Seo specialist with 3+ years of experience optimizing websites for search engines.',
    linkedin: 'https://www.linkedin.com/in/jesse-spence-83606b210/',
    github: 'https://github.com/JesseSpence'
  },
  {
    id: 3,
    name: 'Abdus-Samad Charles',
    role: 'Co-Founder and Seo specialist',
    bio: 'Seo specialist with 3+ years of experience optimizing websites for search engines.',
    linkedin: 'https://www.linkedin.com/in/abdus-samad-charles-75036b210/',
    github: 'https://github.com/Abdus-Samad-Charles'
  }
])

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
    // Fetch users count using database function
    try {
      const { data: usersCount, error: usersError } = await supabase
        .rpc('get_user_count')
      
      if (usersError) {
        // Try alternative: count users directly
        const { count: directCount, error: directError } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
        
        if (!directError && directCount !== null && directCount !== undefined) {
          stats.value.activeMembers = directCount
        }
      } else if (usersCount !== null && usersCount !== undefined) {
        stats.value.activeMembers = usersCount
      }
    } catch (err) {
      // Keep default value
    }
    
    // Fetch published blogs count
    try {
      const { count: blogsCount, error: blogsError } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('published', true)
      
      if (!blogsError && blogsCount !== null && blogsCount !== undefined) {
        stats.value.publishedArticles = blogsCount
      }
    } catch (err) {
      // Keep default value
    }
    
    // Fetch tools count
    try {
      const { count: toolsCount, error: toolsError } = await supabase
        .from('tools')
        .select('*', { count: 'exact', head: true })
      
      if (!toolsError && toolsCount !== null && toolsCount !== undefined) {
        stats.value.curatedTools = toolsCount
      }
    } catch (err) {
      // Keep default value
    }
  } catch (error) {
    // Keep default values of 0 if fetch fails
  }
}

// Methods
const scrollToContact = () => {
  // This would scroll to contact section if it exists
  window.location.href = '/contact'
}


const handleGetStarted = () => {
  // Navigate to home with signup query parameter
  router.push({ path: '/', query: { signup: 'true' } })
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchStats()
})
</script>

