<template>
  <div class="min-h-screen bg-bg-primary flex items-center justify-center">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-6xl md:text-7xl font-bold text-primary-500 mb-4">🚧</h1>
        <h2 class="text-3xl font-bold text-text-primary mb-4">Coming Soon</h2>
        <p class="text-lg text-text-secondary mb-8 max-w-md mx-auto">
          We're working hard to bring you something amazing. This feature will be available soon!
        </p>
      </div>
      
      <div class="space-y-4">
        <HIGButton variant="primary" size="lg" @click="$router.push('/')">
          Go Home
        </HIGButton>
        <div class="text-center">
          <button 
            class="text-text-tertiary hover:text-primary-500 transition-colors"
            @click="$router.go(-1)"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import HIGButton from '../components/hig/HIGButton.vue'
</script>


