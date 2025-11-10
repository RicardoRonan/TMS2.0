<template>
  <div 
    :class="spinnerClasses" 
    :aria-label="ariaLabel"
    :style="spinnerStyle"
  >
    <span class="sr-only">{{ ariaLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  ariaLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  ariaLabel: 'Loading'
})

const sizeMap = {
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem'
}

const spinnerStyle = computed(() => ({
  width: sizeMap[props.size],
  height: sizeMap[props.size],
  minWidth: sizeMap[props.size],
  minHeight: sizeMap[props.size]
}))

const spinnerClasses = computed(() => [
  'spinner',
  `spinner-${props.size}`
])
</script>

