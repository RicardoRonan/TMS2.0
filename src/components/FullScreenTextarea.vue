<template>
  <div class="fullscreen-textarea-wrapper">
    <div class="relative">
      <label
        v-if="label"
        :for="textareaId"
        class="block text-sm font-medium text-text-primary mb-2"
      >
        {{ label }}
        <span
          v-if="required"
          class="text-danger ml-1"
        >*</span>
      </label>
      
      <div class="relative">
        <textarea
          :id="textareaId"
          :value="modelValue"
          :placeholder="placeholder"
          :rows="rows"
          :required="required"
          :class="textareaClasses"
          v-bind="$attrs"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
        />
        
        <button
          type="button"
          class="absolute top-2 right-2 p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-md hover:bg-bg-tertiary"
          :disabled="disabled"
          :aria-label="'Expand ' + (label || 'textarea') + ' to full screen'"
          title="Expand to full screen"
          @click="openFullscreen"
        >
          <Icon
            name="expand"
            :size="18"
          />
        </button>
      </div>
      
      <div
        v-if="error || hint"
        class="text-sm mt-2"
      >
        <p
          v-if="error"
          class="text-danger"
        >
          {{ error }}
        </p>
        <p
          v-else-if="hint"
          class="text-text-tertiary"
        >
          {{ hint }}
        </p>
      </div>
    </div>

    <!-- Full Screen Modal -->
    <Teleport to="body">
      <Transition name="fullscreen-modal">
        <div
          v-if="isFullscreen"
          class="fullscreen-overlay"
          @click.self="closeFullscreen"
        >
          <div class="fullscreen-container">
            <div class="fullscreen-header">
              <h3 class="text-lg font-semibold text-text-primary">
                {{ label || 'Edit Content' }}
              </h3>
              <button
                type="button"
                class="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-md hover:bg-bg-tertiary"
                aria-label="Close full screen editor"
                title="Close (ESC)"
                @click="closeFullscreen"
              >
                <Icon
                  name="close"
                  :size="20"
                />
              </button>
            </div>
            
            <div class="fullscreen-content">
              <textarea
                ref="fullscreenTextarea"
                :value="modelValue"
                :placeholder="placeholder"
                :required="required"
                :disabled="disabled"
                :class="['fullscreen-textarea', props.class, { 'opacity-50 cursor-not-allowed': disabled }]"
                v-bind="$attrs"
                @input="handleInput"
              />
            </div>
            
            <div class="fullscreen-footer">
              <p class="text-xs text-text-tertiary">
                Press ESC to close
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import Icon from './Icon.vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  rows?: number
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  rows: 6,
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
  'focus': [event: FocusEvent]
}>()

const textareaId = computed(() => `textarea-${Math.random().toString(36).substr(2, 9)}`)
const isFullscreen = ref(false)
const fullscreenTextarea = ref<HTMLTextAreaElement | null>(null)

const textareaClasses = computed(() => [
  'w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500',
  props.class,
  {
    'border-danger': !!props.error,
    'opacity-50 cursor-not-allowed': props.disabled
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const openFullscreen = () => {
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (fullscreenTextarea.value) {
      fullscreenTextarea.value.focus()
      // Move cursor to end
      const length = fullscreenTextarea.value.value.length
      fullscreenTextarea.value.setSelectionRange(length, length)
    }
  })
}

const closeFullscreen = () => {
  isFullscreen.value = false
  document.body.style.overflow = ''
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    closeFullscreen()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.fullscreen-textarea-wrapper {
  width: 100%;
}

.fullscreen-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.fullscreen-container {
  background-color: var(--color-bg-secondary);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 90vw;
  height: 90vh;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.fullscreen-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--color-border-primary);
  flex-shrink: 0;
}

.fullscreen-content {
  flex: 1;
  padding: 1.5rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.fullscreen-textarea {
  width: 100%;
  height: 100%;
  padding: 1rem;
  background-color: var(--color-bg-primary);
  border: 1px solid var(--color-border-primary);
  border-radius: 0.375rem;
  color: var(--color-text-primary);
  font-family: var(--font-family-mono, 'Courier New', monospace);
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: border-color 0.15s ease;
}

.fullscreen-textarea:focus {
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.fullscreen-textarea::placeholder {
  color: var(--color-text-tertiary);
}

.fullscreen-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--color-border-primary);
  flex-shrink: 0;
}

/* Transition animations */
.fullscreen-modal-enter-active,
.fullscreen-modal-leave-active {
  transition: opacity 0.3s ease;
}

.fullscreen-modal-enter-active .fullscreen-container,
.fullscreen-modal-leave-active .fullscreen-container {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.fullscreen-modal-enter-from {
  opacity: 0;
}

.fullscreen-modal-enter-from .fullscreen-container {
  transform: scale(0.95);
  opacity: 0;
}

.fullscreen-modal-leave-to {
  opacity: 0;
}

.fullscreen-modal-leave-to .fullscreen-container {
  transform: scale(0.95);
  opacity: 0;
}
</style>

