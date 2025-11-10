<template>
  <div :class="cardClasses">
    <header v-if="$slots.header" class="card-header">
      <slot name="header" />
    </header>
    
    <div v-if="$slots.default" class="card-body">
      <slot />
    </div>
    
    <footer v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  elevated?: boolean
  hover?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  elevated: false,
  hover: true,
  clickable: false
})

const cardClasses = computed(() => [
  'card',
  {
    'card-elevated': props.elevated,
    'hover:shadow-hig-lg': props.hover,
    'cursor-pointer': props.clickable
  }
])
</script>

