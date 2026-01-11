<template>
  <div
    class="fixed inset-0 bg-bg-overlay flex items-center justify-center z-50"
    @click.self="handleOverlayClick"
  >
    <div class="bg-bg-secondary rounded-lg p-8 flex flex-col items-center space-y-4">
      <HIGSpinner size="lg" />
      <p class="text-text-primary text-sm">
        Loading...
      </p>
      <button 
        class="mt-4 px-4 py-2 text-sm text-text-secondary hover:text-text-primary underline"
        @click="handleCancel"
      >
        Cancel
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import HIGSpinner from './hig/HIGSpinner.vue'

const store = useStore()

// Safety: Auto-hide loading overlay after 30 seconds to prevent it from blocking forever
let timeoutId: ReturnType<typeof setTimeout> | null = null

const handleCancel = () => {
  store.dispatch('setLoading', false)
}

const handleOverlayClick = () => {
  // Allow clicking outside to cancel loading (safety feature)
  store.dispatch('setLoading', false)
}

onMounted(() => {
  // Auto-hide after 30 seconds as a safety measure
  timeoutId = setTimeout(() => {
    console.warn('Loading overlay has been visible for 30 seconds, auto-hiding to prevent click blocking')
    store.dispatch('setLoading', false)
  }, 30000)
})

onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
})
</script>

