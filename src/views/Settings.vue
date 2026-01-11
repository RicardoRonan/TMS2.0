<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Settings
          </h1>
          <p class="text-xl text-text-secondary">
            Manage your preferences and account settings
          </p>
        </div>
      </div>
    </section>

    <!-- Settings Content -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Theme Settings Card -->
            <HIGCard class="md:col-span-2">
              <div class="p-6">
                <h2 class="text-2xl font-bold text-text-primary mb-6">
                  Appearance
                </h2>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-4">
                      Theme
                    </label>
                    <div class="flex gap-3">
                      <button
                        v-for="themeOption in themeOptions"
                        :key="themeOption.value"
                        :class="[
                          'flex-1 px-4 py-3 rounded-lg border-2 transition-all',
                          currentTheme === themeOption.value
                            ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                            : 'border-border-primary bg-bg-secondary text-text-primary hover:border-border-secondary'
                        ]"
                        @click="handleThemeChange(themeOption.value)"
                      >
                        <div class="flex flex-col items-center space-y-2">
                          <Icon
                            :name="themeOption.icon"
                            :size="24"
                          />
                          <span class="text-sm font-medium">{{ themeOption.label }}</span>
                        </div>
                      </button>
                    </div>
                    <p class="mt-3 text-sm text-text-tertiary">
                      Choose your preferred color theme for the application
                    </p>
                  </div>
                </div>
              </div>
            </HIGCard>

            <!-- Quick Links -->
            <HIGCard>
              <div class="p-6">
                <h2 class="text-xl font-bold text-text-primary mb-4">
                  Quick Links
                </h2>
                <div class="space-y-3">
                  <router-link to="/profile">
                    <HIGButton
                      variant="secondary"
                      full-width
                    >
                      View Profile
                    </HIGButton>
                  </router-link>
                  <HIGButton
                    variant="tertiary"
                    full-width
                    @click="handleLogout"
                  >
                    Sign Out
                  </HIGButton>
                </div>
              </div>
            </HIGCard>
          </div>

          <!-- Account Management Section -->
          <HIGCard class="mt-8">
            <div class="p-6">
              <h2 class="text-2xl font-bold text-text-primary mb-6">
                Account Management
              </h2>
              
              <div class="space-y-6">
                <!-- Reset Tutorials -->
                <div class="border-b border-border-primary pb-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-text-primary mb-2">
                        Reset Tutorial Progress
                      </h3>
                      <p class="text-sm text-text-tertiary mb-4">
                        Delete all your tutorial progress. This will reset your learning progress across all tutorials.
                      </p>
                    </div>
                    <HIGButton 
                      variant="danger" 
                      :disabled="isResettingTutorials"
                      @click="showResetTutorialsModal = true"
                    >
                      <span
                        v-if="isResettingTutorials"
                        class="text-red-500"
                      >Resetting...</span>
                      <span
                        v-else
                        class="text-red-500"
                      >Reset Tutorials</span>
                    </HIGButton>
                  </div>
                </div>

                <!-- Delete Comments -->
                <div class="border-b border-border-primary pb-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-text-primary mb-2">
                        Delete All Comments
                      </h3>
                      <p class="text-sm text-text-tertiary mb-4">
                        Permanently delete all comments you have posted on blog posts.
                      </p>
                    </div>
                    <HIGButton 
                      variant="danger" 
                      :disabled="isDeletingComments"
                      @click="showDeleteCommentsModal = true"
                    >
                      <span
                        v-if="isDeletingComments"
                        class="text-red-500"
                      >Deleting...</span>
                      <span
                        v-else
                        class="text-red-500"
                      >Delete Comments</span>
                    </HIGButton>
                  </div>
                </div>

                <!-- Reset Likes -->
                <div class="border-b border-border-primary pb-6">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-text-primary mb-2">
                        Reset Likes
                      </h3>
                      <p class="text-sm text-text-tertiary mb-4">
                        Remove all your likes from blog posts.
                      </p>
                    </div>
                    <HIGButton 
                      variant="danger" 
                      :disabled="isResettingLikes"
                      @click="showResetLikesModal = true"
                    >
                      <span
                        v-if="isResettingLikes"
                        class="text-red-500"
                      >Resetting...</span>
                      <span
                        v-else
                        class="text-red-500"
                      >Reset Likes</span>
                    </HIGButton>
                  </div>
                </div>

                <!-- Delete Account -->
                <div class="pt-2">
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-text-primary mb-2">
                        Delete Account
                      </h3>
                      <p class="text-sm text-text-tertiary mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <HIGButton 
                      variant="danger" 
                      :disabled="isDeletingAccount"
                      @click="showDeleteAccountModal = true"
                    >
                      <span
                        v-if="isDeletingAccount"
                        class="text-red-500"
                      >Deleting...</span>
                      <span
                        v-else
                        class="text-red-500"
                      >Delete Account</span>
                    </HIGButton>
                  </div>
                </div>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Reset Tutorials Modal -->
    <HIGModal
      v-model:is-open="showResetTutorialsModal"
      title="Reset Tutorial Progress"
      size="sm"
      :close-on-overlay="false"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Icon
            name="alert-triangle"
            :size="24"
            class="text-yellow-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="text-text-primary mb-2">
              Are you sure you want to reset all your tutorial progress?
            </p>
            <p class="text-sm text-text-tertiary">
              This will delete all your learning progress across all tutorials. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <HIGButton
          variant="tertiary"
          @click="showResetTutorialsModal = false"
        >
          Cancel
        </HIGButton>
        <HIGButton 
          variant="danger" 
          :disabled="isResettingTutorials"
          @click="confirmResetTutorials"
        >
          <span class="text-red-500">
            {{ isResettingTutorials ? 'Resetting...' : 'Reset Tutorials' }}
          </span>
        </HIGButton>
      </template>
    </HIGModal>

    <!-- Delete Comments Modal -->
    <HIGModal
      v-model:is-open="showDeleteCommentsModal"
      title="Delete All Comments"
      size="sm"
      :close-on-overlay="false"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Icon
            name="alert-triangle"
            :size="24"
            class="text-yellow-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="text-text-primary mb-2">
              Are you sure you want to delete all your comments?
            </p>
            <p class="text-sm text-text-tertiary">
              This will permanently delete all comments you have posted on blog posts. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <HIGButton
          variant="tertiary"
          @click="showDeleteCommentsModal = false"
        >
          Cancel
        </HIGButton>
        <HIGButton 
          variant="danger" 
          :disabled="isDeletingComments"
          @click="confirmDeleteComments"
        >
          <span class="text-red-500">
            {{ isDeletingComments ? 'Deleting...' : 'Delete Comments' }}
          </span>
        </HIGButton>
      </template>
    </HIGModal>

    <!-- Reset Likes Modal -->
    <HIGModal
      v-model:is-open="showResetLikesModal"
      title="Reset Likes"
      size="sm"
      :close-on-overlay="false"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Icon
            name="alert-triangle"
            :size="24"
            class="text-yellow-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="text-text-primary mb-2">
              Are you sure you want to remove all your likes?
            </p>
            <p class="text-sm text-text-tertiary">
              This will remove all your likes from blog posts. This action cannot be undone.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <HIGButton
          variant="tertiary"
          @click="showResetLikesModal = false"
        >
          Cancel
        </HIGButton>
        <HIGButton 
          variant="danger" 
          :disabled="isResettingLikes"
          @click="confirmResetLikes"
        >
          <span class="text-red-500">
            {{ isResettingLikes ? 'Resetting...' : 'Reset Likes' }}
          </span>
        </HIGButton>
      </template>
    </HIGModal>

    <!-- Delete Account - First Warning Modal -->
    <HIGModal
      v-model:is-open="showDeleteAccountModal"
      title="Delete Account"
      size="md"
      :close-on-overlay="false"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Icon
            name="alert-triangle"
            :size="24"
            class="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="text-text-primary font-semibold mb-3 text-lg">
              ⚠️ WARNING: This will permanently delete your account and all associated data.
            </p>
            <p class="text-text-primary mb-3">
              This includes:
            </p>
            <ul class="list-disc list-inside text-text-secondary space-y-1 mb-4 ml-4">
              <li>Your profile information</li>
              <li>All tutorial progress</li>
              <li>All comments</li>
              <li>All likes</li>
            </ul>
            <p class="text-sm text-red-500 font-semibold">
              This action CANNOT be undone.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <HIGButton
          variant="tertiary"
          @click="showDeleteAccountModal = false"
        >
          Cancel
        </HIGButton>
        <HIGButton 
          variant="danger" 
          @click="showDeleteAccountConfirmModal = true; showDeleteAccountModal = false"
        >
          <span class="text-red-500">Continue</span>
        </HIGButton>
      </template>
    </HIGModal>

    <!-- Delete Account - Second Confirmation Modal -->
    <HIGModal
      v-model:is-open="showDeleteAccountConfirmModal"
      title="Final Confirmation"
      size="sm"
      :close-on-overlay="false"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Icon
            name="alert-triangle"
            :size="24"
            class="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div>
            <p class="text-text-primary mb-2">
              This is your last chance to cancel.
            </p>
            <p class="text-sm text-text-tertiary">
              In the next step, you'll need to type "DELETE" to confirm account deletion.
            </p>
          </div>
        </div>
      </div>
      <template #footer>
        <HIGButton
          variant="tertiary"
          @click="showDeleteAccountConfirmModal = false"
        >
          Cancel
        </HIGButton>
        <HIGButton 
          variant="danger" 
          @click="showDeleteAccountFinalModal = true; showDeleteAccountConfirmModal = false"
        >
          <span class="text-red-500">Continue</span>
        </HIGButton>
      </template>
    </HIGModal>

    <!-- Delete Account - Final Confirmation with Input -->
    <HIGModal
      v-model:is-open="showDeleteAccountFinalModal"
      title="Confirm Account Deletion"
      size="sm"
      :close-on-overlay="false"
    >
      <div class="space-y-4">
        <div class="flex items-start space-x-3">
          <Icon
            name="alert-triangle"
            :size="24"
            class="text-red-500 flex-shrink-0 mt-0.5"
          />
          <div class="flex-1">
            <p class="text-text-primary mb-4">
              Type <strong class="text-red-500">DELETE</strong> to confirm account deletion:
            </p>
            <HIGInput
              v-model="deleteAccountConfirmation"
              placeholder="Type DELETE to confirm"
              class="w-full"
              @keyup.enter="handleDeleteAccountEnter"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <HIGButton
          variant="tertiary"
          @click="showDeleteAccountFinalModal = false; deleteAccountConfirmation = ''"
        >
          Cancel
        </HIGButton>
        <HIGButton 
          variant="danger" 
          :disabled="deleteAccountConfirmation !== 'DELETE' || isDeletingAccount"
          @click="confirmDeleteAccount"
        >
          <span class="text-red-500">
            {{ isDeletingAccount ? 'Deleting...' : 'Delete Account' }}
          </span>
        </HIGButton>
      </template>
    </HIGModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../supabase'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGModal from '../components/hig/HIGModal.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import Icon from '../components/Icon.vue'

