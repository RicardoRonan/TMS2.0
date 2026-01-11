<template>
  <div
    class="editable-field relative"
    :class="wrapperClass"
  >
    <!-- Edit indicator when in admin mode -->
    <div 
      v-if="isAdminMode && !isEditing" 
      class="absolute -top-1 -right-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <div class="px-2 py-1 bg-primary-500 text-white text-xs rounded shadow-lg flex items-center space-x-1">
        <Icon
          name="edit"
          :size="12"
        />
        <span>Click to edit</span>
      </div>
    </div>

    <!-- Editable content -->
    <div
      v-if="isAdminMode && !isEditing"
      :class="[
        'editable-content cursor-text group relative',
        contentClass,
        { 'hover:outline hover:outline-2 hover:outline-primary-500/50 hover:outline-offset-2 rounded px-1 -mx-1': isAdminMode }
      ]"
      @click="startEditing"
    >
      <slot :value="modelValue">
        <div
          v-if="as === 'textarea'"
          class="whitespace-pre-wrap"
        >
          {{ modelValue || placeholder }}
        </div>
        <div v-else>
          {{ modelValue || placeholder }}
        </div>
      </slot>
    </div>

    <!-- Input field when editing -->
    <div
      v-else-if="isAdminMode && isEditing"
      class="editable-input-wrapper"
    >
      <input
        v-if="as === 'input'"
        ref="inputRef"
        :type="inputType"
        :value="localValue"
        :placeholder="placeholder"
        :class="[
          'w-full bg-bg-secondary border-2 border-primary-500 rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500',
          inputClass
        ]"
        @input="handleInput"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
        @keydown.esc="handleEscape"
      >
      <div
        v-else-if="as === 'textarea'"
        class="markdown-editor-inline"
      >
        <!-- Markdown Toolbar -->
        <div
          class="toolbar border border-border-primary rounded-t-lg bg-bg-secondary p-2 flex flex-wrap items-center gap-1"
          @mousedown.prevent
        >
          <!-- Text Formatting -->
          <button
            type="button"
            class="toolbar-btn"
            title="Bold (Ctrl+B)"
            @click.stop="insertMarkdown('**', '**')"
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
            @click.stop="insertMarkdown('*', '*')"
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
            @click.stop="insertMarkdown('~~', '~~')"
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
            @click.stop="insertHeader(1)"
          >
            <span class="font-bold text-xs">H1</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Heading 2"
            @click.stop="insertHeader(2)"
          >
            <span class="font-bold text-xs">H2</span>
          </button>
          <button
            type="button"
            class="toolbar-btn"
            title="Heading 3"
            @click.stop="insertHeader(3)"
          >
            <span class="font-bold text-xs">H3</span>
          </button>
          
          <div class="w-px h-6 bg-border-primary mx-1" />
          
          <!-- Lists -->
          <button
            type="button"
            class="toolbar-btn"
            title="Unordered List"
            @click.stop="insertList('unordered')"
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
            @click.stop="insertList('ordered')"
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
            @click.stop="insertMarkdown('- ', '')"
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
            @click.stop="insertLink"
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
            @click.stop="insertImage"
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
            @click.stop="insertMarkdown('`', '`')"
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
            @click.stop="insertCodeBlock"
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
            @click.stop="insertMarkdown('> ', '')"
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
            @click.stop="insertMarkdown('---\n', '')"
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
            @click.stop="insertTable"
          >
            <Icon
              name="table"
              :size="16"
            />
          </button>
          
          <div class="w-px h-6 bg-border-primary mx-1" />
          
          <!-- Fullscreen Button -->
          <button
            type="button"
            class="toolbar-btn"
            title="Expand to full screen (F11)"
            @click.stop="openFullscreen"
          >
            <Icon
              name="expand"
              :size="16"
            />
          </button>
        </div>
        
        <textarea
          ref="textareaRef"
          :value="localValue"
          :placeholder="placeholder"
          :rows="rows"
          :class="[
            'w-full bg-bg-secondary border-2 border-t-0 border-primary-500 rounded-b-lg px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y font-mono text-sm',
            inputClass
          ]"
          @input="handleInput"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @keydown.esc="handleEscape"
        />
      </div>
      <div
        v-else
        ref="contentEditableRef"
        :contenteditable="true"
        :class="[
          'w-full bg-bg-secondary border-2 border-primary-500 rounded px-3 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[2rem]',
          contentClass,
          inputClass
        ]"
        @input="handleContentEditableInput"
        @blur="handleBlur"
        @keydown.esc="handleEscape"
        v-html="localValue"
      />
    </div>

    <!-- Read-only content when not in admin mode -->
    <div
      v-else
      :class="contentClass"
    >
      <slot :value="modelValue">
        <div
          v-if="as === 'textarea'"
          class="whitespace-pre-wrap"
        >
          {{ modelValue || placeholder }}
        </div>
        <div v-else>
          {{ modelValue || placeholder }}
        </div>
      </slot>
    </div>

    <!-- Fullscreen Modal for Textarea -->
    <Teleport to="body">
      <Transition name="fullscreen-modal">
        <div
          v-if="isFullscreen && as === 'textarea'"
          class="fullscreen-overlay"
          @click.self="closeFullscreen"
        >
          <div class="fullscreen-container">
            <div class="fullscreen-header">
              <h3 class="text-lg font-semibold text-text-primary">
                Edit {{ field }}
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
            
            <!-- Fullscreen Toolbar -->
            <div class="fullscreen-toolbar border-b border-border-primary bg-bg-secondary p-2 flex flex-wrap items-center gap-1">
              <!-- Text Formatting -->
              <button
                type="button"
                class="toolbar-btn"
                title="Bold (Ctrl+B)"
                @click.stop="insertMarkdownFullscreen('**', '**')"
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
                @click.stop="insertMarkdownFullscreen('*', '*')"
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
                @click.stop="insertMarkdownFullscreen('~~', '~~')"
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
                @click.stop="insertHeaderFullscreen(1)"
              >
                <span class="font-bold text-xs">H1</span>
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Heading 2"
                @click.stop="insertHeaderFullscreen(2)"
              >
                <span class="font-bold text-xs">H2</span>
              </button>
              <button
                type="button"
                class="toolbar-btn"
                title="Heading 3"
                @click.stop="insertHeaderFullscreen(3)"
              >
                <span class="font-bold text-xs">H3</span>
              </button>
              
              <div class="w-px h-6 bg-border-primary mx-1" />
              
              <!-- Lists -->
              <button
                type="button"
                class="toolbar-btn"
                title="Unordered List"
                @click.stop="insertListFullscreen('unordered')"
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
                @click.stop="insertListFullscreen('ordered')"
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
                @click.stop="insertMarkdownFullscreen('- ', '')"
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
                @click.stop="insertLinkFullscreen"
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
                @click.stop="insertImageFullscreen"
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
                @click.stop="insertMarkdownFullscreen('`', '`')"
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
                @click.stop="insertCodeBlockFullscreen"
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
                @click.stop="insertMarkdownFullscreen('> ', '')"
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
                @click.stop="insertMarkdownFullscreen('---\n', '')"
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
                @click.stop="insertTableFullscreen"
              >
                <Icon
                  name="table"
                  :size="16"
                />
              </button>
            </div>
            
            <div class="fullscreen-content">
              <textarea
                ref="fullscreenTextareaRef"
                :value="localValue"
                :placeholder="placeholder"
                :class="['fullscreen-textarea', inputClass]"
                v-bind="$attrs"
                @input="handleInput"
                @keydown="handleKeydownFullscreen"
                @keydown.esc="closeFullscreen"
              />
            </div>
            
            <div class="fullscreen-footer">
              <p class="text-xs text-text-tertiary">
                Press ESC to close • Changes are saved automatically
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'
import Icon from './Icon.vue'

