<template>
  <div class="space-y-2">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-text-primary">
      {{ label }}
      <span v-if="required" class="text-danger ml-1">*</span>
    </label>
    
    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
        v-bind="$attrs"
      />
      
      <div v-if="icon" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <component :is="icon" class="h-5 w-5 text-text-tertiary" />
      </div>
      
      <div v-if="rightIcon" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          type="button"
          class="text-text-tertiary hover:text-text-primary transition-colors"
          @click="handleRightIconClick"
        >
          <component :is="rightIcon" class="h-5 w-5" />
        </button>
      </div>
    </div>
    
    <div v-if="error || hint" class="text-sm">
      <p v-if="error" class="text-danger">{{ error }}</p>
      <p v-else-if="hint" class="text-text-tertiary">{{ hint }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

interface Props {
  modelValue: string | number
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
  icon?: any
  rightIcon?: any
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false,
  size: 'md'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
  'right-icon-click': [event: MouseEvent]
}>()

const inputId = ref(`input-${Math.random().toString(36).substr(2, 9)}`)

const inputClasses = computed(() => [
  'input',
  `input-${props.size}`,
  {
    'input-error': props.error,
    'input-success': !props.error && props.modelValue,
    'pl-10': props.icon,
    'pr-10': props.rightIcon
  }
])

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleBlur = (event: FocusEvent) => {
  emit('blur', event)
}

const handleFocus = (event: FocusEvent) => {
  emit('focus', event)
}

const handleRightIconClick = (event: MouseEvent) => {
  emit('right-icon-click', event)
}
</script>

