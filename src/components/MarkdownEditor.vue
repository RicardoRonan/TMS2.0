<template>
  <div class="markdown-editor-wrapper">
    <div class="relative">
      <label
        v-if="label"
        :for="editorId"
        class="block text-sm font-medium text-text-primary mb-2"
      >
        {{ label }}
        <span
          v-if="required"
          class="text-danger ml-1"
        >*</span>
      </label>
      
      <!-- Toolbar -->
      <div class="toolbar border border-border-primary rounded-t-lg bg-bg-secondary p-2 flex flex-wrap items-center gap-1">
        <!-- Text Formatting -->
        <button
          type="button"
          class="toolbar-btn"
          title="Bold (Ctrl+B)"
          @click="insertMarkdown('**', '**')"
        >
          <Icon
            name="bold"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Italic (Ctrl+I)"
          @click="insertMarkdown('*', '*')"
        >
          <Icon
            name="italic"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Strikethrough"
          @click="insertMarkdown('~~', '~~')"
        >
          <Icon
            name="strikethrough"
            :size="16"
          />
        </button>
        
        <div class="w-px h-6 bg-border-primary mx-1" />
        
        <!-- Headers -->
        <button
          type="button"
          class="toolbar-btn"
          title="Heading 1"
          @click="insertHeader(1)"
        >
          <span class="font-bold">H1</span>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Heading 2"
          @click="insertHeader(2)"
        >
          <span class="font-bold">H2</span>
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Heading 3"
          @click="insertHeader(3)"
        >
          <span class="font-bold">H3</span>
        </button>
        
        <div class="w-px h-6 bg-border-primary mx-1" />
        
        <!-- Lists -->
        <button
          type="button"
          class="toolbar-btn"
          title="Unordered List"
          @click="insertList('unordered')"
        >
          <Icon
            name="list"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Ordered List"
          @click="insertList('ordered')"
        >
          <Icon
            name="list-ordered"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Checklist"
          @click="insertMarkdown('- ', '')"
        >
          <Icon
            name="checkbox"
            :size="16"
          />
        </button>
        
        <div class="w-px h-6 bg-border-primary mx-1" />
        
        <!-- Links & Media -->
        <button
          type="button"
          class="toolbar-btn"
          title="Insert Link"
          @click="insertLink"
        >
          <Icon
            name="link"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Insert Image"
          @click="insertImage"
        >
          <Icon
            name="image"
            :size="16"
          />
        </button>
        
        <div class="w-px h-6 bg-border-primary mx-1" />
        
        <!-- Code -->
        <button
          type="button"
          class="toolbar-btn"
          title="Inline Code"
          @click="insertMarkdown('`', '`')"
        >
          <Icon
            name="code"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Code Block"
          @click="insertCodeBlock"
        >
          <Icon
            name="code-block"
            :size="16"
          />
        </button>
        
        <div class="w-px h-6 bg-border-primary mx-1" />
        
        <!-- Other -->
        <button
          type="button"
          class="toolbar-btn"
          title="Blockquote"
          @click="insertMarkdown('> ', '')"
        >
          <Icon
            name="quote"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Horizontal Rule"
          @click="insertMarkdown('---\n', '')"
        >
          <Icon
            name="minus"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          title="Insert Table"
          @click="insertTable"
        >
          <Icon
            name="table"
            :size="16"
          />
        </button>
        
        <div class="flex-1" />
        
        <!-- View Toggle -->
        <button
          type="button"
          class="toolbar-btn"
          :title="showPreview ? 'Edit Mode' : 'Preview Mode'"
          @click="togglePreview"
        >
          <Icon
            :name="showPreview ? 'edit' : 'eye'"
            :size="16"
          />
        </button>
        <button
          type="button"
          class="toolbar-btn"
          :disabled="disabled"
          title="Fullscreen (F11)"
          @click="openFullscreen"
        >
          <Icon
            name="expand"
            :size="16"
          />
        </button>
      </div>
      
      <!-- Editor Area -->
      <div class="relative border border-t-0 border-border-primary rounded-b-lg overflow-hidden">
        <!-- Textarea -->
        <textarea
          v-if="!showPreview"
          :id="editorId"
          ref="textareaRef"
          :value="modelValue"
          :placeholder="placeholder"
          :rows="rows"
          :required="required"
          :disabled="disabled"
          :class="textareaClasses"
          v-bind="$attrs"
          @input="handleInput"
          @blur="handleBlur"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />
        
        <!-- Preview -->
        <div
          v-else
          class="preview-content p-4 bg-bg-primary min-h-[200px] max-h-[600px] overflow-y-auto prose prose-invert max-w-none"
          v-html="renderedPreview"
        />
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
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-md hover:bg-bg-tertiary"
                  :title="showPreview ? 'Edit Mode' : 'Preview Mode'"
                  @click="togglePreview"
                >
                  <Icon
                    :name="showPreview ? 'edit' : 'eye'"
                    :size="18"
                  />
                </button>
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
            </div>
            
            <!-- Fullscreen Toolbar -->
            <div class="fullscreen-toolbar border-t border-b border-border-primary bg-bg-secondary p-2 flex flex-wrap items-center gap-1 overflow-x-auto">
              <button
                type="button"
                class="toolbar-btn"
                title="Bold"
                @click="insertMarkdown('**', '**')"
              >
                <Icon
                  name="bold"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Italic"
                @click="insertMarkdown('*', '*')"
              >
                <Icon
                  name="italic"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Strikethrough"
                @click="insertMarkdown('~~', '~~')"
              >
                <Icon
                  name="strikethrough"
                  :size="16"
                />
              </button>
              <div class="w-px h-6 bg-border-primary mx-1" />
              <button
                type="button"
                class="toolbar-btn"
                @click="insertHeader(1)"
              >
                <span class="font-bold">H1</span>
              </button>
              <button
                type="button"
                class="toolbar-btn"
                @click="insertHeader(2)"
              >
                <span class="font-bold">H2</span>
              </button>
              <button
                type="button"
                class="toolbar-btn"
                @click="insertHeader(3)"
              >
                <span class="font-bold">H3</span>
              </button>
              <div class="w-px h-6 bg-border-primary mx-1" />
              <button
                type="button"
                class="toolbar-btn"
                title="Unordered List"
                @click="insertList('unordered')"
              >
                <Icon
                  name="list"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Ordered List"
                @click="insertList('ordered')"
              >
                <Icon
                  name="list-ordered"
                  :size="16"
                />
              </button>
              <div class="w-px h-6 bg-border-primary mx-1" />
              <button
                type="button"
                class="toolbar-btn"
                title="Link"
                @click="insertLink"
              >
                <Icon
                  name="link"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Image"
                @click="insertImage"
              >
                <Icon
                  name="image"
                  :size="16"
                />
              </button>
              <div class="w-px h-6 bg-border-primary mx-1" />
              <button
                type="button"
                class="toolbar-btn"
                title="Inline Code"
                @click="insertMarkdown('`', '`')"
              >
                <Icon
                  name="code"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Code Block"
                @click="insertCodeBlock"
              >
                <Icon
                  name="code-block"
                  :size="16"
                />
              </button>
              <div class="w-px h-6 bg-border-primary mx-1" />
              <button
                type="button"
                class="toolbar-btn"
                title="Blockquote"
                @click="insertMarkdown('> ', '')"
              >
                <Icon
                  name="quote"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="HR"
                @click="insertMarkdown('---\n', '')"
              >
                <Icon
                  name="minus"
                  :size="16"
                />
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Table"
                @click="insertTable"
              >
                <Icon
                  name="table"
                  :size="16"
                />
              </button>
            </div>
            
            <div class="fullscreen-content">
              <textarea
                v-if="!showPreview"
                ref="fullscreenTextarea"
                :value="modelValue"
                :placeholder="placeholder"
                :required="required"
                :disabled="disabled"
                :class="['fullscreen-textarea', props.class, { 'opacity-50 cursor-not-allowed': disabled }]"
                v-bind="$attrs"
                @input="handleInput"
                @keydown="handleKeydown"
              />
              <div
                v-else
                class="preview-content fullscreen-preview p-4 bg-bg-primary overflow-y-auto prose prose-invert max-w-none"
                v-html="renderedPreview"
              />
            </div>
            
            <div class="fullscreen-footer">
              <p class="text-xs text-text-tertiary">
                Press ESC to close • {{ showPreview ? 'Preview Mode' : 'Edit Mode' }}
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
import { renderMarkdown } from '../utils/markdown'

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

