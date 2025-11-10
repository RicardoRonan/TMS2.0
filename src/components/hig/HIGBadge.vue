<template>
  <span :class="badgeClasses">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md'
})

const badgeClasses = computed(() => [
  'badge',
  `badge-${props.variant}`,
  {
    'text-xs px-2 py-0.5': props.size === 'sm',
    'text-sm px-2.5 py-0.5': props.size === 'md',
    'text-base px-3 py-1': props.size === 'lg'
  }
])
</script>

