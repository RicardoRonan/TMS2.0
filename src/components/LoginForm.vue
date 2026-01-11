<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="space-y-4">
      <HIGInput
        v-model="form.email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        :error="errors.email"
        required
        @blur="validateField('email')"
        @input="clearError('email')"
      />
      
      <div class="relative">
        <HIGInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          placeholder="Enter your password"
          :error="errors.password"
          required
          class="pr-10"
          @blur="validateField('password')"
          @input="clearError('password')"
        />
        <button
          type="button"
          class="absolute right-3 text-text-tertiary hover:text-text-primary transition-colors focus:outline-none z-10"
          tabindex="-1"
          aria-label="Toggle password visibility"
          style="top: 2rem; height: 2.5rem; display: flex; align-items: center;"
          @click="showPassword = !showPassword"
        >
          <FontAwesomeIcon
            :icon="showPassword ? faEyeSlash : faEye"
            class="h-5 w-5"
          />
        </button>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <label class="flex items-center">
        <input
          v-model="form.rememberMe"
          type="checkbox"
          class="h-4 w-4 text-primary-500 focus:ring-primary-500 border-border-primary rounded"
        >
        <span class="ml-2 text-sm text-text-secondary">Remember me</span>
      </label>
      
      <button
        type="button"
        class="text-sm text-primary-500 hover:text-primary-600 transition-colors"
        @click="$emit('forgot-password')"
      >
        Forgot password?
      </button>
    </div>

    <div class="space-y-3">
      <HIGButton
        type="submit"
        variant="primary"
        size="lg"
        :loading="loading"
        :disabled="!isFormValid"
        full-width
      >
        Sign In
      </HIGButton>

      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border-primary" />
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-bg-secondary text-text-tertiary">Or continue with</span>
        </div>
      </div>

      <HIGButton
        type="button"
        variant="secondary"
        size="lg"
        :loading="googleLoading"
        full-width
        @click="handleGoogleLogin"
      >
        <svg
          class="w-5 h-5 mr-2"
          viewBox="0 0 24 24"
        >
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </HIGButton>
    </div>

    <p class="text-center text-sm text-text-secondary">
      Don't have an account?
      <button
        type="button"
        class="text-primary-500 hover:text-primary-600 font-medium transition-colors"
        @click="$emit('switch-to-register')"
      >
        Sign up
      </button>
    </p>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useStore } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../composables/useAuth'
import HIGInput from './hig/HIGInput.vue'
import HIGButton from './hig/HIGButton.vue'

const emit = defineEmits<{
  success: []
  'forgot-password': []
  'switch-to-register': []
}>()

const store = useStore()
const { signIn, signInWithGoogle, error: authError } = useAuth()

// Form state
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const googleLoading = ref(false)
const showPassword = ref(false)

// Validation
const isFormValid = computed(() => {
  return form.value.email && form.value.password && !Object.keys(errors.value).length
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
        errors.value.email = 'Please enter a valid email'
      } else {
        delete errors.value.email
      }
      break
    case 'password':
      if (!form.value.password) {
        errors.value.password = 'Password is required'
      } else if (form.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
      } else {
        delete errors.value.password
      }
      break
  }
}

const handleSubmit = async () => {
  // Validate all fields
  validateField('email')
  validateField('password')
  
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    // Call actual signin function
    await signIn(form.value.email, form.value.password)
    // Show success notification
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Signed in successfully!'
    })
    
    emit('success')
  } catch (error: any) {
    // Error is already handled by useAuth, but show notification
    const errorMessage = authError.value || error?.message || 'Failed to sign in. Please try again.'
    
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
    
    // Set form errors on the specific field based on error field info
    // The useAuth composable now provides field information in the error object
    const errorField = error?.field || (errorMessage.toLowerCase().includes('email') && !errorMessage.toLowerCase().includes('password') ? 'email' : null)
    
    if (errorField === 'email') {
      errors.value.email = errorMessage
      // Clear password error if it exists
      delete errors.value.password
    } else if (errorField === 'password' || errorMessage.toLowerCase().includes('password') || errorMessage.toLowerCase().includes('credentials') || errorMessage.toLowerCase().includes('incorrect')) {
      errors.value.password = errorMessage
      // Clear email error if it exists
      delete errors.value.email
    } else {
      // For generic errors, default to password field (more secure - doesn't reveal if email exists)
      errors.value.password = errorMessage
      delete errors.value.email
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleLogin = async () => {
  googleLoading.value = true
  
  try {
    // Call actual Google signin
    await signInWithGoogle()
    
    // Note: Google OAuth redirects, so success will be handled by callback
    // If we get here without redirect, show success
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Redirecting to Google...'
    })
  } catch (error: any) {
    const errorMessage = authError.value || 'Failed to sign in with Google. Please try again.'
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
  } finally {
    googleLoading.value = false
  }
}
</script>

