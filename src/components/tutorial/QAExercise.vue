<template>
  <div class="qa-exercise-container">
    <HIGCard>
      <div class="p-6">
        <div class="qa-header">
          <h3 class="text-2xl font-bold text-text-primary mb-2">Q&A Exercise</h3>
          <div class="qa-meta">
            <span class="badge badge-secondary">{{ questions.length }} Questions</span>
            <span v-if="totalPoints > 0" class="points-badge">{{ totalPoints }} points</span>
          </div>
        </div>

        <div class="questions-list space-y-6 mt-6">
          <div
            v-for="(question, index) in questions"
            :key="question.id"
            class="question-item"
            :class="{ 'answered': questionStates[index]?.answered, 'correct': questionStates[index]?.correct }"
          >
            <div class="question-header">
              <span class="question-number">Question {{ index + 1 }}</span>
              <span v-if="question.points" class="question-points">{{ question.points }} pts</span>
            </div>

            <div class="question-text mb-4">
              <div class="text-lg text-text-primary" v-html="renderMarkdown(question.question_text)"></div>
            </div>

            <!-- Multiple Choice Question -->
            <div v-if="question.question_type === 'multiple_choice'" class="question-options">
              <div
                v-for="(option, optIndex) in question.options"
                :key="optIndex"
                class="option-item"
                :class="{
                  'selected': questionStates[index]?.answer === option.value,
                  'correct': questionStates[index]?.showAnswer && isCorrectAnswer(question, option.value),
                  'incorrect': questionStates[index]?.showAnswer && questionStates[index]?.answer === option.value && !isCorrectAnswer(question, option.value)
                }"
                @click="handleSelectAnswer(index, option.value)"
              >
                <div class="option-radio">
                  <div v-if="questionStates[index]?.answer === option.value" class="radio-dot"></div>
                </div>
                <div class="option-content">
                  <div class="option-label">{{ option.label || option.text }}</div>
                  <div v-if="option.value && option.value !== option.label" class="option-value">{{ option.value }}</div>
                </div>
              </div>
            </div>

            <!-- Text Input Question -->
            <div v-if="question.question_type === 'text_input'" class="question-input">
              <HIGInput
                v-model="questionStates[index].answer"
                type="text"
                placeholder="Enter your answer..."
                :disabled="questionStates[index]?.answered"
                @input="handleTextAnswer(index, $event.target.value)"
              />
            </div>

            <!-- Code Question -->
            <div v-if="question.question_type === 'code'" class="question-code">
              <CodeEditor
                ref="codeEditorRefs"
                :model-value="questionStates[index]?.code || ''"
                :language="question.language || 'javascript'"
                :show-run-button="false"
                :show-submit-button="false"
                @update:model-value="(value) => handleCodeAnswer(index, value)"
              />
            </div>

            <!-- Explanation -->
            <div
              v-if="questionStates[index]?.showAnswer && question.explanation"
              class="explanation mt-4 p-4 bg-bg-tertiary rounded-lg"
            >
              <div class="font-semibold text-text-primary mb-2">Explanation:</div>
              <div class="text-text-secondary" v-html="renderMarkdown(question.explanation)"></div>
            </div>

            <!-- Answer Feedback -->
            <div
              v-if="questionStates[index]?.showAnswer"
              class="answer-feedback mt-4 p-3 rounded-lg"
              :class="questionStates[index]?.correct ? 'bg-green-500/10 border border-green-500/50' : 'bg-red-500/10 border border-red-500/50'"
            >
              <div class="flex items-center space-x-2">
                <Icon
                  :name="questionStates[index]?.correct ? 'check' : 'error'"
                  :size="16"
                  :class="questionStates[index]?.correct ? 'text-green-500' : 'text-red-500'"
                />
                <span :class="questionStates[index]?.correct ? 'text-green-500' : 'text-red-500'">
                  {{ questionStates[index]?.correct ? 'Correct!' : 'Incorrect' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="qa-actions mt-6">
          <HIGButton
            v-if="!allAnswered"
            variant="primary"
            @click="handleSubmitAll"
            :loading="isSubmitting"
            :disabled="!canSubmit"
          >
            Submit Answers
          </HIGButton>
          <div v-else class="completion-message p-4 bg-green-500/10 border border-green-500/50 rounded-lg">
            <div class="flex items-center space-x-2">
              <Icon name="check" :size="20" class="text-green-500" />
              <span class="font-semibold text-green-500">
                Completed! You scored {{ correctCount }}/{{ questions.length }} correct.
              </span>
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
import HIGButton from '../hig/HIGButton.vue'
import HIGInput from '../hig/HIGInput.vue'
import CodeEditor from '../CodeEditor.vue'
import Icon from '../Icon.vue'
import { renderMarkdown } from '../../utils/markdown'

interface Props {
  questions: any[]
  tutorialPageId: string
}

const props = defineProps<Props>()
const store = useStore()
const { user } = useAuth()

const questionStates = ref<Record<number, {
  answer: string
  code: string
  answered: boolean
  correct: boolean
  showAnswer: boolean
}>>({})
const isSubmitting = ref(false)
const allAnswered = ref(false)

const codeEditorRefs = ref<InstanceType<typeof CodeEditor>[]>([])

const totalPoints = computed(() => {
  return props.questions.reduce((sum, q) => sum + (q.points || 0), 0)
})

const correctCount = computed(() => {
  return Object.values(questionStates.value).filter(state => state.correct).length
})

const canSubmit = computed(() => {
  return props.questions.every((_, index) => {
    const state = questionStates.value[index]
    return state && (state.answer || state.code)
  })
})

onMounted(() => {
  // Initialize question states
  props.questions.forEach((_, index) => {
    questionStates.value[index] = {
      answer: '',
      code: '',
      answered: false,
      correct: false,
      showAnswer: false
    }
  })

  // Load existing submissions
  if (user.value?.uid) {
    loadSubmissions()
  }
})

const loadSubmissions = async () => {
  if (!user.value?.uid) return

  try {
    const { data, error } = await supabase
      .from('tutorial_exercise_submissions')
      .select('*')
      .eq('user_id', user.value.uid)
      .eq('tutorial_page_id', props.tutorialPageId)
      .in('question_id', props.questions.map(q => q.id))

    if (error) throw error

    if (data && data.length > 0) {
      data.forEach((submission: any) => {
        const questionIndex = props.questions.findIndex(q => q.id === submission.question_id)
        if (questionIndex >= 0) {
          questionStates.value[questionIndex] = {
            answer: submission.submission_answer || '',
            code: submission.submission_code || '',
            answered: true,
            correct: submission.passed || false,
            showAnswer: true
          }
        }
      })

      allAnswered.value = true
    }
  } catch (error) {
    console.error('Error loading submissions:', error)
  }
}

const handleSelectAnswer = (index: number, value: string) => {
  if (questionStates.value[index]?.answered) return
  if (!questionStates.value[index]) {
    questionStates.value[index] = {
      answer: '',
      code: '',
      answered: false,
      correct: false,
      showAnswer: false
    }
  }
  questionStates.value[index].answer = value
}

const handleTextAnswer = (index: number, value: string) => {
  if (questionStates.value[index]?.answered) return
  if (!questionStates.value[index]) {
    questionStates.value[index] = {
      answer: '',
      code: '',
      answered: false,
      correct: false,
      showAnswer: false
    }
  }
  questionStates.value[index].answer = value
}

const handleCodeAnswer = (index: number, value: string) => {
  if (questionStates.value[index]?.answered) return
  if (!questionStates.value[index]) {
    questionStates.value[index] = {
      answer: '',
      code: '',
      answered: false,
      correct: false,
      showAnswer: false
    }
  }
  questionStates.value[index].code = value
}

const handleSubmitAll = async () => {
  if (!user.value?.uid) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Please log in to submit answers.'
    })
    return
  }

  isSubmitting.value = true

  try {
    const submissions = props.questions.map((question, index) => {
      const state = questionStates.value[index]
      const isCorrect = checkAnswer(question, state)

      return {
        user_id: user.value.uid,
        tutorial_page_id: props.tutorialPageId,
        question_id: question.id,
        submission_answer: state.answer,
        submission_code: state.code,
        passed: isCorrect,
        completed_at: new Date().toISOString()
      }
    })

    const { error } = await supabase
      .from('tutorial_exercise_submissions')
      .insert(submissions)

    if (error) throw error

    // Update states to show answers
    props.questions.forEach((question, index) => {
      const state = questionStates.value[index]
      state.answered = true
      state.correct = checkAnswer(question, state)
      state.showAnswer = true
    })

    allAnswered.value = true

    store.dispatch('addNotification', {
      type: 'success',
      message: `Submitted! You got ${correctCount.value}/${props.questions.length} correct.`
    })
  } catch (error: any) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Error submitting answers: ' + error.message
    })
  } finally {
    isSubmitting.value = false
  }
}

