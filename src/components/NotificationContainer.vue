<template>
  <div class="fixed top-4 right-4 z-toast space-y-2">
    <TransitionGroup name="toast" tag="div">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="toastClasses(notification.type)"
        class="toast"
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
              class="text-text-tertiary hover:text-text-primary transition-colors"
              @click="removeNotification(notification.id)"
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
import { computed } from 'vue'
import { useStore } from 'vuex'
import Icon from './Icon.vue'

const store = useStore()

const notifications = computed(() => store.getters.notifications)

const toastClasses = (type: string) => [
  'max-w-sm w-full bg-bg-secondary border rounded-lg shadow-hig p-4',
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
  store.commit('REMOVE_NOTIFICATION', id)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>

