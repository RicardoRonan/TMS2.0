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
    
    // Timeout protection: prevent hanging if API becomes unresponsive
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Auth callback timed out after 10 seconds')), 10000)
    )
    
    if (code) {
      // PKCE flow: Exchange authorization code for session (with timeout)
      const exchangePromise = supabase.auth.exchangeCodeForSession(code)
      const result = await Promise.race([exchangePromise, timeoutPromise]) as any
      
      const { data, error } = result || { data: null, error: null }
      
      if (error) {
        // Error exchanging code - redirect to home
        router.push('/')
        return
      }
      
      if (data?.session) {
        // Successfully authenticated, reload the page to refresh all state
        window.location.href = '/'
        return
      }
    } else {
      // Non-PKCE flow: Check for existing session (with timeout)
      const sessionPromise = supabase.auth.getSession()
      const result = await Promise.race([sessionPromise, timeoutPromise]) as any
      
      const { data, error } = result || { data: null, error: null }
      
      if (error) {
        router.push('/')
        return
      }
      
      if (data?.session) {
        // Successfully authenticated, reload the page to refresh all state
        window.location.href = '/'
        return
      }
    }
    
    // No session found, redirect to home
    router.push('/')
  } catch (error) {
    // Error handling auth callback (including timeout) - redirect to home
    router.push('/')
  }
})
</script>

