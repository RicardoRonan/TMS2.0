<template>
  <div class="min-h-screen bg-bg-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-text-primary">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-text-secondary">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <HIGCard>
        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <HIGInput
              v-model="form.email"
              type="email"
              label="Email address"
              placeholder="Enter your email"
              :error="errors.email"
              required
              autofocus
              @blur="validateField('email')"
              @input="clearError('email')"
            />

            <div v-if="emailSent" class="rounded-lg bg-success-50 border border-success-200 p-4">
              <p class="text-sm text-success-800">
                Check your email! We've sent you a password reset link. Click the link in the email to reset your password.
              </p>
            </div>

            <div v-if="error" class="rounded-lg bg-danger-50 border border-danger-200 p-4">
              <p class="text-sm text-danger-800">{{ error }}</p>
            </div>

            <HIGButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="loading"
              :disabled="!isFormValid || emailSent"
              full-width
            >
              {{ emailSent ? 'Email Sent' : 'Send Reset Link' }}
            </HIGButton>
          </form>

          <div class="mt-6 text-center">
            <router-link
              to="/"
              class="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              ← Back to sign in
            </router-link>
          </div>
        </div>
      </HIGCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { useAuth } from '../composables/useAuth'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGButton from '../components/hig/HIGButton.vue'

const store = useStore()
const { resetPassword, error: authError, loading: authLoading } = useAuth()

const form = ref({
  email: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const emailSent = ref(false)
const error = computed(() => authError.value)

const isFormValid = computed(() => {
  return form.value.email && !Object.keys(errors.value).length
})

const clearError = (field: string) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const validateField = (field: string) => {
  switch (field) {
    case 'email':
      if (!form.value.email) {
        errors.value.email = 'Email is required'
      } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = 'Please enter a valid email address'
      } else {
        delete errors.value.email
      }
      break
  }
}

const handleSubmit = async () => {
  validateField('email')
  
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    await resetPassword(form.value.email)
    emailSent.value = true
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Password reset email sent! Check your inbox.'
    })
  } catch (err: any) {
    const errorMessage = authError.value || err?.message || 'Failed to send reset email. Please try again.'
    
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
  } finally {
    loading.value = false
  }
}
</script>
