<template>
  <div class="flex items-center justify-center min-h-screen bg-bg-primary">
    <div class="text-center">
      <div class="mb-4">
        <HIGSpinner class="mx-auto" />
      </div>
      <p class="text-text-primary text-lg">Completing sign in...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import HIGSpinner from '../components/hig/HIGSpinner.vue'

const router = useRouter()

onMounted(async () => {
  try {
    // Check if we're using PKCE flow (code parameter in URL)
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    
    if (code) {
      // PKCE flow: Exchange authorization code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        // Error exchanging code - redirect to home
        router.push('/')
        return
      }
      
      if (data.session) {
        // Successfully authenticated, reload the page to refresh all state
        window.location.href = '/'
        return
      }
    } else {
      // Non-PKCE flow: Check for existing session
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        router.push('/')
        return
      }
      
      if (data.session) {
        // Successfully authenticated, reload the page to refresh all state
        window.location.href = '/'
        return
      }
    }
    
    // No session found, redirect to home
    router.push('/')
  } catch (error) {
    // Error handling auth callback - redirect to home
    router.push('/')
  }
})
</script>

