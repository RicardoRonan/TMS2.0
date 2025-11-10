<template>
  <div :class="skeletonClasses">
    <div v-if="type === 'text'" class="skeleton skeleton-text rounded"></div>
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
  type?: 'text' | 'title' | 'avatar' | 'card' | 'button' | 'custom'
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

