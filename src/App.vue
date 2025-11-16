<template>
  <div id="app" class="transition-transform duration-300 ease-in-out md:!transform-none md:!translate-x-0" :class="{ 'translate-x-[280px]': isMobileSidebarOpen }">
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main 
      id="main-content" 
      class="min-h-screen"
    >
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
import { computed, onMounted, onUnmounted, ref, inject, type Ref } from 'vue'
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

// Inject sidebar state from NavBar
const sidebarState = inject<Ref<boolean>>('isMobileSidebarOpen', ref(false))
const isMobileSidebarOpen = computed(() => sidebarState?.value ?? false)
// Track session state for debugging and UI reactivity
const session = ref<any>(null)
// Store auth subscription for cleanup
// Auth subscription is now handled globally by useAuth.ts

// Store interval ID for session check cleanup
let sessionCheckInterval: number | null = null

// Handle tab visibility changes to refresh session when tab becomes active
const handleVisibilityChange = async () => {
  if (!document.hidden) {
    // Tab became visible - check and refresh session
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.warn('⚠️ Session check failed on tab visibility:', error)
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !refreshData.session) {
          console.error('❌ Failed to refresh session after tab visibility:', refreshError)
          // Session might be expired - clear user if needed
          if (refreshError?.message?.includes('expired') || refreshError?.message?.includes('invalid')) {
            store.dispatch('setUser', null)
          }
        } else {
          console.log('✅ Session refreshed after tab visibility')
        }
      } else if (session) {
        // Session exists - verify it's still valid
        const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null
        const now = new Date()
        
        // If session expires in less than 5 minutes, refresh it proactively
        if (expiresAt && expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
          console.log('🔄 Session expiring soon, refreshing proactively...')
          await supabase.auth.refreshSession()
        }
      }
    } catch (err) {
      console.warn('⚠️ Error checking session on visibility change:', err)
    }
  }
}

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

  // Handle tab visibility changes to refresh session when tab becomes active
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  // Also check session periodically (every 5 minutes) as a backup
  sessionCheckInterval = window.setInterval(async () => {
    if (!document.hidden) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null
          const now = new Date()
          
          // Refresh if expiring in less than 10 minutes
          if (expiresAt && expiresAt.getTime() - now.getTime() < 10 * 60 * 1000) {
            await supabase.auth.refreshSession()
          }
        }
      } catch (err) {
        console.warn('⚠️ Periodic session check failed:', err)
      }
    }
  }, 5 * 60 * 1000) // Check every 5 minutes
})

onUnmounted(() => {
  // Clean up auth listener to prevent memory leaks and duplicate listeners
  cleanupAuthListener()

  // Clean up visibility change listener
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  // Clean up interval
  if (sessionCheckInterval !== null) {
    clearInterval(sessionCheckInterval)
    sessionCheckInterval = null
  }

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

/* Mobile sidebar content push */
@media (max-width: 767px) {
  #main-content {
    will-change: transform;
  }
}
</style>

