<template>
  <div
    :class="alertClasses"
    role="alert"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <Icon
          :name="iconName"
          :size="20"
        />
      </div>
      <div class="ml-3">
        <h3
          v-if="title"
          class="text-sm font-medium"
        >
          {{ title }}
        </h3>
        <div :class="title ? 'mt-2' : ''">
          <p class="text-sm">
            <slot />
          </p>
        </div>
      </div>
      <div
        v-if="dismissible"
        class="ml-auto pl-3"
      >
        <div class="-mx-1.5 -my-1.5">
          <button
            type="button"
            class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
            :class="dismissButtonClasses"
            @click="$emit('dismiss')"
          >
            <span class="sr-only">Dismiss</span>
            <Icon
              name="close"
              :size="20"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Icon from '../Icon.vue'

interface Props {
  type?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false
})

defineEmits<{
  dismiss: []
}>()

const alertClasses = computed(() => [
  'alert',
  `alert-${props.type}`,
  'rounded-lg p-4'
])

const dismissButtonClasses = computed(() => {
  const baseClasses = 'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} text-success hover:bg-success-bg focus:ring-success`
    case 'warning':
      return `${baseClasses} text-warning hover:bg-warning-bg focus:ring-warning`
    case 'error':
      return `${baseClasses} text-danger hover:bg-danger-bg focus:ring-danger`
    case 'info':
    default:
      return `${baseClasses} text-info hover:bg-info-bg focus:ring-info`
  }
})

const iconName = computed(() => {
  switch (props.type) {
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    case 'info':
    default:
      return 'info'
  }
})
</script>