const editorId = computed(() => `markdown-editor-${Math.random().toString(36).substr(2, 9)}`)
const isFullscreen = ref(false)
const showPreview = ref(false)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const fullscreenTextarea = ref<HTMLTextAreaElement | null>(null)

const textareaClasses = computed(() => [
  'w-full px-4 py-2 bg-bg-primary border-0 text-text-primary placeholder-text-tertiary focus:outline-none font-mono text-sm resize-none',
  props.class,
  {
    'opacity-50 cursor-not-allowed': props.disabled
  }
])

const renderedPreview = computed(() => {
  if (!props.modelValue) return '<p class="text-text-tertiary">Nothing to preview</p>'
  return renderMarkdown(props.modelValue)
})

const getTextarea = () => {
  return isFullscreen.value ? fullscreenTextarea.value : textareaRef.value
}

const getSelection = () => {
  const textarea = getTextarea()
  if (!textarea) return { start: 0, end: 0, text: '' }
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const text = textarea.value.substring(start, end)
  
  return { start, end, text, textarea }
}

const insertText = (before: string, after: string, selectedText?: string) => {
  const textarea = getTextarea()
  if (!textarea) return
  
  const { start, end, text } = getSelection()
  const replacement = selectedText !== undefined ? selectedText : text || 'text'
  const newText = before + replacement + after
  
  const currentValue = props.modelValue
  const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end)
  
  emit('update:modelValue', newValue)
  
  nextTick(() => {
    const newCursorPos = start + before.length + replacement.length
    textarea.setSelectionRange(newCursorPos, newCursorPos)
    textarea.focus()
  })
}

