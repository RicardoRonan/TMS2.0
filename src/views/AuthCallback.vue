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
    // Handle the OAuth callback (with timeout to prevent hanging)
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Session check timed out')), 10000)
    )
    const { data, error } = await Promise.race([sessionPromise, timeoutPromise]) as any
    
    if (error) {
      console.error('Error handling auth callback:', error)
      router.push('/')
      return
    }
    
    if (data.session) {
      // Successfully authenticated, reload the page to refresh all state
      window.location.reload()
    } else {
      // No session found, redirect to home
      router.push('/')
    }
  } catch (error) {
    console.error('Error handling auth callback:', error)
    router.push('/')
  }
})
</script>

