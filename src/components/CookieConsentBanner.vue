<template>
  <Transition name="cookie-banner">
    <div
      v-if="showBanner"
      class="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border-primary shadow-lg"
    >
      <div class="container mx-auto px-4 py-4">
        <div class="max-w-6xl mx-auto">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-text-primary mb-2">
                We use cookies
              </h3>
              <p class="text-sm text-text-secondary leading-relaxed">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. 
                <router-link 
                  to="/legal/cookie-policy" 
                  class="text-primary-500 hover:text-primary-600 underline"
                >
                  Learn more
                </router-link>
              </p>
            </div>
            <div class="flex items-center gap-3 flex-shrink-0">
              <HIGButton
                variant="secondary"
                size="sm"
                @click="openPreferences"
              >
                Customize
              </HIGButton>
              <HIGButton
                variant="primary"
                size="sm"
                @click="acceptAll"
              >
                Accept All
              </HIGButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Cookie Preferences Modal -->
  <HIGModal
    v-model:is-open="showPreferences"
    title="Cookie Preferences"
    size="md"
  >
    <div class="space-y-6">
      <p class="text-text-secondary">
        Manage your cookie preferences. You can enable or disable different types of cookies below.
      </p>

      <!-- Essential Cookies -->
      <div class="border border-border-primary rounded-lg p-4 bg-bg-secondary">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h4 class="font-semibold text-text-primary mb-1">Essential Cookies</h4>
            <p class="text-sm text-text-tertiary">
              These cookies are necessary for the website to function properly. They cannot be disabled.
            </p>
          </div>
          <div class="ml-4">
            <div class="w-12 h-6 bg-primary-500 rounded-full flex items-center justify-center cursor-not-allowed opacity-50">
              <span class="text-xs text-white font-medium">ON</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Analytics Cookies -->
      <div class="border border-border-primary rounded-lg p-4 bg-bg-secondary">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h4 class="font-semibold text-text-primary mb-1">Analytics Cookies</h4>
            <p class="text-sm text-text-tertiary">
              These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
            </p>
          </div>
          <div class="ml-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="preferences.analytics"
                class="sr-only peer"
              />
              <div class="w-12 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-primary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Functional Cookies -->
      <div class="border border-border-primary rounded-lg p-4 bg-bg-secondary">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h4 class="font-semibold text-text-primary mb-1">Functional Cookies</h4>
            <p class="text-sm text-text-tertiary">
              These cookies allow the website to remember choices you make and provide enhanced, more personal features.
            </p>
          </div>
          <div class="ml-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="preferences.functional"
                class="sr-only peer"
              />
              <div class="w-12 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-primary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Marketing Cookies -->
      <div class="border border-border-primary rounded-lg p-4 bg-bg-secondary">
        <div class="flex items-start justify-between mb-2">
          <div class="flex-1">
            <h4 class="font-semibold text-text-primary mb-1">Marketing Cookies</h4>
            <p class="text-sm text-text-tertiary">
              These cookies are used to deliver advertisements and track campaign effectiveness.
            </p>
          </div>
          <div class="ml-4">
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="preferences.marketing"
                class="sr-only peer"
              />
              <div class="w-12 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-primary after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-3 pt-4 border-t border-border-primary">
        <HIGButton
          variant="secondary"
          size="sm"
          @click="rejectAll"
        >
          Reject All
        </HIGButton>
        <HIGButton
          variant="primary"
          size="sm"
          @click="savePreferences"
        >
          Save Preferences
        </HIGButton>
      </div>
    </div>
  </HIGModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, provide } from 'vue'
import { 
  hasCookieConsent, 
  acceptAllCookies, 
  rejectAllCookies,
  getCookiePreferences,
  setCookiePreferences,
  type CookiePreferences
} from '../utils/cookies'
import HIGButton from './hig/HIGButton.vue'
import HIGModal from './hig/HIGModal.vue'

const showBanner = ref(false)
const showPreferences = ref(false)
const preferences = ref<CookiePreferences>({
  essential: true,
  analytics: false,
  functional: false,
  marketing: false
})

// Provide a function to open preferences from anywhere
const openCookiePreferences = () => {
  preferences.value = getCookiePreferences()
  showPreferences.value = true
}

// Make it available globally via provide/inject
provide('openCookiePreferences', openCookiePreferences)

// Also expose it on window for easy access
if (typeof window !== 'undefined') {
  (window as any).openCookiePreferences = openCookiePreferences
}

onMounted(() => {
  // Check if user has already given consent
  if (!hasCookieConsent()) {
    showBanner.value = true
    // Load current preferences
    preferences.value = getCookiePreferences()
  }
})

const acceptAll = () => {
  acceptAllCookies()
  showBanner.value = false
}

const openPreferences = () => {
  preferences.value = getCookiePreferences()
  showPreferences.value = true
}

const savePreferences = () => {
  setCookiePreferences(preferences.value)
  showBanner.value = false
  showPreferences.value = false
}

const rejectAll = () => {
  rejectAllCookies()
  showBanner.value = false
  showPreferences.value = false
}
</script>

<style scoped>
/* Cookie Banner Transition */
.cookie-banner-enter-active,
.cookie-banner-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.cookie-banner-enter-from {
  transform: translateY(100%);
  opacity: 0;
}

.cookie-banner-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

