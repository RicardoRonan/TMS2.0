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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { supabase } from './supabase'
import NavBar from './components/NavBar.vue'
import Footer from './components/Footer.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import LoadingOverlay from './components/LoadingOverlay.vue'
import type { User } from '@supabase/supabase-js'

const store = useStore()

const isLoading = computed(() => store.getters.isLoading)

// Set up global auth state change listener
let authListener: { data: { subscription: any } } | null = null
let visibilityChangeHandler: (() => void) | null = null

async function loadUserData(supabaseUser: User) {
  try {
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user data:', profileError)
    }

    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: userData?.display_name || supabaseUser.user_metadata?.display_name || 'User',
      photoURL: userData?.photo_url || supabaseUser.user_metadata?.avatar_url,
      isAdmin: userData?.is_admin || false,
      createdAt: userData?.created_at || supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: userData?.last_login_at || new Date().toISOString()
    })
  } catch (err: any) {
    console.error('Error loading user data:', err)
    // Still set basic user data from auth
    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.display_name || 'User',
      photoURL: supabaseUser.user_metadata?.avatar_url,
      isAdmin: false,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    })
  }
}

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
    console.warn('Loading state was stuck, resetting...')
    store.dispatch('setLoading', false)
  }

  // Set up auth state change listener to keep user state in sync
  authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session?.user?.email)
    
    // Handle different auth events
    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
        if (session?.user) {
          await loadUserData(session.user)
        }
        break
      
      case 'SIGNED_OUT':
        store.dispatch('setUser', null)
        break
      
      case 'USER_UPDATED':
        if (session?.user) {
          await loadUserData(session.user)
        }
        break
      
      default:
        // For other events, check if we have a session
        if (session?.user) {
          await loadUserData(session.user)
        } else {
          store.dispatch('setUser', null)
        }
    }
  })
  
  // Add visibility change handler to refresh session when tab becomes active
  visibilityChangeHandler = async () => {
    if (!document.hidden) {
      // Tab became visible, check and refresh session if needed
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session on visibility change:', error)
          store.dispatch('setUser', null)
        } else if (!session) {
          store.dispatch('setUser', null)
        } else {
          // Session exists, ensure user data is loaded
          await loadUserData(session.user)
        }
      } catch (err) {
        console.error('Error checking session on visibility change:', err)
      }
    }
  }
  
  document.addEventListener('visibilitychange', visibilityChangeHandler)
})

onUnmounted(() => {
  if (authListener?.data?.subscription) {
    authListener.data.subscription.unsubscribe()
  }
  if (visibilityChangeHandler) {
    document.removeEventListener('visibilitychange', visibilityChangeHandler)
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

