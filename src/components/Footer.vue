<template>
  <footer class="bg-bg-secondary border-t border-border-primary mt-16">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Brand -->
        <div class="space-y-4">
          <div class="flex items-center space-x-2">
            <img src="@/assets/meta-stack-logo.png" alt="MetaStack Logo" class="w-8 h-8" />
            <span class="text-xl font-bold text-text-primary">MetaStack</span>
          </div>
          <p class="text-text-secondary text-sm">
            A digital community platform for developers, designers, and creators to share knowledge and build innovative solutions.
          </p>
          <div class="flex space-x-4">
            <a href="#" class="w-12 h-12 bg-bg-tertiary rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary-500 hover:bg-primary-50 transition-colors" aria-label="Twitter">
              <Icon name="twitter" :size="24" />
            </a>
            <a href="#" class="w-12 h-12 bg-bg-tertiary rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary-500 hover:bg-primary-50 transition-colors" aria-label="GitHub">
              <Icon name="github" :size="24" />
            </a>
            <a href="#" class="w-12 h-12 bg-bg-tertiary rounded-lg flex items-center justify-center text-text-tertiary hover:text-primary-500 hover:bg-primary-50 transition-colors" aria-label="LinkedIn">
              <Icon name="linkedin" :size="24" />
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Quick Links</h3>
          <ul class="space-y-2">
            <li><router-link to="/blog" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Blog</router-link></li>
            <li><router-link to="/tools" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Tools</router-link></li>
            <li><router-link to="/tutorials" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Tutorials</router-link></li>
            <!-- <li><router-link to="/projects" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Projects</router-link></li> -->
          </ul>
        </div>

        <!-- Community -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Community</h3>
          <ul class="space-y-2">
            <li><router-link to="/coming-soon" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Discord</router-link></li>
            <li><router-link to="/coming-soon" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">GitHub</router-link></li>
            <li><router-link to="/coming-soon" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Newsletter</router-link></li>
            <li><router-link to="/coming-soon" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Support</router-link></li>
          </ul>
        </div>

        <!-- Legal -->
        <div class="space-y-4">
          <h3 class="text-sm font-semibold text-text-primary uppercase tracking-wider">Legal</h3>
          <ul class="space-y-2">
            <li><router-link to="/legal/privacy-policy" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Privacy Policy</router-link></li>
            <li><router-link to="/legal/terms-of-service" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Terms of Service</router-link></li>
            <li><router-link to="/legal/cookie-policy" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">Cookie Policy</router-link></li>
            <li>
              <button 
                @click="openCookiePreferences" 
                class="text-text-secondary hover:text-primary-500 transition-colors text-sm text-left"
              >
                Cookie Preferences
              </button>
            </li>
            <li><router-link to="/legal/dmca" class="text-text-secondary hover:text-primary-500 transition-colors text-sm">DMCA</router-link></li>
          </ul>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-border-primary">
        <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p class="text-text-tertiary text-sm">
            © {{ currentYear }} MetaStack. All rights reserved.
          </p>
          <div class="flex items-center space-x-4 text-sm text-text-tertiary">
            <span>Made with ❤️ for developers</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue'
import Icon from './Icon.vue'

const currentYear = computed(() => new Date().getFullYear())

// Try to get the openCookiePreferences function, fallback to window method
const openCookiePreferences = inject<() => void>('openCookiePreferences', () => {
  // Fallback: try window method
  if (typeof window !== 'undefined' && (window as any).openCookiePreferences) {
    (window as any).openCookiePreferences()
  }
})
</script>