interface Props {
  modelValue: string
  entityType: string
  entityId: string
  field: string
  as?: 'input' | 'textarea' | 'div'
  inputType?: 'text' | 'email' | 'url'
  placeholder?: string
  rows?: number
  wrapperClass?: string
  contentClass?: string
  inputClass?: string
  debounceMs?: number
}

const props = withDefaults(defineProps<Props>(), {
  as: 'div',
  inputType: 'text',
  placeholder: 'Click to edit...',
  rows: 4,
  debounceMs: 300
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string, oldValue: string]
}>()

const { isAdminMode, recordEdit } = useAdminMode()
const isEditing = ref(false)
const localValue = ref(props.modelValue)
const inputRef = ref<HTMLInputElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const contentEditableRef = ref<HTMLDivElement | null>(null)
const fullscreenTextareaRef = ref<HTMLTextAreaElement | null>(null)
const originalValue = ref(props.modelValue)
const isFullscreen = ref(false)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.modelValue, (newValue) => {
  if (!isEditing.value) {
    localValue.value = newValue
    originalValue.value = newValue
  }
}, { immediate: true })

const startEditing = async () => {
  if (!isAdminMode.value) return
  isEditing.value = true
  originalValue.value = props.modelValue
  localValue.value = props.modelValue
  
  await nextTick()
  
  if (props.as === 'input' && inputRef.value) {
    inputRef.value.focus()
    inputRef.value.select()
  } else if (props.as === 'textarea' && textareaRef.value) {
    textareaRef.value.focus()
    textareaRef.value.select()
  } else if (props.as === 'div' && contentEditableRef.value) {
    contentEditableRef.value.focus()
    // Select all content
    const range = document.createRange()
    range.selectNodeContents(contentEditableRef.value)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement
  localValue.value = target.value
  updateValue(target.value)
}

const handleContentEditableInput = (event: Event) => {
  const target = event.target as HTMLDivElement
  const value = target.innerText || target.textContent || ''
  localValue.value = value
  updateValue(value)
}

const updateValue = (newValue: string) => {
  // Clear existing debounce timer
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  // Debounce the update
  debounceTimer = setTimeout(() => {
    if (newValue !== originalValue.value) {
      // Record the edit
      recordEdit(
        props.entityType,
        props.entityId,
        props.field,
        originalValue.value,
        newValue
      )
      
      emit('update:modelValue', newValue)
      emit('change', newValue, originalValue.value)
    }
    debounceTimer = null
  }, props.debounceMs)
}

// Flush pending debounced update immediately
const flushPendingUpdate = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    // Execute the pending update immediately
    const currentValue = localValue.value
    if (currentValue !== originalValue.value) {
      // Record the edit
      recordEdit(
        props.entityType,
        props.entityId,
        props.field,
        originalValue.value,
        currentValue
      )
      
      emit('update:modelValue', currentValue)
      emit('change', currentValue, originalValue.value)
    }
    debounceTimer = null
  }
}

