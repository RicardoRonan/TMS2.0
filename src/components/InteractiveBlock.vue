<template>
  <div
    class="interactive-block"
    :class="wrapperClass"
  >
    <!-- Loading State -->
    <div
      v-if="loading"
      class="interactive-block-loading"
    >
      <div class="flex items-center justify-center p-8">
        <div class="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mr-3" />
        <span class="text-text-secondary">Loading interactive block...</span>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !blockDefinition"
      class="interactive-block-error"
    >
      <div class="p-6 bg-bg-secondary border border-danger rounded-lg">
        <div class="flex items-start space-x-3">
          <Icon
            name="error"
            :size="20"
            class="text-danger flex-shrink-0 mt-0.5"
          />
          <div class="flex-1">
            <h3 class="text-text-primary font-semibold mb-1">
              Interactive Block Error
            </h3>
            <p class="text-text-secondary text-sm">
              {{ error || 'Interactive block definition not found' }}
            </p>
            <p
              v-if="isAdminMode"
              class="text-text-tertiary text-xs mt-2"
            >
              Admin: Check that the block ID "{{ blockId }}" exists in the interactive_blocks table.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Interactive Block Content -->
    <div
      v-else
      class="interactive-block-content"
    >
      <!-- Header -->
      <div class="interactive-block-header">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-text-primary mb-1">
            {{ blockDefinition.title }}
          </h3>
          <p
            v-if="blockDefinition.instructions"
            class="text-sm text-text-secondary"
          >
            {{ blockDefinition.instructions }}
          </p>
        </div>
        <div
          v-if="isPassed"
          class="flex items-center space-x-2 text-success"
        >
          <Icon
            name="check"
            :size="18"
          />
          <span class="text-sm font-medium">Completed</span>
        </div>
      </div>

      <!-- Progress Indicator -->
      <div
        v-if="progress"
        class="interactive-block-progress mb-4"
      >
        <div class="flex items-center space-x-2 text-xs text-text-tertiary">
          <span>Status:</span>
          <span
            class="px-2 py-0.5 rounded bg-bg-secondary"
            :class="{
              'text-warning': progress.progress_state === 'in_progress',
              'text-success': progress.progress_state === 'passed',
              'text-text-tertiary': progress.progress_state === 'locked'
            }"
          >
            {{ progress.progress_state === 'in_progress' ? 'In Progress' : 
              progress.progress_state === 'passed' ? 'Passed' : 'Locked' }}
          </span>
        </div>
      </div>

      <!-- Code Editor -->
      <div class="interactive-block-editor mb-4">
        <CodeEditor
          ref="codeEditorRef"
          :model-value="currentCode"
          :language="detectedLanguage"
          :read-only="false"
          :min-height="300"
          @update:model-value="handleCodeChange"
        />
      </div>

      <!-- Controls -->
      <div class="interactive-block-controls mb-4">
        <div class="flex flex-wrap items-center gap-2">
          <HIGButton
            variant="primary"
            size="md"
            :disabled="isRunning || saving"
            :loading="isRunning"
            aria-label="Run code"
            @click="handleRun"
          >
            <Icon
              name="play"
              :size="16"
              class="mr-2"
            />
            Run
          </HIGButton>
          
          <HIGButton
            variant="secondary"
            size="md"
            :disabled="isRunning || saving || !hasOutput"
            aria-label="Check solution"
            @click="handleCheck"
          >
            <Icon
              name="check"
              :size="16"
              class="mr-2"
            />
            Check
          </HIGButton>
          
          <HIGButton
            variant="tertiary"
            size="md"
            :disabled="isRunning"
            aria-label="Reset code and output"
            @click="handleReset"
          >
            <Icon
              name="refresh"
              :size="16"
              class="mr-2"
            />
            Reset
          </HIGButton>
        </div>
      </div>

      <!-- Output Console -->
      <div class="interactive-block-output mb-4">
        <OutputConsole
          :output-lines="outputLines"
          :auto-scroll="true"
          @clear="handleClearOutput"
        />
      </div>

      <!-- Check Results -->
      <div
        v-if="checkResult"
        class="interactive-block-check-results mb-4"
      >
        <div
          class="p-4 rounded-lg border"
          :class="checkResult.pass 
            ? 'bg-success-bg border-success text-success' 
            : 'bg-danger-bg border-danger text-danger'"
        >
          <div class="flex items-start space-x-2">
            <Icon 
              :name="checkResult.pass ? 'check' : 'error'" 
              :size="18" 
              class="flex-shrink-0 mt-0.5" 
            />
            <div class="flex-1">
              <p class="font-semibold mb-1">
                {{ checkResult.pass ? 'All checks passed!' : 'Some checks failed' }}
              </p>
              <ul
                v-if="checkResult.messages.length > 0"
                class="text-sm space-y-1"
              >
                <li
                  v-for="(message, index) in checkResult.messages"
                  :key="index"
                >
                  {{ message }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Sandbox Preview -->
      <div class="interactive-block-preview mb-4">
        <div class="mb-2 text-sm text-text-secondary font-medium">
          Preview
        </div>
        <div
          ref="iframeContainerRef"
          class="interactive-block-iframe-container"
        >
          <!-- Iframe will be inserted here -->
        </div>
      </div>

      <!-- Hints -->
      <div
        v-if="blockDefinition.hints && blockDefinition.hints.length > 0"
        class="interactive-block-hints"
      >
        <button
          class="flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Toggle hints"
          :aria-expanded="showHints"
          @click="showHints = !showHints"
        >
          <Icon
            :name="showHints ? 'chevron-up' : 'chevron-down'"
            :size="16"
          />
          <span>Hints ({{ blockDefinition.hints.length }})</span>
        </button>
        <div
          v-if="showHints"
          class="mt-3 space-y-2"
        >
          <div
            v-for="(hint, index) in blockDefinition.hints"
            :key="index"
            class="p-3 bg-bg-secondary border border-border-primary rounded-lg text-sm text-text-secondary"
          >
            <span class="font-medium text-text-primary">Hint {{ index + 1 }}:</span>
            {{ hint }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useStore } from 'vuex'
import { useAdminMode } from '../composables/useAdminMode'
import { useSandboxRunner } from '../composables/useSandboxRunner'
import { useInteractiveProgress } from '../composables/useInteractiveProgress'
import { runChecks, type CheckContext, requestDomSnapshot } from '../utils/checkEngine'
import CodeEditor from './CodeEditor.vue'
import OutputConsole from './OutputConsole.vue'
import HIGButton from './hig/HIGButton.vue'
import Icon from './Icon.vue'

interface Props {
  blockId: string
  tutorialSlug?: string
  wrapperClass?: string
}

const props = defineProps<Props>()

const store = useStore()
const { isAdminMode } = useAdminMode()

// Progress and block definition
const {
  progress,
  blockDefinition,
  loading,
  saving,
  error,
  loadProgress,
  loadBlockDefinition,
  saveCode,
  markPassed,
  isPassed,
  isInProgress
} = useInteractiveProgress(props.blockId, props.tutorialSlug)

// Sandbox runner
const sandboxRunner = useSandboxRunner()
const outputLines = computed(() => sandboxRunner.outputLines.value)
const isRunning = computed(() => sandboxRunner.isRunning.value)
const errorCount = computed(() => sandboxRunner.errorCount.value)

// Code editor
const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
const currentCode = ref<string>('')
const detectedLanguage = ref<string>('javascript')

// Check results
const checkResult = ref<{ pass: boolean; messages: string[] } | null>(null)

// Hints
const showHints = ref(false)

// Iframe container
const iframeContainerRef = ref<HTMLDivElement | null>(null)

// Check if there's output
const hasOutput = computed(() => outputLines.value.length > 0)

// Initialize code from starter code or saved progress
const initializeCode = () => {
  if (!blockDefinition.value) return

  // Try to load saved code first
  if (progress.value?.saved_code) {
    if (typeof progress.value.saved_code === 'string') {
      currentCode.value = progress.value.saved_code
    } else {
      // Multi-file format - convert to single string for now
      const code = progress.value.saved_code as { html?: string; css?: string; js?: string }
      currentCode.value = code.js || code.html || ''
    }
  } else {
    // Use starter code
    if (typeof blockDefinition.value.starter_code === 'string') {
      currentCode.value = blockDefinition.value.starter_code
    } else {
      // Multi-file format
      const files = (blockDefinition.value.starter_code as { files: Array<{ name: string; language: string; content: string }> }).files
      if (files && files.length > 0) {
        currentCode.value = files[0].content
        detectedLanguage.value = files[0].language || 'javascript'
      }
    }
  }
}

// Handle code changes
const handleCodeChange = (newCode: string) => {
  currentCode.value = newCode
  // Autosave with debounce
  saveCode(newCode, false)
}

// Handle Run button
const handleRun = async () => {
  if (!blockDefinition.value) return

  checkResult.value = null
  
  // Save code immediately before running
  await saveCode(currentCode.value, true)

  // Prepare code for sandbox
  let codeToRun: string | { html?: string; css?: string; js?: string }
  
  if (blockDefinition.value.run_mode === 'web') {
    // For web mode, treat code as HTML/CSS/JS
    // Simple heuristic: if code contains HTML tags, treat as HTML, otherwise as JS
    if (currentCode.value.includes('<') && currentCode.value.includes('>')) {
      codeToRun = currentCode.value
    } else {
      codeToRun = { js: currentCode.value }
    }
  } else {
    codeToRun = currentCode.value
  }

  await sandboxRunner.run(codeToRun)
}

// Handle Check button
const handleCheck = async () => {
  if (!blockDefinition.value || !blockDefinition.value.checks.length) {
    checkResult.value = {
      pass: false,
      messages: ['No checks defined for this block']
    }
    return
  }

  // Get iframe document for DOM checks
  let iframeDocument: Document | undefined
  let domSnapshot: Record<string, any> | undefined

  if (sandboxRunner.iframeRef.value) {
    try {
      // Try to access iframe document (may fail due to sandbox restrictions)
      const iframe = sandboxRunner.iframeRef.value
      if (iframe.contentDocument) {
        iframeDocument = iframe.contentDocument
      } else {
        // Request DOM snapshot via postMessage
        try {
          domSnapshot = await requestDomSnapshot(iframe)
        } catch (err) {
          console.warn('Could not get DOM snapshot:', err)
        }
      }
    } catch (err) {
      console.warn('Could not access iframe document:', err)
    }
  }

  // Build check context
  const context: CheckContext = {
    outputLines: outputLines.value,
    errorCount: errorCount.value,
    iframeDocument,
    domSnapshot
  }

  // Run checks
  const result = runChecks(blockDefinition.value.checks, context)
  checkResult.value = {
    pass: result.pass,
    messages: result.messages
  }

  // If all checks pass, mark as passed and award XP
  if (result.pass) {
    const xpAwarded = await markPassed()
    if (xpAwarded) {
      // XP notification is handled by markPassed
    }
  }
}

// Handle Reset button
const handleReset = () => {
  sandboxRunner.reset()
  checkResult.value = null
  showHints.value = false
  initializeCode()
}

// Handle Clear Output
const handleClearOutput = () => {
  sandboxRunner.clearOutput()
}

// Mount iframe when container is ready
onMounted(async () => {
  await Promise.all([
    loadBlockDefinition(),
    loadProgress()
  ])
  
  // Initialize code after both are loaded
  if (blockDefinition.value) {
    initializeCode()
  }

  // Mount iframe to container
  await nextTick()
  if (iframeContainerRef.value && sandboxRunner.iframeRef.value) {
    const iframe = sandboxRunner.iframeRef.value
    if (!iframeContainerRef.value.contains(iframe)) {
      iframeContainerRef.value.appendChild(iframe)
    }
  }
})

// Watch for iframe creation and mount it
watch(() => sandboxRunner.iframeRef.value, async (iframe) => {
  if (iframe && iframeContainerRef.value) {
    await nextTick()
    if (!iframeContainerRef.value.contains(iframe)) {
      iframeContainerRef.value.appendChild(iframe)
    }
  }
}, { immediate: true })


// Watch for block definition changes
watch(() => blockDefinition.value, () => {
  if (blockDefinition.value) {
    initializeCode()
  }
}, { immediate: true })
</script>

<style scoped>
.interactive-block {
  margin: var(--space-6) 0;
  padding: var(--space-4);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
}

.interactive-block-header {
  display: flex;
  items-center: space-between;
  margin-bottom: var(--space-4);
}

.interactive-block-editor {
  width: 100%;
}

.interactive-block-controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.interactive-block-iframe-container {
  width: 100%;
  min-height: 400px;
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #ffffff;
}

.interactive-block-loading,
.interactive-block-error {
  padding: var(--space-4);
}
</style>