const checkAnswer = (question: any, state: any): boolean => {
  if (question.question_type === 'multiple_choice') {
    const correctAnswers = question.correct_answers || [question.correct_answer]
    return correctAnswers.includes(state.answer)
  } else if (question.question_type === 'text_input') {
    const correctAnswer = (question.correct_answer || '').toLowerCase().trim()
    const userAnswer = (state.answer || '').toLowerCase().trim()
    return correctAnswer === userAnswer
  } else if (question.question_type === 'code') {
    // For code questions, we'd need to run tests
    // For now, just check if code was provided
    return !!state.code
  }
  return false
}

const isCorrectAnswer = (question: any, value: string): boolean => {
  const correctAnswers = question.correct_answers || [question.correct_answer]
  return correctAnswers.includes(value)
}
</script>

<style scoped>
.qa-exercise-container {
  @apply my-8;
}

.qa-header {
  @apply mb-4;
}

.qa-meta {
  @apply flex items-center space-x-2 mt-2;
}

.points-badge {
  @apply px-2 py-1 text-xs font-semibold rounded bg-primary-500/20 text-primary-500;
}

.question-item {
  @apply p-4 border border-border-primary rounded-lg;
}

.question-item.answered {
  @apply bg-bg-tertiary;
}

.question-header {
  @apply flex items-center justify-between mb-3;
}

.question-number {
  @apply font-semibold text-text-primary;
}

.question-points {
  @apply text-sm text-text-secondary;
}

.question-options {
  @apply space-y-2;
}

.option-item {
  @apply flex items-start space-x-3 p-3 border border-border-primary rounded-lg cursor-pointer transition-all;
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

.question-code {
  @apply mt-4;
}

.explanation {
  @apply border border-border-primary;
}

.answer-feedback {
  @apply flex items-center space-x-2;
}

.qa-actions {
  @apply flex items-center justify-center;
}

.completion-message {
  @apply flex items-center space-x-2;
}
</style>

