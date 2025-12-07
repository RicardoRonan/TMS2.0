<template>
  <div class="exercise-container">
    <HIGCard>
      <div class="p-6">
        <div class="exercise-header">
          <h3 class="text-2xl font-bold text-text-primary mb-2">Exercise</h3>
          <div class="exercise-meta">
            <span class="badge badge-secondary">{{ exerciseType }}</span>
            <span v-if="points > 0" class="points-badge">{{ points }} points</span>
          </div>
        </div>

        <div v-if="instructions" class="exercise-instructions mb-6">
          <div class="text-lg text-text-secondary leading-relaxed" v-html="renderMarkdown(instructions)"></div>
        </div>

        <!-- Code Editor Exercise -->
        <div v-if="exerciseType === 'code_editor' || exerciseType === 'mixed'">
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

        <!-- Multiple Choice Exercise -->
        <div v-if="exerciseType === 'multiple_choice' || (exerciseType === 'mixed' && hasMultipleChoice)">
          <div class="multiple-choice-container">
            <div
              v-for="(option, index) in multipleChoiceOptions"
              :key="index"
              class="option-item"
              :class="{ 'selected': selectedAnswer === option.value, 'correct': showAnswer && isCorrect(option.value), 'incorrect': showAnswer && selectedAnswer === option.value && !isCorrect(option.value) }"
              @click="handleSelectOption(option.value)"
            >
              <div class="option-radio">
                <div v-if="selectedAnswer === option.value" class="radio-dot"></div>
              </div>
              <div class="option-content">
                <div class="option-label">{{ option.label }}</div>
                <div v-if="option.value" class="option-value">{{ option.value }}</div>
              </div>
            </div>
          </div>
          <div v-if="showAnswer && explanation" class="explanation mt-4 p-4 bg-bg-tertiary rounded-lg">
            <div class="font-semibold text-text-primary mb-2">Explanation:</div>
            <div class="text-text-secondary" v-html="renderMarkdown(explanation)"></div>
          </div>
        </div>

        <!-- Text Input Exercise -->
        <div v-if="exerciseType === 'text_input' || (exerciseType === 'mixed' && hasTextInput)">
          <HIGInput
            v-model="textAnswer"
            type="text"
            :placeholder="textInputPlaceholder"
            :disabled="isCompleted"
            class="mb-4"
          />
          <div v-if="showAnswer && explanation" class="explanation mt-4 p-4 bg-bg-tertiary rounded-lg">
            <div class="font-semibold text-text-primary mb-2">Explanation:</div>
            <div class="text-text-secondary" v-html="renderMarkdown(explanation)"></div>
          </div>
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

        <!-- Action Buttons -->
        <div class="exercise-actions mt-6 flex items-center space-x-3">
          <HIGButton
            v-if="!isCompleted && (exerciseType === 'multiple_choice' || exerciseType === 'text_input')"
            variant="primary"
            @click="handleCheckAnswer"
            :loading="isChecking"
          >
            Check Answer
          </HIGButton>
          <HIGButton
            v-if="isCompleted"
            variant="secondary"
            disabled
          >
            <Icon name="check" :size="16" />
            Completed
          </HIGButton>
        </div>

        <!-- Success Message -->
        <div v-if="isCompleted && !showAnswer" class="success-message mt-4 p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
          <div class="flex items-center space-x-2">
            <Icon name="check" :size="20" class="text-green-500" />
            <span class="font-semibold text-green-500">Great job! You completed this exercise.</span>
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
import HIGButton from '../hig/HIGButton.vue'
import HIGInput from '../hig/HIGInput.vue'
import CodeEditor from '../CodeEditor.vue'
import Icon from '../Icon.vue'
import { renderMarkdown } from '../../utils/markdown'
import { runJavaScriptCode, type TestCase, type TestResult } from '../../utils/exerciseRunner'
import { updateProgressOnExerciseComplete } from '../../utils/exerciseProgress'

interface Props {
  exercise: any
  tutorialPageId: string
  categoryId?: string
}

const props = defineProps<Props>()
const store = useStore()
const { user } = useAuth()

const codeEditorRef = ref<InstanceType<typeof CodeEditor> | null>(null)
const code = ref('')
const textAnswer = ref('')
const selectedAnswer = ref<string | null>(null)
const showHints = ref(false)
const showAnswer = ref(false)
const isChecking = ref(false)
const isCompleted = ref(false)

const exerciseType = computed(() => props.exercise?.exercise_type || 'code_editor')
const language = computed(() => props.exercise?.language || 'javascript')
const starterCode = computed(() => props.exercise?.starter_code || '')
const instructions = computed(() => props.exercise?.instructions || '')
const testCases = computed((): TestCase[] => {
  if (!props.exercise?.test_cases) return []
  return props.exercise.test_cases.map((tc: any) => ({
    input: tc.input,
    expectedOutput: tc.expected_output || tc.expectedOutput,
    description: tc.description
  }))
})
const hints = computed(() => props.exercise?.hints || [])
const points = computed(() => props.exercise?.points || 10)
const correctAnswer = computed(() => props.exercise?.correct_answer)
const explanation = computed(() => props.exercise?.explanation)

const multipleChoiceOptions = computed(() => {
  if (!props.exercise?.options) return []
  return props.exercise.options
})