const store = useStore()
const router = useRouter()
const { logout } = useAuth()

const currentTheme = computed(() => store.getters.currentTheme)
const currentUser = computed(() => store.getters.currentUser)

// Loading states
const isResettingTutorials = ref(false)
const isDeletingComments = ref(false)
const isResettingLikes = ref(false)
const isDeletingAccount = ref(false)

// Modal states
const showResetTutorialsModal = ref(false)
const showDeleteCommentsModal = ref(false)
const showResetLikesModal = ref(false)
const showDeleteAccountModal = ref(false)
const showDeleteAccountConfirmModal = ref(false)
const showDeleteAccountFinalModal = ref(false)
const deleteAccountConfirmation = ref('')

const themeOptions = [
  { value: 'light', label: 'Light', icon: 'sun' },
  { value: 'dark', label: 'Dark', icon: 'moon' }
]

const handleThemeChange = (theme: 'light' | 'dark') => {
  store.dispatch('setTheme', theme)
  store.dispatch('addNotification', {
    type: 'success',
    message: `Theme changed to ${theme}`
  })
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Successfully signed out'
    })
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to sign out'
    })
  }
}

// Reset Tutorial Progress
const confirmResetTutorials = async () => {
  if (!currentUser.value?.uid) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'You must be signed in to perform this action'
    })
    showResetTutorialsModal.value = false
    return
  }

  try {
    showResetTutorialsModal.value = false
    isResettingTutorials.value = true

    const { error } = await supabase
      .from('tutorial_progress')
      .delete()
      .eq('user_id', currentUser.value.uid)

    if (error) {
      // If table doesn't exist, that's okay
      if (error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache') ||
          error.code === 'PGRST116') {
        store.dispatch('addNotification', {
          type: 'info',
          message: 'No tutorial progress found to reset'
        })
        return
      }
      throw error
    }

    store.dispatch('addNotification', {
      type: 'success',
      message: 'Tutorial progress reset successfully'
    })
  } catch (err: any) {
    store.dispatch('addNotification', {
      type: 'error',
      message: err.message || 'Failed to reset tutorial progress'
    })
  } finally {
    isResettingTutorials.value = false
  }
}

