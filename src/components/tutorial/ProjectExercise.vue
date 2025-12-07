<template>
  <div class="project-exercise-container">
    <HIGCard>
      <div class="p-6">
        <div class="project-header">
          <div class="flex items-center space-x-3 mb-2">
            <Icon :name="projectType === 'capstone' ? 'trophy' : 'code'" :size="24" class="text-primary-500" />
            <h3 class="text-2xl font-bold text-text-primary">
              {{ projectType === 'capstone' ? 'Capstone Project' : 'Mini Project' }}
            </h3>
          </div>
          <div class="project-meta">
            <span class="badge badge-secondary">{{ projectType }}</span>
            <span v-if="points > 0" class="points-badge">{{ points }} points</span>
          </div>
        </div>

        <div v-if="instructions" class="project-instructions mb-6">
          <div class="text-lg text-text-secondary leading-relaxed" v-html="renderMarkdown(instructions)"></div>
        </div>

        <!-- Requirements List -->
        <div v-if="requirements && requirements.length > 0" class="requirements-section mb-6">
          <h4 class="text-xl font-semibold text-text-primary mb-3">Requirements</h4>
          <ul class="requirements-list space-y-2">
            <li
              v-for="(requirement, index) in requirements"
              :key="index"
              class="requirement-item flex items-start space-x-2"
            >
              <Icon name="check" :size="16" class="text-primary-500 mt-1 flex-shrink-0" />
              <span class="text-text-secondary">{{ requirement }}</span>
            </li>
          </ul>
        </div>

        <!-- Code Editor -->
        <div class="project-code-editor mb-6">
          <CodeEditor
            ref="codeEditorRef"
            v-model="code"
            :language="language"
            :starter-code="starterCode"
            :show-run-button="true"
            :show-submit-button="true"
            :test-cases="testCases"
            @run="handleRun"
            @submit="handleSubmit"
          />
        </div>

        <!-- Hints Section -->
        <div v-if="hints && hints.length > 0" class="hints-section mt-6">
          <button
            @click="showHints = !showHints"
            class="hints-toggle"
          >
            <Icon :name="showHints ? 'chevron-up' : 'chevron-down'" :size="16" />
            <span>{{ showHints ? 'Hide' : 'Show' }} Hints ({{ hints.length }})</span>
          </button>
          <div v-if="showHints" class="hints-list mt-3 space-y-2">
            <div
              v-for="(hint, index) in hints"
              :key="index"
              class="hint-item p-3 bg-bg-tertiary rounded-lg"
            >
              <div class="font-semibold text-text-primary mb-1">Hint {{ index + 1 }}:</div>
              <div class="text-text-secondary" v-html="renderMarkdown(hint)"></div>
            </div>
          </div>
        </div>

        <!-- Submission Status -->
        <div v-if="isSubmitted" class="submission-status mt-6 p-4 rounded-lg" :class="isPassed ? 'bg-green-500/10 border border-green-500/50' : 'bg-yellow-500/10 border border-yellow-500/50'">
          <div class="flex items-center space-x-2">
            <Icon
              :name="isPassed ? 'check' : 'clock'"
              :size="20"
              :class="isPassed ? 'text-green-500' : 'text-yellow-500'"
            />
            <div class="flex-1">
              <div class="font-semibold" :class="isPassed ? 'text-green-500' : 'text-yellow-500'">
                {{ isPassed ? 'Project Submitted Successfully!' : 'Project Submitted - Under Review' }}
              </div>
              <div v-if="submittedAt" class="text-sm text-text-secondary mt-1">
                Submitted on {{ formatDate(submittedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </HIGCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../../supabase'
import { useStore } from 'vuex'
import { useAuth } from '../../composables/useAuth'
import HIGCard from '../hig/HIGCard.vue'
import CodeEditor from '../CodeEditor.vue'
import Icon from '../Icon.vue'
import { renderMarkdown } from '../../utils/markdown'
import { runJavaScriptCode, type TestCase } from '../../utils/exerciseRunner'

interface Props {
  project: any
  tutorialPageId: string
  projectType?: 'mini_project' | 'capstone'
}

const props = withDefaults(defineProps<Props>(), {
  projectType: 'mini_project'
})

const store = useStore()
const { user } = useAuth()

const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
const code = ref('')
const showHints = ref(false)
const isSubmitted = ref(false)
const isPassed = ref(false)
const submittedAt = ref<string | null>(null)

const language = computed(() => props.project?.language || props.project?.exercise_config?.language || 'javascript')
const starterCode = computed(() => props.project?.starter_code || props.project?.exercise_config?.starter_code || '')
const instructions = computed(() => props.project?.content || props.project?.instructions || '')
const requirements = computed(() => {
  if (props.project?.exercise_config?.requirements) {
    return props.project.exercise_config.requirements
  }
  return []
})
const testCases = computed((): TestCase[] => {
  if (props.project?.test_cases) {
    return props.project.test_cases.map((tc: any) => ({
      input: tc.input,
      expectedOutput: tc.expected_output || tc.expectedOutput,
      description: tc.description
    }))
  }
  if (props.project?.exercise_config?.test_cases) {
    return props.project.exercise_config.test_cases.map((tc: any) => ({
      input: tc.input,
      expectedOutput: tc.expected_output || tc.expectedOutput,
      description: tc.description
    }))
  }
  return []
})
const hints = computed(() => {
  if (props.project?.hints) return props.project.hints
  if (props.project?.exercise_config?.hints) return props.project.exercise_config.hints
  return []
})
const points = computed(() => props.project?.points || props.project?.exercise_config?.points || 50)

onMounted(async () => {
  // Load existing submission if any
  if (user.value?.uid) {
    await loadSubmission()
  }
  
  // Initialize code with starter code
  if (starterCode.value) {
    code.value = starterCode.value
  }
})

const loadSubmission = async () => {
  if (!user.value?.uid || !props.project?.id) return

  try {
    const { data, error } = await supabase
      .from('tutorial_exercise_submissions')
      .select('*')
      .eq('user_id', user.value.uid)
      .eq('tutorial_page_id', props.tutorialPageId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (data) {
      isSubmitted.value = true
      isPassed.value = data.passed || false
      submittedAt.value = data.submitted_at
      if (data.submission_code) {
        code.value = data.submission_code
      }
    }
  } catch (error) {
    console.error('Error loading submission:', error)
  }
}

const handleRun = async () => {
  if (!codeEditorRef.value) return
  
  const codeValue = codeEditorRef.value.getValue()
  if (!codeValue) return

  try {
    const result = await runJavaScriptCode(codeValue, testCases.value)
    
    codeEditorRef.value.setTestResults(result.testResults)
    codeEditorRef.value.setRunning(false)
    
    if (result.error) {
      codeEditorRef.value.setError(result.error)
    }
  } catch (error: any) {
    codeEditorRef.value?.setError(error.message)
    codeEditorRef.value?.setRunning(false)
  }
}

const handleSubmit = async () => {
  if (!codeEditorRef.value || !user.value?.uid) return
  
  const codeValue = codeEditorRef.value.getValue()
  if (!codeValue) return

  codeEditorRef.value.setSubmitting(true)

  try {
    const result = await runJavaScriptCode(codeValue, testCases.value)
    
    // Save submission
    const { error: submitError } = await supabase
      .from('tutorial_exercise_submissions')
      .insert({
        user_id: user.value.uid,
        tutorial_page_id: props.tutorialPageId,
        exercise_id: props.project.id,
        submission_code: codeValue,
        test_results: result.testResults,
        passed: result.passed,
        completed_at: result.passed ? new Date().toISOString() : null
      })

    if (submitError) throw submitError

    codeEditorRef.value.setTestResults(result.testResults)
    codeEditorRef.value.setSubmitting(false)

    isSubmitted.value = true
    isPassed.value = result.passed
    submittedAt.value = new Date().toISOString()

    if (result.passed) {
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Congratulations! Your project passed all tests!'
      })
    } else {
      store.dispatch('addNotification', {
        type: 'warning',
        message: 'Some tests failed. Please review and resubmit.'
      })
    }
  } catch (error: any) {
    codeEditorRef.value?.setError(error.message)
    codeEditorRef.value?.setSubmitting(false)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Error submitting project: ' + error.message
    })
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.project-exercise-container {
  @apply my-8;
}

.project-header {
  @apply mb-4;
}

.project-meta {
  @apply flex items-center space-x-2 mt-2;
}

.points-badge {
  @apply px-2 py-1 text-xs font-semibold rounded bg-primary-500/20 text-primary-500;
}

.project-instructions {
  @apply mb-6;
}

.requirements-section {
  @apply mb-6;
}

.requirements-list {
  @apply list-none;
}

.requirement-item {
  @apply p-2 bg-bg-tertiary rounded;
}

.project-code-editor {
  @apply mb-6;
}

.hints-section {
  @apply border-t border-border-primary pt-4;
}

.hints-toggle {
  @apply flex items-center space-x-2 text-primary-500 hover:text-primary-600 transition-colors;
}

.hint-item {
  @apply border border-border-primary;
}

.submission-status {
  @apply flex items-center space-x-2;
}
</style>

