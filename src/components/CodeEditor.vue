<template>
  <div class="code-editor-container" :class="{ 'has-error': hasError }">
    <div class="code-editor-header">
      <div class="editor-info">
        <span class="language-badge">{{ language }}</span>
        <span v-if="lineCount > 0" class="line-count">{{ lineCount }} lines</span>
      </div>
      <div class="editor-actions">
        <HIGButton
          v-if="showRunButton"
          variant="secondary"
          size="sm"
          @click="handleRun"
          :loading="isRunning"
          :disabled="!canRun"
        >
          <Icon name="play" :size="16" />
          Run
        </HIGButton>
        <HIGButton
          v-if="showSubmitButton"
          variant="primary"
          size="sm"
          @click="handleSubmit"
          :loading="isSubmitting"
          :disabled="!canSubmit"
        >
          <Icon name="check" :size="16" />
          Submit
        </HIGButton>
      </div>
    </div>
    
    <div ref="editorContainer" class="editor-wrapper"></div>
    
    <div v-if="output" class="code-output">
      <div class="output-header">
        <span class="output-title">Output</span>
        <button @click="output = null" class="close-output">
          <Icon name="close" :size="16" />
        </button>
      </div>
      <pre class="output-content">{{ output }}</pre>
    </div>
    
    <div v-if="error" class="code-error">
      <div class="error-header">
        <Icon name="error" :size="16" />
        <span class="error-title">Error</span>
      </div>
      <pre class="error-content">{{ error }}</pre>
    </div>
    
    <div v-if="testResults && testResults.length > 0" class="test-results">
      <div class="test-results-header">
        <span class="test-results-title">Test Results</span>
        <span class="test-results-summary">
          {{ passedTests }}/{{ testResults.length }} passed
        </span>
      </div>
      <div class="test-results-list">
        <div
          v-for="(result, index) in testResults"
          :key="index"
          class="test-result-item"
          :class="{ 'passed': result.passed, 'failed': !result.passed }"
        >
          <div class="test-result-header">
            <Icon
              :name="result.passed ? 'check' : 'error'"
              :size="16"
              :class="result.passed ? 'text-green-500' : 'text-red-500'"
            />
            <span class="test-result-label">
              Test Case {{ index + 1 }}
              <span v-if="result.description">: {{ result.description }}</span>
            </span>
          </div>
          <div v-if="!result.passed" class="test-result-details">
            <div class="test-detail">
              <span class="test-detail-label">Expected:</span>
              <code>{{ formatValue(result.expected) }}</code>
            </div>
            <div class="test-detail">
              <span class="test-detail-label">Got:</span>
              <code>{{ formatValue(result.actual) }}</code>
            </div>
            <div v-if="result.error" class="test-detail">
              <span class="test-detail-label">Error:</span>
              <code class="text-red-500">{{ result.error }}</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as monaco from 'monaco-editor'
import HIGButton from './hig/HIGButton.vue'
import Icon from './Icon.vue'
import type { TestResult } from '../utils/exerciseRunner'

interface Props {
  modelValue: string
  language?: string
  theme?: string
  readOnly?: boolean
  showRunButton?: boolean
  showSubmitButton?: boolean
  testCases?: any[]
  starterCode?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'run', code: string): void
  (e: 'submit', code: string): void
}

const props = withDefaults(defineProps<Props>(), {
  language: 'javascript',
  theme: 'vs-dark',
  readOnly: false,
  showRunButton: true,
  showSubmitButton: true,
  testCases: () => [],
  starterCode: ''
})

const emit = defineEmits<Emits>()

const editorContainer = ref<HTMLElement | null>(null)
let editor: monaco.editor.IStandaloneCodeEditor | null = null
const output = ref<string | null>(null)
const error = ref<string | null>(null)
const testResults = ref<TestResult[]>([])
const isRunning = ref(false)
const isSubmitting = ref(false)
const hasError = computed(() => !!error.value)

const lineCount = computed(() => {
  if (!editor) return 0
  return editor.getModel()?.getLineCount() || 0
})

const passedTests = computed(() => {
  return testResults.value.filter(r => r.passed).length
})

const canRun = computed(() => {
  return !isRunning.value && !isSubmitting.value && !!editor?.getValue()
})

