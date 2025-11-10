<template>
  <div class="fixed inset-0 bg-bg-overlay flex items-center justify-center z-50">
    <div class="bg-bg-secondary rounded-lg p-8 flex flex-col items-center space-y-4">
      <HIGSpinner size="lg" />
      <p class="text-text-primary text-sm">Loading...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import HIGSpinner from './hig/HIGSpinner.vue'
</script>