const hasMultipleChoice = computed(() => multipleChoiceOptions.value.length > 0)
const hasTextInput = computed(() => exerciseType.value === 'text_input')
const textInputPlaceholder = computed(() => 'Enter your answer here...')

onMounted(async () => {
  // Load existing submission if any
  if (user.value?.uid) {
    await loadSubmission()
  }
  
  // Initialize code with starter code
  if (starterCode.value && exerciseType.value === 'code_editor') {
    code.value = starterCode.value
  }
})

const loadSubmission = async () => {
  if (!user.value?.uid || !props.exercise?.id) return

  try {
    const { data, error } = await supabase
      .from('tutorial_exercise_submissions')
      .select('*')
      .eq('user_id', user.value.uid)
      .eq('exercise_id', props.exercise.id)
      .eq('tutorial_page_id', props.tutorialPageId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error

    if (data && data.passed) {
      isCompleted.value = true
      if (data.submission_code) {
        code.value = data.submission_code
      }
      if (data.submission_answer) {
        selectedAnswer.value = data.submission_answer
        textAnswer.value = data.submission_answer
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
        exercise_id: props.exercise.id,
        submission_code: codeValue,
        test_results: result.testResults,
        passed: result.passed,
        completed_at: result.passed ? new Date().toISOString() : null
      })

    if (submitError) throw submitError

    codeEditorRef.value.setTestResults(result.testResults)
    codeEditorRef.value.setSubmitting(false)

    if (result.passed) {
      isCompleted.value = true
      
      // Update tutorial progress
      if (user.value?.uid && props.categoryId) {
        await updateProgressOnExerciseComplete(
          user.value.uid,
          props.tutorialPageId,
          props.categoryId
        )
      }
      
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Congratulations! You passed all test cases.'
      })
    } else {
      store.dispatch('addNotification', {
        type: 'warning',
        message: 'Some test cases failed. Please review and try again.'
      })
    }
  } catch (error: any) {
    codeEditorRef.value?.setError(error.message)
    codeEditorRef.value?.setSubmitting(false)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Error submitting exercise: ' + error.message
    })
  }
}

const handleSelectOption = (value: string) => {
  if (isCompleted.value) return
  selectedAnswer.value = value
}

const handleCheckAnswer = async () => {
  if (!user.value?.uid) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Please log in to check your answer.'
    })
    return
  }

  isChecking.value = true
  showAnswer.value = true

  const isCorrectAnswer = checkAnswer()

  try {
    await supabase
      .from('tutorial_exercise_submissions')
      .insert({
        user_id: user.value.uid,
        tutorial_page_id: props.tutorialPageId,
        exercise_id: props.exercise.id,
        submission_answer: selectedAnswer.value || textAnswer.value,
        passed: isCorrectAnswer,
        completed_at: isCorrectAnswer ? new Date().toISOString() : null
      })

    if (isCorrectAnswer) {
      isCompleted.value = true
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Correct! Well done.'
      })
    } else {
      store.dispatch('addNotification', {
        type: 'warning',
        message: 'Incorrect. Please try again.'
      })
    }
  } catch (error: any) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Error saving answer: ' + error.message
    })
  } finally {
    isChecking.value = false
  }
}

const checkAnswer = (): boolean => {
  if (exerciseType.value === 'multiple_choice') {
    const correctAnswers = props.exercise?.correct_answers || [props.exercise?.correct_answer]
    return correctAnswers.includes(selectedAnswer.value)
  } else if (exerciseType.value === 'text_input') {
    const correctAnswerValue = correctAnswer.value?.toLowerCase().trim()
    const userAnswer = textAnswer.value.toLowerCase().trim()
    return correctAnswerValue === userAnswer
  }
  return false
}

const isCorrect = (value: string): boolean => {
  const correctAnswers = props.exercise?.correct_answers || [props.exercise?.correct_answer]
  return correctAnswers.includes(value)
}
</script>

<style scoped>
.exercise-container {
  @apply my-8;
}

.exercise-header {
  @apply mb-4;
}

.exercise-meta {
  @apply flex items-center space-x-2 mt-2;
}

.points-badge {
  @apply px-2 py-1 text-xs font-semibold rounded bg-primary-500/20 text-primary-500;
}

.exercise-instructions {
  @apply mb-6;
}

.multiple-choice-container {
  @apply space-y-2;
}

.option-item {
  @apply flex items-start space-x-3 p-4 border border-border-primary rounded-lg cursor-pointer transition-all;
}

.option-item:hover {
  @apply bg-bg-tertiary border-primary-500/50;
}

.option-item.selected {
  @apply bg-primary-500/10 border-primary-500;
}

.option-item.correct {
  @apply bg-green-500/10 border-green-500;
}

.option-item.incorrect {
  @apply bg-red-500/10 border-red-500;
}

.option-radio {
  @apply w-5 h-5 rounded-full border-2 border-border-primary flex items-center justify-center flex-shrink-0 mt-0.5;
}

.option-item.selected .option-radio {
  @apply border-primary-500;
}

.radio-dot {
  @apply w-3 h-3 rounded-full bg-primary-500;
}

.option-content {
  @apply flex-1;
}

.option-label {
  @apply font-medium text-text-primary;
}

.option-value {
  @apply text-sm text-text-secondary mt-1;
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

.exercise-actions {
  @apply flex items-center space-x-3;
}

.success-message {
  @apply flex items-center space-x-2;
}
</style>

