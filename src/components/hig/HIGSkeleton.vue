<template>
  <div :class="skeletonClasses">
    <!-- Blog Card Skeleton -->
    <div v-if="type === 'blog-card'" class="skeleton-blog-card">
      <div class="space-y-3">
        <!-- Category badge and date row (matches: flex items-center space-x-2 text-sm text-text-tertiary) -->
        <div class="flex items-center space-x-2">
          <div class="skeleton skeleton-badge h-5 w-16 rounded-full"></div>
          <div class="skeleton h-4 w-1"></div>
          <div class="skeleton skeleton-text h-4 w-20 rounded"></div>
        </div>
        <!-- Title (matches: text-xl font-semibold line-clamp-2) -->
        <div class="space-y-2">
          <div class="skeleton skeleton-title h-6 w-full rounded"></div>
          <div class="skeleton skeleton-title h-6 w-4/5 rounded"></div>
        </div>
        <!-- Excerpt (matches: text-text-secondary line-clamp-3) -->
        <div class="space-y-2">
          <div class="skeleton skeleton-text h-4 w-full rounded"></div>
          <div class="skeleton skeleton-text h-4 w-full rounded"></div>
          <div class="skeleton skeleton-text h-4 w-5/6 rounded"></div>
        </div>
        <!-- Footer (matches: flex items-center justify-between pt-2) -->
        <div class="flex items-center justify-between pt-2">
          <div class="skeleton skeleton-text h-4 w-20 rounded"></div>
          <div class="flex items-center space-x-1">
            <div class="skeleton skeleton-text h-4 w-20 rounded"></div>
            <div class="skeleton h-4 w-4 rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tool Card Skeleton -->
    <div v-else-if="type === 'tool-card'" class="skeleton-tool-card text-center">
      <!-- Logo container (matches: w-20 h-20 border border-border-primary rounded-xl with shadow) -->
      <div class="skeleton skeleton-logo-container w-20 h-20 rounded-xl mx-auto mb-4 border border-border-primary shadow-sm"></div>
      <!-- Tool name (matches: font-semibold text-text-primary mb-2) -->
      <div class="skeleton skeleton-title h-5 w-3/4 mx-auto mb-2 rounded"></div>
      <!-- Description (matches: text-sm text-text-secondary mb-4 line-clamp-2) -->
      <div class="space-y-2 mb-4">
        <div class="skeleton skeleton-text h-3.5 w-full rounded"></div>
        <div class="skeleton skeleton-text h-3.5 w-5/6 mx-auto rounded"></div>
      </div>
      <!-- Category badge and icons row (matches: space-y-2 with badge and icon buttons) -->
      <div class="space-y-2">
        <div class="flex items-center justify-center">
          <div class="skeleton skeleton-badge h-5 w-1/3 rounded-full"></div>
        </div>
        <div class="flex items-center justify-center space-x-2">
          <div class="skeleton h-4 w-4 rounded"></div>
          <div class="skeleton h-4 w-4 rounded"></div>
        </div>
      </div>
    </div>

    <!-- Tutorial Category Skeleton -->
    <div v-else-if="type === 'tutorial-category'" class="skeleton-tutorial-category">
      <div class="aspect-square bg-bg-tertiary rounded-lg flex flex-col items-center justify-center space-y-3 p-4">
        <div class="skeleton w-12 h-12 rounded-lg"></div>
        <div class="skeleton skeleton-title h-5 w-3/4 rounded"></div>
      </div>
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
  type?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'blog-card' | 'tool-card' | 'tutorial-category' | 'custom'
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

