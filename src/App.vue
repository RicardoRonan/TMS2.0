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
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useStore } from 'vuex'
import { supabase } from './supabase'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import CookieConsentBanner from './components/CookieConsentBanner.vue'

const store = useStore()

const isLoading = computed(() => store.getters.isLoading)
// Track session state for debugging and UI reactivity
const session = ref<any>(null)
// Store auth subscription for cleanup
let authSubscription: any = null

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

  // Explicitly restore session from localStorage on page load / refresh
  // This is a backup to ensure session is restored even if the auth listener hasn't fired yet
  try {
    console.log('🔄 App.vue: Restoring session from localStorage...')
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('❌ App.vue: Error getting session:', error.message)
      session.value = null
      // Don't clear store here - let the auth listener handle it
    } else if (data.session) {
      session.value = data.session
      console.log('✅ App.vue: Session restored:', data.session.user?.email || 'no email')
      console.log('📋 App.vue: Session user ID:', data.session.user?.id)
      
      // If store doesn't have user but we have a session, sync it
      if (!store.getters.currentUser && data.session.user) {
        console.log('🔄 App.vue: Syncing session to store...')
        store.dispatch('setUser', {
          uid: data.session.user.id,
          email: data.session.user.email,
          displayName: data.session.user.user_metadata?.display_name || 'User',
          photoURL: data.session.user.user_metadata?.avatar_url,
          isAdmin: false,
          createdAt: data.session.user.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        })
      }
    } else {
      session.value = null
      console.log('ℹ️ App.vue: No session found')
    }
  } catch (err: any) {
    console.error('❌ App.vue: Exception during session restore:', err?.message)
    session.value = null
  }

  // Listen for any future auth changes (login, logout, token refresh)
  // This ensures we stay in sync with auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
    console.log('🔄 App.vue: Auth state changed:', event, newSession?.user?.email || 'logged out')
    session.value = newSession
    
    // Sync to store if session exists
    if (newSession?.user) {
      if (!store.getters.currentUser || store.getters.currentUser.uid !== newSession.user.id) {
        console.log('🔄 App.vue: Syncing new session to store...')
        store.dispatch('setUser', {
          uid: newSession.user.id,
          email: newSession.user.email,
          displayName: newSession.user.user_metadata?.display_name || 'User',
          photoURL: newSession.user.user_metadata?.avatar_url,
          isAdmin: false,
          createdAt: newSession.user.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        })
      }
    } else {
      // Session is null - clear store
      if (store.getters.currentUser) {
        console.log('🔄 App.vue: Clearing store (user logged out)')
        store.dispatch('setUser', null)
      }
    }
  })
  authSubscription = subscription
})

onUnmounted(() => {
  // Cleanup auth subscription
  if (authSubscription) {
    authSubscription.unsubscribe()
    console.log('🧹 App.vue: Auth listener cleaned up')
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
</style>

