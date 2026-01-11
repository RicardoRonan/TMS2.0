<template>
  <div
    id="app"
    class="transition-transform duration-300 ease-in-out md:!transform-none md:!translate-x-0"
    :class="{ 'translate-x-[280px]': isMobileSidebarOpen }"
  >
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main 
      id="main-content" 
      :class="mainContentClasses"
    >
      <router-view v-slot="{ Component, route }">
        <transition
          name="page"
          mode="out-in"
        >
          <component
            :is="Component"
            :key="route.path"
          />
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
    
    <!-- Mobile Bottom Navigation -->
    <MobileBottomNav />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, inject, type Ref } from 'vue'
import { useStore } from 'vuex'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import CookieConsentBanner from './components/CookieConsentBanner.vue'
import AdminBottomNav from './components/AdminBottomNav.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts'
import { cleanupAuthListener } from './composables/useAuth'

const store = useStore()

// Initialize keyboard shortcuts for admin mode
useKeyboardShortcuts()

const isLoading = computed(() => store.getters.isLoading)
const isAdminMode = computed(() => store.getters.isAdminMode)
const currentUser = computed(() => store.getters.currentUser)
const isAdmin = computed(() => currentUser.value?.isAdmin || false)

// Inject sidebar state from NavBar
const sidebarState = inject<Ref<boolean>>('isMobileSidebarOpen', ref(false))
const isMobileSidebarOpen = computed(() => sidebarState?.value ?? false)

// Computed class for main content padding when both navbars are visible on mobile
const mainContentClasses = computed(() => {
  const baseClasses = 'min-h-screen md:pt-0 pt-14 md:pb-0'
  // On mobile, if admin mode is active and user is admin, add extra padding for both navbars
  try {
    if (isAdminMode.value && isAdmin.value) {
      return `${baseClasses} pb-32`
    }
  } catch (error) {
    // Error computing classes - use default
  }
  return `${baseClasses} pb-16`
})
// With autoRefreshToken: true, Supabase automatically handles session refresh
// No need for manual session management - Supabase handles it internally

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

  // Auth listener is handled globally by useAuth.ts
  // With autoRefreshToken: true, Supabase automatically manages session refresh
  // No manual session management needed
})

onUnmounted(() => {
  // Clean up auth listener to prevent memory leaks
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

/* Mobile sidebar content push */
@media (max-width: 767px) {
  #main-content {
    will-change: transform;
  }
}
</style>

