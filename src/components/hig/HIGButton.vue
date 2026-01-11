<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    :type="type"
    @click="handleClick"
  >
    <HIGSpinner
      v-if="loading"
      size="md"
      class="mr-2"
    />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HIGSpinner from './HIGSpinner.vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  type: 'button',
  fullWidth: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => [
  'btn',
  `btn-${props.variant}`,
  `btn-${props.size}`,
  {
    'w-full': props.fullWidth,
    'opacity-50 cursor-not-allowed': props.disabled || props.loading
  }
])

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

