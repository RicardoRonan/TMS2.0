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
                <h2 class="text-2xl font-bold text-text-primary mb-6">Appearance</h2>
                
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
                          <Icon :name="themeOption.icon" :size="24" />
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
                <h2 class="text-xl font-bold text-text-primary mb-4">Quick Links</h2>
                <div class="space-y-3">
                  <router-link to="/profile">
                    <HIGButton variant="secondary" full-width>
                      View Profile
                    </HIGButton>
                  </router-link>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import Icon from '../components/Icon.vue'

const store = useStore()
const router = useRouter()
const { logout } = useAuth()

const currentTheme = computed(() => store.getters.currentTheme)

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
</script>

