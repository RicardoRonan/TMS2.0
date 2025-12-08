<template>
  <div class="min-h-screen bg-bg-primary flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-text-primary">
          Set new password
        </h2>
        <p class="mt-2 text-center text-sm text-text-secondary">
          Enter your new password below.
        </p>
      </div>

      <HIGCard>
        <div class="p-6">
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div class="relative">
              <HIGInput
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="New Password"
                placeholder="Enter your new password"
                :error="errors.password"
                required
                autofocus
                @blur="validateField('password')"
                @input="clearError('password')"
                class="pr-10"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none z-10"
                tabindex="-1"
                aria-label="Toggle password visibility"
                style="top: 2rem; height: 2.5rem; display: flex; align-items: center;"
              >
                <FontAwesomeIcon
                  :icon="showPassword ? faEyeSlash : faEye"
                  class="h-5 w-5"
                />
              </button>
            </div>

            <div class="relative">
              <HIGInput
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                label="Confirm New Password"
                placeholder="Confirm your new password"
                :error="errors.confirmPassword"
                required
                @blur="validateField('confirmPassword')"
                @input="clearError('confirmPassword')"
                class="pr-10"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none z-10"
                tabindex="-1"
                aria-label="Toggle password visibility"
                style="top: 2rem; height: 2.5rem; display: flex; align-items: center;"
              >
                <FontAwesomeIcon
                  :icon="showConfirmPassword ? faEyeSlash : faEye"
                  class="h-5 w-5"
                />
              </button>
            </div>

            <div v-if="error" class="rounded-lg bg-danger-50 border border-danger-200 p-4">
              <p class="text-sm text-danger-800">{{ error }}</p>
            </div>

            <HIGButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="loading"
              :disabled="!isFormValid"
              full-width
            >
              Update Password
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
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../supabase'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGButton from '../components/hig/HIGButton.vue'

const store = useStore()
const router = useRouter()
const { updatePassword, error: authError, loading: authLoading } = useAuth()

const form = ref({
  password: '',
  confirmPassword: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const error = computed(() => authError.value)

const isFormValid = computed(() => {
  return form.value.password && 
         form.value.confirmPassword && 
         form.value.password === form.value.confirmPassword &&
         !Object.keys(errors.value).length
})

const clearError = (field: string) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const validateField = (field: string) => {
  switch (field) {
    case 'password':
      if (!form.value.password) {
        errors.value.password = 'Password is required'
      } else if (form.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
      } else {
        delete errors.value.password
      }
      // Re-validate confirm password if it's already been entered
      if (form.value.confirmPassword) {
        validateField('confirmPassword')
      }
      break
    case 'confirmPassword':
      if (!form.value.confirmPassword) {
        errors.value.confirmPassword = 'Please confirm your password'
      } else if (form.value.password !== form.value.confirmPassword) {
        errors.value.confirmPassword = 'Passwords do not match'
      } else {
        delete errors.value.confirmPassword
      }
      break
  }
}

const handleSubmit = async () => {
  validateField('password')
  validateField('confirmPassword')
  
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    await updatePassword(form.value.password)
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Password updated successfully! You can now sign in with your new password.'
    })
    
    // Redirect to home after successful password update
    router.push('/')
  } catch (err: any) {
    const errorMessage = authError.value || err?.message || 'Failed to update password. Please try again.'
    
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
  } finally {
    loading.value = false
  }
}

// Check if user has a valid session from the password reset link
onMounted(async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      // No valid session, redirect to forgot password page
      store.dispatch('addNotification', {
        type: 'error',
        message: 'Invalid or expired reset link. Please request a new password reset.'
      })
      router.push('/forgot-password')
    }
  } catch (err) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Invalid or expired reset link. Please request a new password reset.'
    })
    router.push('/forgot-password')
  }
})
</script>