const insertMarkdown = (before: string, after: string) => {
  insertText(before, after)
}

const insertHeader = (level: number) => {
  const { start, text } = getSelection()
  const hashes = '#'.repeat(level)
  const replacement = text || 'Heading'
  insertText(`${hashes} `, '', replacement)
}

const insertList = (type: 'ordered' | 'unordered') => {
  const { start, text } = getSelection()
  const lines = text.split('\n').filter(l => l.trim())
  
  if (lines.length === 0) {
    insertText(type === 'ordered' ? '1. ' : '- ', '')
  } else {
    const listItems = lines.map((line, index) => {
      const prefix = type === 'ordered' ? `${index + 1}. ` : '- '
      return prefix + line.trim()
    }).join('\n')
    insertText('', '', listItems)
  }
}

const insertLink = () => {
  const { text } = getSelection()
  const linkText = text || 'link text'
  const url = prompt('Enter URL:', 'https://')
  if (url) {
    insertText('[', `](${url})`, linkText)
  }
}

const insertImage = () => {
  const { text } = getSelection()
  const altText = text || 'alt text'
  const url = prompt('Enter image URL:', 'https://')
  if (url) {
    insertText('![', `](${url})`, altText)
  }
}

const insertCodeBlock = () => {
  const { text } = getSelection()
  const language = prompt('Enter language (optional):', 'javascript')
  const code = text || '// code here'
  const lang = language ? language : ''
  insertText('```' + lang + '\n', '\n```', code)
}

const insertTable = () => {
  const table = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`
  
  const { start } = getSelection()
  const currentValue = props.modelValue
  const newValue = currentValue.substring(0, start) + '\n' + table + '\n' + currentValue.substring(start)
  emit('update:modelValue', newValue)
  
  nextTick(() => {
    const textarea = getTextarea()
    if (textarea) {
      const newCursorPos = start + table.length + 2
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }
  })
}

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

const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl+B for bold
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    insertMarkdown('**', '**')
  }
  // Ctrl+I for italic
  if (event.ctrlKey && event.key === 'i') {
    event.preventDefault()
    insertMarkdown('*', '*')
  }
  // F11 for fullscreen
  if (event.key === 'F11') {
    event.preventDefault()
    if (isFullscreen.value) {
      closeFullscreen()
    } else {
      openFullscreen()
    }
  }
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const openFullscreen = () => {
  isFullscreen.value = true
  showPreview.value = false
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (fullscreenTextarea.value) {
      fullscreenTextarea.value.focus()
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
.markdown-editor-wrapper {
  width: 100%;
}

.toolbar-btn {
  @apply p-2 text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.preview-content {
  @apply text-text-secondary;
}

.preview-content :deep(h1) {
  @apply text-2xl font-bold text-text-primary mt-4 mb-2;
}

.preview-content :deep(h2) {
  @apply text-xl font-bold text-text-primary mt-3 mb-2;
}

.preview-content :deep(h3) {
  @apply text-lg font-semibold text-text-primary mt-3 mb-1;
}

.preview-content :deep(p) {
  @apply mb-3;
}

.preview-content :deep(code) {
  @apply bg-bg-tertiary text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono;
}

.preview-content :deep(pre) {
  @apply bg-bg-tertiary rounded-lg p-4 my-4 overflow-x-auto;
}

.preview-content :deep(pre code) {
  @apply bg-transparent p-0;
}

.preview-content :deep(ul),
.preview-content :deep(ol) {
  @apply mb-3 ml-6;
}

.preview-content :deep(ul) {
  @apply list-disc;
}

.preview-content :deep(ol) {
  @apply list-decimal;
}

.preview-content :deep(blockquote) {
  @apply border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-text-secondary bg-bg-secondary rounded-r;
}

.preview-content :deep(a) {
  @apply text-primary-500 hover:text-primary-600 underline;
}

.preview-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

.preview-content :deep(table) {
  @apply w-full border-collapse my-4;
}

.preview-content :deep(th),
.preview-content :deep(td) {
  @apply border border-border-primary px-4 py-2 text-left;
}

.preview-content :deep(th) {
  @apply font-semibold text-text-primary bg-bg-secondary;
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
  max-width: 95vw;
  height: 95vh;
  max-height: 95vh;
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

.fullscreen-toolbar {
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

.fullscreen-preview {
  height: 100%;
}

.fullscreen-footer {
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--color-border-primary);
  flex-shrink: 0;
}

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


