<template>
  <div id="app">
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main id="main-content" class="min-h-screen">
      <router-view v-slot="{ Component, route }">
        <transition name="page" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <Footer />
    
    <!-- Notifications -->
    <NotificationContainer />
    
    <!-- Loading Overlay -->
    <LoadingOverlay v-if="isLoading" />
    
    <!-- Cookie Consent Banner -->
    <CookieConsentBanner />
    
    <!-- Admin Bottom Navigation -->
    <AdminBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import { supabase } from './supabase'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import CookieConsentBanner from './components/CookieConsentBanner.vue'
import AdminBottomNav from './components/AdminBottomNav.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { cleanupAuthListener } from './composables/useAuth'

const store = useStore()

// Initialize keyboard shortcuts for admin mode
useKeyboardShortcuts()

const isLoading = computed(() => store.getters.isLoading)
// Track session state for debugging and UI reactivity
const session = ref<any>(null)
// Store auth subscription for cleanup
// Auth subscription is now handled globally by useAuth.ts

onMounted(async () => {
  // Initialize theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark'
  store.dispatch('setTheme', savedTheme)
  
  // Apply theme to document
  document.documentElement.setAttribute('data-theme', savedTheme)

  // Safety: Ensure body overflow is reset on mount (in case of previous crash)
  document.body.style.overflow = ''
  
  // Safety: Reset loading state if it's stuck
  if (store.getters.isLoading) {
    store.dispatch('setLoading', false)
  }

  // Auth listener is now handled globally by useAuth.ts
  // No need for redundant session restoration or auth listeners here
})

onUnmounted(() => {
  // Clean up auth listener to prevent memory leaks and duplicate listeners
  cleanupAuthListener()

  // Safety: Reset body overflow on unmount
  document.body.style.overflow = ''

  // Safety: Reset loading state
  store.dispatch('setLoading', false)
})
</script>

<style>
/* Page transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .page-enter-active,
  .page-leave-active {
    transition: none;
  }

  .page-enter-from,
  .page-leave-to {
    transform: none;
  }
}
</style>