const handleBlur = () => {
  // Small delay to allow click events to fire first
  setTimeout(() => {
    // Flush any pending debounced update before closing
    flushPendingUpdate()
    isEditing.value = false
  }, 200)
}

const handleEnter = (event: KeyboardEvent) => {
  if (props.as === 'input') {
    event.preventDefault()
    handleBlur()
  }
}

const handleEscape = () => {
  // Revert to original value
  localValue.value = originalValue.value
  emit('update:modelValue', originalValue.value)
  isEditing.value = false
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
}

// Markdown insertion functions (for textarea mode)
const getSelection = () => {
  if (!textareaRef.value) return { start: 0, end: 0, text: '' }
  
  const start = textareaRef.value.selectionStart
  const end = textareaRef.value.selectionEnd
  const text = textareaRef.value.value.substring(start, end)
  
  return { start, end, text, textarea: textareaRef.value }
}

const insertText = (before: string, after: string, selectedText?: string) => {
  if (!textareaRef.value) return
  
  const { start, end, text } = getSelection()
  const replacement = selectedText !== undefined ? selectedText : text || 'text'
  const newText = before + replacement + after
  
  const currentValue = localValue.value
  const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end)
  
  localValue.value = newValue
  updateValue(newValue)
  
  nextTick(() => {
    if (textareaRef.value) {
      const newCursorPos = start + before.length + replacement.length
      textareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
      textareaRef.value.focus()
    }
  })
}

