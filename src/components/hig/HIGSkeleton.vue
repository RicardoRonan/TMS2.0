<template>
  <div :class="skeletonClasses">
    <!-- Blog Card Skeleton -->
    <div v-if="type === 'blog-card'" class="skeleton-blog-card">
      <div class="space-y-3">
        <div class="flex items-center space-x-2">
          <div class="skeleton skeleton-badge h-5 w-16 rounded-full"></div>
          <div class="skeleton skeleton-text h-4 w-20"></div>
        </div>
        <div class="skeleton skeleton-title h-6 w-3/4 rounded"></div>
        <div class="space-y-2">
          <div class="skeleton skeleton-text h-4 w-full rounded"></div>
          <div class="skeleton skeleton-text h-4 w-5/6 rounded"></div>
          <div class="skeleton skeleton-text h-4 w-4/6 rounded"></div>
        </div>
        <div class="flex items-center justify-between pt-2">
          <div class="skeleton skeleton-text h-4 w-20 rounded"></div>
          <div class="skeleton skeleton-button h-4 w-24 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Tool Card Skeleton -->
    <div v-else-if="type === 'tool-card'" class="skeleton-tool-card text-center">
      <div class="skeleton skeleton-logo-container w-20 h-20 rounded-xl mx-auto mb-4"></div>
      <div class="skeleton skeleton-title h-5 w-3/4 mx-auto mb-2 rounded"></div>
      <div class="space-y-2 mb-4">
        <div class="skeleton skeleton-text h-3 w-full rounded"></div>
        <div class="skeleton skeleton-text h-3 w-5/6 mx-auto rounded"></div>
      </div>
      <div class="skeleton skeleton-badge h-5 w-1/3 mx-auto rounded-full"></div>
    </div>

    <!-- Basic Types -->
    <div v-else-if="type === 'text'" class="skeleton skeleton-text rounded"></div>
    <div v-else-if="type === 'title'" class="skeleton skeleton-title rounded"></div>
    <div v-else-if="type === 'avatar'" class="skeleton skeleton-avatar"></div>
    <div v-else-if="type === 'card'" class="skeleton rounded-lg h-32"></div>
    <div v-else-if="type === 'button'" class="skeleton rounded h-10 w-24"></div>
    <div v-else class="skeleton rounded" :style="{ width: width, height: height }"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  type?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'blog-card' | 'tool-card' | 'custom'
  width?: string
  height?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  width: '100%',
  height: '1rem'
})

const skeletonClasses = computed(() => [
  'animate-pulse',
  props.className
])
</script>

