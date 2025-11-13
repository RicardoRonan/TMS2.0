<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div class="space-y-4">
      <HIGInput
        v-model="form.displayName"
        type="text"
        label="Full Name"
        placeholder="Enter your full name"
        :error="errors.displayName"
        required
        @blur="validateField('displayName')"
      />
      
      <HIGInput
        v-model="form.email"
        type="email"
        label="Email"
        placeholder="Enter your email"
        :error="errors.email"
        required
        @blur="validateField('email')"
      />
      
      <div class="relative">
        <HIGInput
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          placeholder="Create a password"
          :error="errors.password"
          required
          @blur="validateField('password')"
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
          label="Confirm Password"
          placeholder="Confirm your password"
          :error="errors.confirmPassword"
          required
          @blur="validateField('confirmPassword')"
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
    </div>

    <div class="space-y-3">
      <label class="flex items-start">
        <input
          v-model="form.agreeToTerms"
          type="checkbox"
          class="h-4 w-4 text-primary-500 focus:ring-primary-500 border-border-primary rounded mt-1"
          required
        />
        <span class="ml-2 text-sm text-text-secondary">
          I agree to the
          <a href="#" class="text-primary-500 hover:text-primary-600 transition-colors">Terms of Service</a>
          and
          <a href="#" class="text-primary-500 hover:text-primary-600 transition-colors">Privacy Policy</a>
        </span>
      </label>
      
      <label class="flex items-start">
        <input
          v-model="form.newsletter"
          type="checkbox"
          class="h-4 w-4 text-primary-500 focus:ring-primary-500 border-border-primary rounded mt-1"
        />
        <span class="ml-2 text-sm text-text-secondary">
          Subscribe to our newsletter for updates and tips
        </span>
      </label>
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
        Create Account
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
        @click="handleGoogleRegister"
      >
        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </HIGButton>
    </div>

    <p class="text-center text-sm text-text-secondary">
      Already have an account?
      <button
        type="button"
        class="text-primary-500 hover:text-primary-600 font-medium transition-colors"
        @click="$emit('switch-to-login')"
      >
        Sign in
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
import { supabase } from '../supabase'
import HIGInput from './hig/HIGInput.vue'
import HIGButton from './hig/HIGButton.vue'

const emit = defineEmits<{
  success: []
  'switch-to-login': []
}>()

const store = useStore()
const { signUp, signInWithGoogle, error: authError, loading: authLoading } = useAuth()

// Form state
const form = ref({
  displayName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false,
  newsletter: false
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const googleLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Validation
const isFormValid = computed(() => {
  return form.value.displayName && 
         form.value.email && 
         form.value.password && 
         form.value.confirmPassword &&
         form.value.agreeToTerms &&
         !Object.keys(errors.value).length
})

const validateField = (field: string) => {
  switch (field) {
    case 'displayName':
      if (!form.value.displayName) {
        errors.value.displayName = 'Full name is required'
      } else if (form.value.displayName.length < 2) {
        errors.value.displayName = 'Name must be at least 2 characters'
      } else {
        delete errors.value.displayName
      }
      break
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
      } else if (form.value.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.value.password)) {
        errors.value.password = 'Password must contain uppercase, lowercase, and number'
      } else {
        delete errors.value.password
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
  // Validate all fields
  validateField('displayName')
  validateField('email')
  validateField('password')
  validateField('confirmPassword')
  
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    // Call actual signup function
    const user = await signUp(form.value.email, form.value.password, form.value.displayName)
    
    // Check if we have a session (email confirmation might be required)
    // Add timeout to prevent hanging
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ data: { session: null } }), 5000)
    )
    const { data: { session } } = await Promise.race([sessionPromise, timeoutPromise]) as any
    
    if (session) {
      // User is logged in immediately (email confirmation disabled)
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Account created successfully!'
      })
      emit('success')
    } else {
      // Email confirmation required
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Please check your email to verify your account, then sign in.'
      })
      // Emit success to close the modal - user can sign in after verifying email
      emit('success')
    }
  } catch (error: any) {
    // Error is already handled by useAuth, but show notification
    const errorMessage = authError.value || 'Failed to create account. Please try again.'
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
    
    // Set form errors if needed
    if (errorMessage.includes('email')) {
      errors.value.email = errorMessage
    } else if (errorMessage.includes('password')) {
      errors.value.password = errorMessage
    }
  } finally {
    loading.value = false
  }
}

const handleGoogleRegister = async () => {
  googleLoading.value = true
  
  try {
    // Call actual Google signup
    await signInWithGoogle()
    
    // Note: Google OAuth redirects, so success will be handled by callback
    // If we get here without redirect, show success
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Redirecting to Google...'
    })
  } catch (error: any) {
    const errorMessage = authError.value || 'Failed to sign up with Google. Please try again.'
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
  } finally {
    googleLoading.value = false
  }
}
</script>

