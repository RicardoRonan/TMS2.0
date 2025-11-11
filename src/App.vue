<template>
  <div id="app">
    <!-- Navigation -->
    <NavBar />
    
    <!-- Main Content -->
    <main class="min-h-screen">
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import CookieConsentBanner from './components/CookieConsentBanner.vue'

const store = useStore()

const isLoading = computed(() => store.getters.isLoading)

onMounted(() => {
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

  // Auth state management is now handled centrally by useAuth composable
  // No need for duplicate listeners here
})

onUnmounted(() => {
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
</style>