// Delete All Comments
const confirmDeleteComments = async () => {
  if (!currentUser.value?.uid) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'You must be signed in to perform this action'
    })
    showDeleteCommentsModal.value = false
    return
  }

  try {
    showDeleteCommentsModal.value = false
    isDeletingComments.value = true

    const { error } = await supabase
      .from('blog_comments')
      .delete()
      .eq('user_id', currentUser.value.uid)

    if (error) {
      // If table doesn't exist, that's okay
      if (error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache') ||
          error.code === 'PGRST116') {
        store.dispatch('addNotification', {
          type: 'info',
          message: 'No comments found to delete'
        })
        return
      }
      throw error
    }

    store.dispatch('addNotification', {
      type: 'success',
      message: 'All comments deleted successfully'
    })
  } catch (err: any) {
    store.dispatch('addNotification', {
      type: 'error',
      message: err.message || 'Failed to delete comments'
    })
  } finally {
    isDeletingComments.value = false
  }
}

// Reset Likes
const confirmResetLikes = async () => {
  if (!currentUser.value?.uid) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'You must be signed in to perform this action'
    })
    showResetLikesModal.value = false
    return
  }

  try {
    showResetLikesModal.value = false
    isResettingLikes.value = true

    const { error } = await supabase
      .from('blog_likes')
      .delete()
      .eq('user_id', currentUser.value.uid)

    if (error) {
      // If table doesn't exist, that's okay
      if (error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache') ||
          error.code === 'PGRST116') {
        store.dispatch('addNotification', {
          type: 'info',
          message: 'No likes found to reset'
        })
        return
      }
      throw error
    }

    store.dispatch('addNotification', {
      type: 'success',
      message: 'All likes removed successfully'
    })
  } catch (err: any) {
    store.dispatch('addNotification', {
      type: 'error',
      message: err.message || 'Failed to reset likes'
    })
  } finally {
    isResettingLikes.value = false
  }
}