const insertMarkdown = (before: string, after: string) => {
  if (props.as !== 'textarea') return
  insertText(before, after)
}

const insertHeader = (level: number) => {
  if (props.as !== 'textarea') return
  const { text } = getSelection()
  const hashes = '#'.repeat(level)
  const replacement = text || 'Heading'
  insertText(`${hashes} `, '', replacement)
}

const insertList = (type: 'ordered' | 'unordered') => {
  if (props.as !== 'textarea') return
  const { text } = getSelection()
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
  if (props.as !== 'textarea') return
  const { text } = getSelection()
  const linkText = text || 'link text'
  const url = prompt('Enter URL:', 'https://')
  if (url) {
    insertText('[', `](${url})`, linkText)
  }
}

const insertImage = () => {
  if (props.as !== 'textarea') return
  const { text } = getSelection()
  const altText = text || 'alt text'
  const url = prompt('Enter image URL:', 'https://')
  if (url) {
    insertText('![', `](${url})`, altText)
  }
}

const insertCodeBlock = () => {
  if (props.as !== 'textarea') return
  const { text } = getSelection()
  const language = prompt('Enter language (optional):', 'javascript')
  const code = text || '// code here'
  const lang = language ? language : ''
  insertText('```' + lang + '\n', '\n```', code)
}

