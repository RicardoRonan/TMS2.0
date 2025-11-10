<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Project Showcase
          </h1>
          <p class="text-xl text-text-secondary mb-8">
            Explore innovative projects built by our community
          </p>
        </div>
      </div>
    </section>

    <!-- Projects Grid -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard v-for="n in 6" :key="n" class="animate-pulse">
            <div class="p-6">
              <div class="aspect-video bg-bg-tertiary rounded-lg mb-4"></div>
              <div class="h-6 bg-bg-tertiary rounded w-3/4 mb-2"></div>
              <div class="h-4 bg-bg-tertiary rounded w-full"></div>
            </div>
          </HIGCard>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <HIGCard
            v-for="project in projects"
            :key="project.id"
            class="hover:shadow-hig-lg transition-shadow"
          >
            <div class="p-6">
              <div class="aspect-video bg-bg-tertiary rounded-lg mb-4 flex items-center justify-center">
                <span class="text-text-tertiary">Project Image</span>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="badge badge-secondary">{{ project.category }}</span>
                  <span v-if="project.featured" class="badge badge-primary">Featured</span>
                </div>
                <h3 class="text-xl font-semibold text-text-primary">
                  {{ project.title }}
                </h3>
                <p class="text-text-secondary line-clamp-2">
                  {{ project.description }}
                </p>
                <div class="flex flex-wrap gap-2 pt-2">
                  <span
                    v-for="tech in project.technologies"
                    :key="tech"
                    class="text-xs text-text-tertiary"
                  >
                    {{ tech }}
                  </span>
                </div>
                <div class="flex items-center space-x-4 pt-4 border-t border-border-primary">
                  <a
                    v-if="project.githubUrl"
                    :href="project.githubUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-text-tertiary hover:text-primary-500 transition-colors"
                    title="View on GitHub"
                  >
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a
                    v-if="project.liveUrl"
                    :href="project.liveUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-text-tertiary hover:text-primary-500 transition-colors"
                    title="View Live Demo"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import HIGCard from '../components/hig/HIGCard.vue'

const loading = ref(true)
const projects = ref([
  {
    id: 1,
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform built with Vue 3, TypeScript, and Firebase.',
    category: 'Web App',
    featured: true,
    technologies: ['Vue.js', 'TypeScript', 'Firebase'],
    githubUrl: 'https://github.com/example/ecommerce',
    liveUrl: 'https://example.com'
  },
  {
    id: 2,
    title: 'Task Management App',
    description: 'A collaborative task management application with real-time updates.',
    category: 'Productivity',
    featured: false,
    technologies: ['Vue.js', 'Vuex', 'WebSockets'],
    githubUrl: 'https://github.com/example/tasks',
    liveUrl: 'https://tasks.example.com'
  },
  {
    id: 3,
    title: 'Social Media Dashboard',
    description: 'Analytics dashboard for social media metrics and insights.',
    category: 'Analytics',
    featured: true,
    technologies: ['Vue.js', 'Chart.js', 'REST API'],
    githubUrl: 'https://github.com/example/dashboard',
    liveUrl: 'https://dashboard.example.com'
  },
  {
    id: 4,
    title: 'Weather App',
    description: 'Beautiful weather application with location-based forecasts.',
    category: 'Utility',
    featured: false,
    technologies: ['Vue.js', 'Weather API'],
    githubUrl: 'https://github.com/example/weather',
    liveUrl: 'https://weather.example.com'
  },
  {
    id: 5,
    title: 'Music Player',
    description: 'Modern music player with playlist management and audio controls.',
    category: 'Media',
    featured: false,
    technologies: ['Vue.js', 'Web Audio API'],
    githubUrl: 'https://github.com/example/music',
    liveUrl: 'https://music.example.com'
  },
  {
    id: 6,
    title: 'Blog CMS',
    description: 'Content management system for creating and managing blog posts.',
    category: 'CMS',
    featured: true,
    technologies: ['Vue.js', 'Firebase', 'Markdown'],
    githubUrl: 'https://github.com/example/blog-cms',
    liveUrl: 'https://cms.example.com'
  }
])

onMounted(() => {
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