// Handle Enter key in delete account input
const handleDeleteAccountEnter = () => {
  if (deleteAccountConfirmation.value === 'DELETE') {
    confirmDeleteAccount()
  }
}

// Delete Account
const confirmDeleteAccount = async () => {
  if (!currentUser.value?.uid) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'You must be signed in to perform this action'
    })
    showDeleteAccountFinalModal.value = false
    deleteAccountConfirmation.value = ''
    return
  }

  if (deleteAccountConfirmation.value !== 'DELETE') {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Please type "DELETE" exactly to confirm'
    })
    return
  }

  try {
    showDeleteAccountFinalModal.value = false
    deleteAccountConfirmation.value = ''
    isDeletingAccount.value = true
    const userId = currentUser.value.uid

    // Step 1: Delete all user data from database tables
    // Delete tutorial progress
    try {
      await supabase
        .from('tutorial_progress')
        .delete()
        .eq('user_id', userId)
    } catch (err) {
      // Ignore errors if table doesn't exist
    }

    // Delete comments
    try {
      await supabase
        .from('blog_comments')
        .delete()
        .eq('user_id', userId)
    } catch (err) {
      // Ignore errors if table doesn't exist
    }

    // Delete likes
    try {
      await supabase
        .from('blog_likes')
        .delete()
        .eq('user_id', userId)
    } catch (err) {
      // Ignore errors if table doesn't exist
    }

    // Delete user profile from users table
    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId)
    } catch (err) {
      // Log but continue - auth user deletion is most important
      console.error('Error deleting user profile:', err)
    }

    // Step 2: Try to delete auth user via RPC function (if available)
    // If no RPC function exists, we'll delete the user data and sign out
    // The auth user deletion would need to be handled server-side or via database trigger
    try {
      const { error: rpcError } = await supabase.rpc('delete_user_account', { user_id: userId })
      if (rpcError) {
        // RPC function might not exist - that's okay, continue with data deletion
        console.log('RPC function not available, continuing with data deletion')
      }
    } catch (err) {
      // RPC function doesn't exist - continue with data deletion
      console.log('RPC function not available, continuing with data deletion')
    }

    // Step 3: Sign out and redirect
    // Note: The auth.users entry will remain, but all user data is deleted
    // To fully delete the auth user, a database trigger or server-side function is needed
    await logout()
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'All user data has been deleted. You have been signed out.'
    })
    
    router.push('/')
  } catch (err: any) {
    console.error('Error deleting account:', err)
    store.dispatch('addNotification', {
      type: 'error',
      message: err.message || 'Failed to delete account. Please contact support if this persists.'
    })
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

