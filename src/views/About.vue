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
              <h2 class="text-3xl font-bold text-text-primary mb-6">Our Mission</h2>
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
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-text-primary">Innovation</h3>
                    <p class="text-text-secondary">Pushing boundaries of what's possible</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-text-primary">Community</h3>
                    <p class="text-text-secondary">Building connections that matter</p>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 class="text-lg font-semibold text-text-primary">Learning</h3>
                    <p class="text-text-secondary">Continuous growth and development</p>
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
          <HIGCard v-for="value in values" :key="value.id" class="text-center">
            <div class="p-6">
              <div class="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <component :is="value.icon" class="w-8 h-8 text-white" />
              </div>
              <h3 class="text-xl font-semibold text-text-primary mb-3">{{ value.title }}</h3>
              <p class="text-text-secondary">{{ value.description }}</p>
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
          <HIGCard v-for="member in team" :key="member.id" class="text-center">
            <div class="p-6">
              <div class="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-white text-2xl font-bold">{{ member.name[0] }}</span>
              </div>
              <h3 class="text-xl font-semibold text-text-primary mb-1">{{ member.name }}</h3>
              <p class="text-primary-500 mb-3">{{ member.role }}</p>
              <p class="text-text-secondary text-sm mb-4">{{ member.bio }}</p>
              <div class="flex justify-center space-x-3">
                <a v-if="member.twitter" :href="member.twitter" class="text-text-tertiary hover:text-primary-500 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a v-if="member.linkedin" :href="member.linkedin" class="text-text-tertiary hover:text-primary-500 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a v-if="member.github" :href="member.github" class="text-text-tertiary hover:text-primary-500 transition-colors">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Community Section -->
    <section id="community" class="py-20 bg-bg-primary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-text-primary mb-6">
            Join Our Growing Community
          </h2>
          <p class="text-lg text-text-secondary mb-8">
            Connect with thousands of developers, designers, and creators who are building the future together.
          </p>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">10K+</div>
              <div class="text-text-secondary">Active Members</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">500+</div>
              <div class="text-text-secondary">Published Articles</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-bold text-primary-500 mb-2">100+</div>
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
import { ref } from 'vue'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'

// Values data
const values = ref([
  {
    id: 1,
    title: 'Open Source',
    description: 'We believe in transparency, collaboration, and giving back to the community.',
    icon: 'CodeBracketIcon'
  },
  {
    id: 2,
    title: 'Inclusivity',
    description: 'Everyone deserves a seat at the table, regardless of background or experience level.',
    icon: 'UsersIcon'
  },
  {
    id: 3,
    title: 'Quality',
    description: 'We maintain high standards in everything we do, from code to content.',
    icon: 'StarIcon'
  },
  {
    id: 4,
    title: 'Innovation',
    description: 'We embrace new technologies and approaches to solve real-world problems.',
    icon: 'LightBulbIcon'
  },
  {
    id: 5,
    title: 'Community',
    description: 'Strong communities are built on trust, respect, and mutual support.',
    icon: 'HeartIcon'
  },
  {
    id: 6,
    title: 'Learning',
    description: 'We foster a culture of continuous learning and knowledge sharing.',
    icon: 'AcademicCapIcon'
  }
])

// Team data
const team = ref([
  {
    id: 1,
    name: 'Alex Chen',
    role: 'Founder & CEO',
    bio: 'Full-stack developer with 10+ years of experience building scalable web applications.',
    twitter: 'https://twitter.com/alexchen',
    linkedin: 'https://linkedin.com/in/alexchen',
    github: 'https://github.com/alexchen'
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    role: 'Head of Design',
    bio: 'UI/UX designer passionate about creating intuitive and beautiful user experiences.',
    twitter: 'https://twitter.com/sarahjohnson',
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    github: 'https://github.com/sarahjohnson'
  },
  {
    id: 3,
    name: 'Mike Rodriguez',
    role: 'Lead Developer',
    bio: 'Backend specialist focused on performance, security, and developer experience.',
    twitter: 'https://twitter.com/mikerodriguez',
    linkedin: 'https://linkedin.com/in/mikerodriguez',
    github: 'https://github.com/mikerodriguez'
  }
])

// Methods
const scrollToContact = () => {
  // This would scroll to contact section if it exists
  window.location.href = '/contact'
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

