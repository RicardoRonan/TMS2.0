<template>
  <div
    class="code-editor-wrapper"
    :class="wrapperClass"
  >
    <div 
      ref="editorContainerRef" 
      class="code-editor-container"
      :style="{ minHeight: `${minHeight}px` }"
    />
    <div
      v-if="loading"
      class="code-editor-loading"
    >
      <div class="flex items-center justify-center p-4 text-text-secondary">
        <div class="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-2" />
        <span>Loading editor...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import loader from '@monaco-editor/loader'

export interface CodeEditorFile {
  name: string
  language: string
  content: string
}

interface Props {
  modelValue: string | CodeEditorFile[]
  language?: string
  readOnly?: boolean
  minHeight?: number
  wrapperClass?: string
  lineNumbers?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
  minHeight: 300,
  lineNumbers: true,
  language: 'javascript'
})

const emit = defineEmits<{
  'update:modelValue': [value: string | CodeEditorFile[]]
  'change': [value: string | CodeEditorFile[]]
}>()

const editorContainerRef = ref<HTMLDivElement | null>(null)
const loading = ref(true)
let editor: any = null
let monaco: any = null

// Determine if we're in multi-file mode
const isMultiFile = computed(() => {
  return Array.isArray(props.modelValue)
})

// Get current code value
const getCurrentCode = () => {
  if (!editor) return ''
  
  if (isMultiFile.value) {
    // For multi-file, return the array structure
    // This is a simplified version - in a real multi-file editor, you'd track all files
    return props.modelValue as CodeEditorFile[]
  } else {
    return editor.getValue()
  }
}

// Detect language from code or use prop
const detectLanguage = (code: string): string => {
  if (props.language) return props.language
  
  // Simple language detection
  if (code.trim().startsWith('<!DOCTYPE') || code.trim().startsWith('<html')) {
    return 'html'
  }
  if (code.includes('function') || code.includes('const') || code.includes('let')) {
    return 'javascript'
  }
  if (code.includes('{') && code.includes('color:') || code.includes('background:')) {
    return 'css'
  }
  return 'javascript'
}

// Initialize Monaco editor
const initEditor = async () => {
  if (!editorContainerRef.value) return
  
  try {
    loading.value = true
    
    // Load Monaco editor
    monaco = await loader.init()
    
    // Configure Monaco theme to match site
    monaco.editor.defineTheme('metastack-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1f1f1f',
        'editor.foreground': '#ffffff',
        'editor.lineHighlightBackground': '#2a2a2a',
        'editor.selectionBackground': '#3a3a3a',
        'editorCursor.foreground': '#eb5e28',
        'editorWhitespace.foreground': '#404040',
        'editorIndentGuide.activeBackground': '#404040',
        'editorIndentGuide.background': '#2a2a2a'
      }
    })
    
    monaco.editor.setTheme('metastack-dark')
    
    // Get initial code value
    const initialCode = isMultiFile.value 
      ? (props.modelValue as CodeEditorFile[])[0]?.content || ''
      : (props.modelValue as string) || ''
    
    const language = isMultiFile.value
      ? (props.modelValue as CodeEditorFile[])[0]?.language || props.language
      : detectLanguage(initialCode)
    
    // Create editor instance
    editor = monaco.editor.create(editorContainerRef.value, {
      value: initialCode,
      language: language,
      theme: 'metastack-dark',
      readOnly: props.readOnly,
      lineNumbers: props.lineNumbers ? 'on' : 'off',
      minimap: { enabled: false },
      fontSize: 14,
      fontFamily: 'SF Mono, Monaco, Inconsolata, Roboto Mono, monospace',
      lineHeight: 1.6,
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
      wordWrap: 'on',
      formatOnPaste: true,
      formatOnType: true
    })
    
    // Listen for changes
    editor.onDidChangeModelContent(() => {
      const newValue = getCurrentCode()
      emit('update:modelValue', newValue)
      emit('change', newValue)
    })
    
    loading.value = false
  } catch (error) {
    console.error('Error initializing Monaco editor:', error)
    loading.value = false
  }
}

// Update editor value when prop changes
watch(() => props.modelValue, (newValue) => {
  if (!editor) return
  
  const currentValue = isMultiFile.value
    ? (newValue as CodeEditorFile[])[0]?.content || ''
    : (newValue as string) || ''
  
  if (editor.getValue() !== currentValue) {
    editor.setValue(currentValue)
  }
}, { deep: true })

// Update read-only state
watch(() => props.readOnly, (readOnly) => {
  if (editor) {
    editor.updateOptions({ readOnly })
  }
})

onMounted(() => {
  initEditor()
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})

// Expose editor instance for parent components
defineExpose({
  editor: computed(() => editor),
  getValue: () => editor?.getValue() || '',
  setValue: (value: string) => editor?.setValue(value || '')
})
</script>

<style scoped>
.code-editor-wrapper {
  position: relative;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-primary);
}

.code-editor-container {
  width: 100%;
}

.code-editor-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
</style>