const canSubmit = computed(() => {
  return !isRunning.value && !isSubmitting.value && !!editor?.getValue()
})

onMounted(() => {
  if (!editorContainer.value) return

  // Initialize Monaco Editor
  editor = monaco.editor.create(editorContainer.value, {
    value: props.modelValue || props.starterCode || '',
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    automaticLayout: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 14,
    lineNumbers: 'on',
    roundedSelection: false,
    cursorStyle: 'line',
    wordWrap: 'on',
    formatOnPaste: true,
    formatOnType: true,
    tabSize: 2,
    insertSpaces: true
  })

  // Listen for changes
  editor.onDidChangeModelContent(() => {
    const value = editor?.getValue() || ''
    emit('update:modelValue', value)
    // Clear errors when user starts typing
    if (error.value) {
      error.value = null
    }
  })
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editor && editor.getValue() !== newValue) {
    editor.setValue(newValue || props.starterCode || '')
  }
})

watch(() => props.language, (newLanguage) => {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel()!, newLanguage)
  }
})

const handleRun = () => {
  if (!editor) return
  const code = editor.getValue()
  isRunning.value = true
  error.value = null
  output.value = null
  testResults.value = []
  emit('run', code)
}

const handleSubmit = () => {
  if (!editor) return
  const code = editor.getValue()
  isSubmitting.value = true
  error.value = null
  output.value = null
  testResults.value = []
  emit('submit', code)
}

const formatValue = (value: any): string => {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

// Expose methods for parent components
defineExpose({
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value),
  setOutput: (value: string) => { output.value = value },
  setError: (value: string) => { error.value = value },
  setTestResults: (results: TestResult[]) => { testResults.value = results },
  setRunning: (value: boolean) => { isRunning.value = value },
  setSubmitting: (value: boolean) => { isSubmitting.value = value }
})
</script>

<style scoped>
.code-editor-container {
  @apply border border-border-primary rounded-lg overflow-hidden bg-bg-secondary;
}

.code-editor-container.has-error {
  @apply border-red-500;
}

.code-editor-header {
  @apply flex items-center justify-between px-4 py-2 bg-bg-tertiary border-b border-border-primary;
}

.editor-info {
  @apply flex items-center space-x-3;
}

.language-badge {
  @apply px-2 py-1 text-xs font-semibold rounded bg-primary-500 text-white;
}

.line-count {
  @apply text-sm text-text-secondary;
}

.editor-actions {
  @apply flex items-center space-x-2;
}

.editor-wrapper {
  @apply min-h-[300px] w-full;
}

.code-output,
.code-error {
  @apply border-t border-border-primary bg-bg-tertiary;
}

.output-header,
.error-header {
  @apply flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border-primary;
}

.output-title,
.error-title {
  @apply font-semibold text-text-primary;
}

.close-output {
  @apply text-text-secondary hover:text-text-primary transition-colors;
}

.output-content,
.error-content {
  @apply px-4 py-3 text-sm font-mono text-text-secondary overflow-x-auto;
}

.error-content {
  @apply text-red-400;
}

.test-results {
  @apply border-t border-border-primary bg-bg-tertiary;
}

.test-results-header {
  @apply flex items-center justify-between px-4 py-2 bg-bg-secondary border-b border-border-primary;
}

.test-results-title {
  @apply font-semibold text-text-primary;
}

.test-results-summary {
  @apply text-sm text-text-secondary;
}

.test-results-list {
  @apply space-y-2 p-4;
}

.test-result-item {
  @apply border border-border-primary rounded-lg p-3;
}

.test-result-item.passed {
  @apply bg-green-500/10 border-green-500/50;
}

.test-result-item.failed {
  @apply bg-red-500/10 border-red-500/50;
}

.test-result-header {
  @apply flex items-center space-x-2 mb-2;
}

.test-result-label {
  @apply font-medium text-text-primary;
}

.test-result-details {
  @apply mt-2 space-y-1 text-sm;
}

.test-detail {
  @apply flex items-start space-x-2;
}

.test-detail-label {
  @apply font-semibold text-text-secondary min-w-[80px];
}

.test-detail code {
  @apply bg-bg-primary px-2 py-1 rounded text-text-primary;
}
</style>

