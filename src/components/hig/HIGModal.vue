<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div :class="modalClasses" @click.stop>
          <header v-if="$slots.header || showClose" class="flex items-center justify-between p-6 border-b border-border-primary">
            <slot name="header">
              <h3 class="text-lg font-semibold text-text-primary">{{ title }}</h3>
            </slot>
            <button
              v-if="showClose"
              class="p-2 text-text-tertiary hover:text-text-primary transition-colors"
              @click="close"
              aria-label="Close modal"
            >
              <Icon name="close" :size="20" />
            </button>
          </header>
          
          <div class="modal-content p-6">
            <slot />
          </div>
          
          <footer v-if="$slots.footer" class="flex items-center justify-end gap-3 p-6 border-t border-border-primary">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, nextTick, onUnmounted } from 'vue'
import Icon from '../Icon.vue'

interface Props {
  isOpen: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showClose?: boolean
  closeOnOverlay?: boolean
  closeOnEscape?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'md',
  showClose: true,
  closeOnOverlay: true,
  closeOnEscape: true
})

const emit = defineEmits<{
  close: []
  'update:isOpen': [value: boolean]
}>()

const modalClasses = computed(() => [
  'modal',
  `modal-${props.size}`
])

const close = () => {
  emit('close')
  emit('update:isOpen', false)
}

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    close()
  }
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.closeOnEscape) {
    close()
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    })
  } else {
    document.removeEventListener('keydown', handleEscape)
    // Use setTimeout to ensure cleanup happens even if component unmounts
    setTimeout(() => {
      document.body.style.overflow = ''
    }, 100)
  }
})

// Safety: Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  overflow-y: auto;
}

.modal {
  background-color: var(--color-bg-secondary);
  border-radius: 0.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 100%;
  max-height: calc(100vh - 2rem);
  margin: auto;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-sm {
  max-width: 32rem;
}

.modal-md {
  max-width: 42rem;
}

.modal-lg {
  max-width: 56rem;
}

.modal-xl {
  max-width: 72rem;
}

/* Tablet adjustments */
@media (max-width: 1024px) {
  .modal-sm {
    max-width: 28rem;
  }
  
  .modal-md {
    max-width: 36rem;
  }
  
  .modal-lg {
    max-width: 48rem;
  }
  
  .modal-xl {
    max-width: 64rem;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0.75rem;
    align-items: flex-start;
    padding-top: 1rem;
    padding-bottom: 1rem;
  }
  
  .modal {
    max-height: calc(100vh - 2rem);
    margin-top: auto;
    margin-bottom: auto;
  }
  
  .modal-sm {
    max-width: calc(100% - 1.5rem);
  }
  
  .modal-md {
    max-width: calc(100% - 1.5rem);
  }
  
  .modal-lg {
    max-width: calc(100% - 1.5rem);
  }
  
  .modal-xl {
    max-width: calc(100% - 1.5rem);
  }
}

/* Ensure modal content is scrollable if needed */
.modal-content {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

/* Make sure header and footer don't scroll */
.modal > header,
.modal > footer {
  flex-shrink: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

