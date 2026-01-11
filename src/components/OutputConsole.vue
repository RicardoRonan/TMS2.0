<template>
  <div
    class="output-console"
    :class="wrapperClass"
  >
    <div class="output-console-header">
      <div class="flex items-center space-x-2">
        <Icon
          name="terminal"
          :size="16"
          class="text-text-secondary"
        />
        <span class="text-sm font-medium text-text-primary">Output</span>
        <span
          v-if="outputLines.length > 0"
          class="text-xs text-text-tertiary"
        >
          ({{ outputLines.length }} {{ outputLines.length === 1 ? 'line' : 'lines' }})
        </span>
      </div>
      <button
        v-if="outputLines.length > 0"
        class="text-xs text-text-secondary hover:text-text-primary active:opacity-70 transition-colors"
        aria-label="Clear output"
        @click="clearOutput"
      >
        Clear
      </button>
    </div>
    <div 
      ref="outputContentRef"
      class="output-console-content"
      :class="{ 'output-console-empty': outputLines.length === 0 }"
    >
      <div
        v-if="outputLines.length === 0"
        class="output-console-placeholder"
      >
        <span class="text-text-tertiary">No output yet. Click "Run" to execute your code.</span>
      </div>
      <div
        v-for="(line, index) in outputLines"
        :key="index"
        class="output-console-line"
        :class="line.type"
      >
        <span
          v-if="line.type === 'error'"
          class="output-console-label"
        >Error:</span>
        <span class="output-console-text">{{ line.text }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import Icon from './Icon.vue'

export interface OutputLine {
  text: string
  type: 'stdout' | 'error'
}

interface Props {
  outputLines: OutputLine[]
  wrapperClass?: string
  autoScroll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoScroll: true
})

const emit = defineEmits<{
  clear: []
}>()

const outputContentRef = ref<HTMLDivElement | null>(null)

const clearOutput = () => {
  emit('clear')
}

// Auto-scroll to bottom when new output is added
watch(() => props.outputLines.length, async () => {
  if (props.autoScroll && outputContentRef.value) {
    await nextTick()
    outputContentRef.value.scrollTop = outputContentRef.value.scrollHeight
  }
}, { flush: 'post' })
</script>

<style scoped>
.output-console {
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.output-console-header {
  display: flex;
  items-center: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--color-border-primary);
  background: var(--color-bg-secondary);
}

.output-console-content {
  flex: 1;
  min-height: 150px;
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-3);
  font-family: var(--font-family-mono);
  font-size: 13px;
  line-height: 1.6;
}

.output-console-empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.output-console-placeholder {
  text-align: center;
  color: var(--color-text-tertiary);
}

.output-console-line {
  margin-bottom: var(--space-1);
  word-break: break-word;
}

.output-console-line.stdout {
  color: var(--color-text-secondary);
}

.output-console-line.error {
  color: var(--color-danger);
}

.output-console-label {
  font-weight: var(--font-weight-semibold);
  margin-right: var(--space-2);
}

.output-console-text {
  white-space: pre-wrap;
}

/* Scrollbar styling */
.output-console-content::-webkit-scrollbar {
  width: 8px;
}

.output-console-content::-webkit-scrollbar-track {
  background: var(--color-bg-secondary);
}

.output-console-content::-webkit-scrollbar-thumb {
  background: var(--color-border-primary);
  border-radius: 4px;
}

.output-console-content::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}
</style>