const insertTable = () => {
  if (props.as !== 'textarea') return
  const table = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`
  
  const { start } = getSelection()
  const currentValue = localValue.value
  const newValue = currentValue.substring(0, start) + '\n' + table + '\n' + currentValue.substring(start)
  localValue.value = newValue
  updateValue(newValue)
  
  nextTick(() => {
    if (textareaRef.value) {
      const newCursorPos = start + table.length + 2
      textareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
      textareaRef.value.focus()
    }
  })
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.as !== 'textarea') return
  
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
    openFullscreen()
  }
}

// Fullscreen functions
const openFullscreen = () => {
  if (props.as !== 'textarea') return
  isFullscreen.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => {
    if (fullscreenTextareaRef.value) {
      fullscreenTextareaRef.value.focus()
      // Move cursor to end
      const length = fullscreenTextareaRef.value.value.length
      fullscreenTextareaRef.value.setSelectionRange(length, length)
    }
  })
}

const closeFullscreen = () => {
  isFullscreen.value = false
  document.body.style.overflow = ''
  // Trigger blur to save if needed
  if (textareaRef.value) {
    textareaRef.value.focus()
    setTimeout(() => {
      handleBlur()
    }, 100)
  }
}

const handleEscapeFullscreen = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    closeFullscreen()
  }
}

// Fullscreen markdown insertion functions
const getFullscreenSelection = () => {
  if (!fullscreenTextareaRef.value) return { start: 0, end: 0, text: '' }
  
  const start = fullscreenTextareaRef.value.selectionStart
  const end = fullscreenTextareaRef.value.selectionEnd
  const text = fullscreenTextareaRef.value.value.substring(start, end)
  
  return { start, end, text, textarea: fullscreenTextareaRef.value }
}

const insertTextFullscreen = (before: string, after: string, selectedText?: string) => {
  if (!fullscreenTextareaRef.value) return
  
  const { start, end, text } = getFullscreenSelection()
  const replacement = selectedText !== undefined ? selectedText : text || 'text'
  const newText = before + replacement + after
  
  const currentValue = localValue.value
  const newValue = currentValue.substring(0, start) + newText + currentValue.substring(end)
  
  localValue.value = newValue
  updateValue(newValue)
  
  nextTick(() => {
    if (fullscreenTextareaRef.value) {
      const newCursorPos = start + before.length + replacement.length
      fullscreenTextareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
      fullscreenTextareaRef.value.focus()
    }
  })
}

const insertMarkdownFullscreen = (before: string, after: string) => {
  if (props.as !== 'textarea') return
  insertTextFullscreen(before, after)
}

const insertHeaderFullscreen = (level: number) => {
  if (props.as !== 'textarea') return
  const { text } = getFullscreenSelection()
  const hashes = '#'.repeat(level)
  const replacement = text || 'Heading'
  insertTextFullscreen(`${hashes} `, '', replacement)
}

const insertListFullscreen = (type: 'ordered' | 'unordered') => {
  if (props.as !== 'textarea') return
  const { text } = getFullscreenSelection()
  const lines = text.split('\n').filter(l => l.trim())
  
  if (lines.length === 0) {
    insertTextFullscreen(type === 'ordered' ? '1. ' : '- ', '')
  } else {
    const listItems = lines.map((line, index) => {
      const prefix = type === 'ordered' ? `${index + 1}. ` : '- '
      return prefix + line.trim()
    }).join('\n')
    insertTextFullscreen('', '', listItems)
  }
}

const insertLinkFullscreen = () => {
  if (props.as !== 'textarea') return
  const { text } = getFullscreenSelection()
  const linkText = text || 'link text'
  const url = prompt('Enter URL:', 'https://')
  if (url) {
    insertTextFullscreen('[', `](${url})`, linkText)
  }
}

const insertImageFullscreen = () => {
  if (props.as !== 'textarea') return
  const { text } = getFullscreenSelection()
  const altText = text || 'alt text'
  const url = prompt('Enter image URL:', 'https://')
  if (url) {
    insertTextFullscreen('![', `](${url})`, altText)
  }
}

const insertCodeBlockFullscreen = () => {
  if (props.as !== 'textarea') return
  const { text } = getFullscreenSelection()
  const language = prompt('Enter language (optional):', 'javascript')
  const code = text || '// code here'
  const lang = language ? language : ''
  insertTextFullscreen('```' + lang + '\n', '\n```', code)
}

const insertTableFullscreen = () => {
  if (props.as !== 'textarea') return
  const table = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |`
  
  const { start } = getFullscreenSelection()
  const currentValue = localValue.value
  const newValue = currentValue.substring(0, start) + '\n' + table + '\n' + currentValue.substring(start)
  localValue.value = newValue
  updateValue(newValue)
  
  nextTick(() => {
    if (fullscreenTextareaRef.value) {
      const newCursorPos = start + table.length + 2
      fullscreenTextareaRef.value.setSelectionRange(newCursorPos, newCursorPos)
      fullscreenTextareaRef.value.focus()
    }
  })
}

const handleKeydownFullscreen = (event: KeyboardEvent) => {
  if (props.as !== 'textarea') return
  
  // Ctrl+B for bold
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault()
    insertMarkdownFullscreen('**', '**')
  }
  // Ctrl+I for italic
  if (event.ctrlKey && event.key === 'i') {
    event.preventDefault()
    insertMarkdownFullscreen('*', '*')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeFullscreen)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeFullscreen)
  if (isFullscreen.value) {
    document.body.style.overflow = ''
  }
  // Cleanup: Flush any pending debounced update and clear timer
  if (debounceTimer) {
    flushPendingUpdate()
  }
})
</script>

<style scoped>
.editable-field {
  position: relative;
}

.editable-content {
  transition: outline 0.2s ease;
}

.editable-input-wrapper {
  position: relative;
}

.markdown-editor-inline {
  position: relative;
}

.toolbar {
  position: relative;
  z-index: 10;
}

.toolbar-btn {
  @apply p-1.5 rounded text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-colors;
  @apply flex items-center justify-center;
  min-width: 32px;
  height: 32px;
}

.toolbar-btn:active {
  @apply bg-bg-tertiary;
}

.toolbar-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

/* Fullscreen Modal Styles */
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

