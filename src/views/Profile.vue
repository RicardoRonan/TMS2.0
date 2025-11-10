<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Profile
          </h1>
          <p class="text-xl text-text-secondary">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
    </section>

    <!-- Profile Content -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Profile Info Card -->
            <HIGCard class="md:col-span-2">
              <div class="p-6">
                <h2 class="text-2xl font-bold text-text-primary mb-6">Account Information</h2>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
                    <div class="text-text-primary text-lg">{{ currentUser?.displayName || 'Not set' }}</div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
                    <div class="text-text-primary text-lg">{{ currentUser?.email || 'Not set' }}</div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-2">Member Since</label>
                    <div class="text-text-primary text-lg">{{ formatDate(currentUser?.createdAt) }}</div>
                  </div>
                  
                  <div v-if="currentUser?.isAdmin" class="pt-4 border-t border-border-primary">
                    <div class="flex items-center space-x-2 mb-4">
                      <span class="badge badge-primary">Admin</span>
                    </div>
                    <p class="text-text-secondary text-sm mb-4">
                      You have administrative privileges. Access the admin panel to manage content.
                    </p>
                    <router-link to="/admin">
                      <HIGButton variant="primary">
                        Go to Admin Panel
                      </HIGButton>
                    </router-link>
                  </div>
                </div>
              </div>
            </HIGCard>

            <!-- Quick Actions -->
            <HIGCard>
              <div class="p-6">
                <h2 class="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
                <div class="space-y-3">
                  <HIGButton variant="secondary" full-width @click="showEditModal = true">
                    Edit Profile
                  </HIGButton>
                  <HIGButton variant="tertiary" full-width @click="handleLogout">
                    Sign Out
                  </HIGButton>
                </div>
              </div>
            </HIGCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Edit Profile Modal -->
    <HIGModal
      v-model:is-open="showEditModal"
      title="Edit Profile"
      size="md"
    >
      <div class="space-y-4">
        <HIGInput
          v-model="editForm.displayName"
          label="Display Name"
          placeholder="Enter your display name"
        />
        <div class="flex justify-end space-x-3 pt-4">
          <HIGButton variant="tertiary" @click="showEditModal = false">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" @click="handleUpdateProfile" :disabled="updating">
            {{ updating ? 'Updating...' : 'Update' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGModal from '../components/hig/HIGModal.vue'

const store = useStore()
const router = useRouter()
const { logout, updateProfile } = useAuth()

const showEditModal = ref(false)
const updating = ref(false)
const editForm = ref({
  displayName: ''
})

const currentUser = computed(() => store.getters.currentUser)

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleUpdateProfile = async () => {
  try {
    updating.value = true
    await updateProfile({
      displayName: editForm.value.displayName
    })
    showEditModal.value = false
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Profile updated successfully'
    })
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to update profile'
    })
  } finally {
    updating.value = false
  }
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

// Initialize edit form with current user data
const initEditForm = () => {
  if (currentUser.value) {
    editForm.value.displayName = currentUser.value.displayName || ''
  }
}

// Watch for modal opening to populate form
watch(showEditModal, (isOpen) => {
  if (isOpen) {
    initEditForm()
  }
})
</script>

