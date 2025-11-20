<template>
  <div class="fixed bottom-24 left-1/2 -translate-x-1/2 right-4 md:top-4 md:left-auto md:translate-x-0 md:right-4 md:bottom-auto z-toast space-y-2 w-[calc(100%-2rem)] md:w-[384px]">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="toastClasses(notification.type)"
        class="toast relative"
        :style="getToastStyle(notification.id)"
        @touchstart="handleTouchStart($event, notification.id)"
        @touchmove="handleTouchMove($event, notification.id)"
        @touchend="handleTouchEnd($event, notification.id)"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <Icon :name="getIconName(notification.type)" :size="20" />
          </div>
          <div class="ml-3 flex-1">
            <p class="text-sm font-medium text-text-primary">
              {{ notification.message }}
            </p>
            <p v-if="notification.description" class="mt-1 text-sm text-text-secondary">
              {{ notification.description }}
            </p>
          </div>
          <div class="ml-4 flex-shrink-0">
            <button
              class="text-text-tertiary hover:text-text-primary active:opacity-70 transition-colors p-1"
              @click="removeNotification(notification.id)"
              aria-label="Close notification"
            >
              <Icon name="close" :size="16" />
            </button>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import Icon from './Icon.vue'

const store = useStore()

const notifications = computed(() => store.getters.notifications)

// Swipe state for each notification
const swipeState = ref<Record<number, { startX: number; startY: number; currentX: number; isSwiping: boolean }>>({})

const toastClasses = (type: string) => [
  'w-full bg-bg-secondary border rounded-lg shadow-hig p-4 touch-none select-none',
  {
    'border-success': type === 'success',
    'border-warning': type === 'warning',
    'border-danger': type === 'error',
    'border-info': type === 'info'
  }
]

const getIconName = (type: string) => {
  const icons = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info'
  }
  return icons[type as keyof typeof icons] || 'info'
}

const removeNotification = (id: number) => {
  // Clear swipe state if exists
  if (swipeState.value[id]) {
    delete swipeState.value[id]
  }
  store.commit('REMOVE_NOTIFICATION', id)
}

const getToastStyle = (id: number) => {
  const state = swipeState.value[id]
  if (!state || !state.isSwiping) {
    return {}
  }
  
  const deltaX = state.currentX - state.startX
  const opacity = Math.max(0, 1 - Math.abs(deltaX) / 200)
  
  return {
    transform: `translateX(${deltaX}px)`,
    opacity: opacity.toString()
  }
}

const handleTouchStart = (e: TouchEvent, id: number) => {
  const touch = e.touches[0]
  swipeState.value[id] = {
    startX: touch.clientX,
    startY: touch.clientY,
    currentX: touch.clientX,
    isSwiping: false
  }
}

const handleTouchMove = (e: TouchEvent, id: number) => {
  const state = swipeState.value[id]
  if (!state) return
  
  const touch = e.touches[0]
  const deltaX = touch.clientX - state.startX
  const deltaY = Math.abs(touch.clientY - state.startY)
  
  // Only start swiping if horizontal movement is greater than vertical
  if (Math.abs(deltaX) > 10 && Math.abs(deltaX) > deltaY) {
    state.isSwiping = true
    state.currentX = touch.clientX
    e.preventDefault() // Prevent scrolling while swiping
  }
}

const handleTouchEnd = (e: TouchEvent, id: number) => {
  const state = swipeState.value[id]
  if (!state) return
  
  if (state.isSwiping) {
    const deltaX = state.currentX - state.startX
    const threshold = 100 // Minimum swipe distance to dismiss
    
    if (Math.abs(deltaX) > threshold) {
      // Dismiss notification
      removeNotification(id)
    } else {
      // Reset position
      delete swipeState.value[id]
    }
  } else {
    // Not swiping, clear state
    delete swipeState.value[id]
  }
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

/* Mobile: slide up from bottom */
.toast-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(100%) translateX(100%);
}

/* Desktop: slide in from right */
@media (min-width: 768px) {
  .toast-enter-from {
    transform: translateX(100%);
  }
  
  .toast-leave-to {
    transform: translateX(100%);
  }
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Smooth swipe transition */
.toast {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}

/* Prevent text selection during swipe */
.toast.touch-none {
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
}
</style>

