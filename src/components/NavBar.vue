<template>
  <!-- Mobile Top Bar (WhatsApp style) -->
  <nav class="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg-secondary border-b border-border-primary">
    <div class="flex items-center justify-between h-14 px-4">
      <!-- Logo/Brand on left (clickable to home) -->
      <router-link 
        to="/" 
        class="flex items-center space-x-2 active:opacity-70 transition-opacity"
        @click="closeMenuOverlay"
      >
        <img src="@/assets/meta-stack-logo.png" alt="MetaStack Logo" class="w-8 h-8" />
        <span class="text-xl font-semibold text-text-primary">MetaStack</span>
      </router-link>
      
      <!-- Auth buttons / Menu button -->
      <div class="flex items-center space-x-1">
        <!-- Admin mode buttons: Save, Undo, Redo -->
        <template v-if="isAdminMode && currentUser?.isAdmin">
          <button
            class="p-2 text-text-primary hover:text-primary-500 active:opacity-70 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleSave"
            :disabled="!hasPendingChanges || saving"
            title="Save changes"
            aria-label="Save changes"
          >
            <Icon name="save" :size="18" />
          </button>
          <button
            class="p-2 text-text-primary hover:text-primary-500 active:opacity-70 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleUndo"
            :disabled="!canUndo"
            title="Undo"
            aria-label="Undo"
          >
            <Icon name="undo" :size="18" />
          </button>
          <button
            class="p-2 text-text-primary hover:text-primary-500 active:opacity-70 transition-colors rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleRedo"
            :disabled="!canRedo"
            title="Redo"
            aria-label="Redo"
          >
            <Icon name="redo" :size="18" />
          </button>
        </template>
        <template v-if="!isAuthenticated">
          <HIGButton variant="primary" size="sm" @click="showRegisterModal = true">
            Sign Up
          </HIGButton>
        </template>
        <!-- Three-dot menu on right -->
        <button
          class="p-2 -mr-2 text-text-primary hover:text-primary-500 active:opacity-70 transition-colors rounded-full relative"
          @click="toggleMenuOverlay"
          aria-label="Open menu"
          ref="menuButtonRef"
        >
          <Icon name="ellipsis-vertical" :size="20" />
        </button>
      </div>
    </div>
  </nav>

  <!-- Desktop Navigation -->
  <nav class="hidden md:block nav-bar sticky top-0 z-50 bg-bg-secondary border-b border-border-primary shadow-lg">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <!-- Logo (Left on desktop) -->
        <router-link to="/" class="flex items-center space-x-2">
          <img src="@/assets/meta-stack-logo.png" alt="MetaStack Logo" class="w-8 h-8" />
          <span class="text-xl font-bold text-text-primary">MetaStack</span>
        </router-link>

        <!-- Desktop Navigation Links -->
        <div class="flex items-center space-x-8">
          <router-link
            v-for="item in regularNavigationItems"
            :key="item.name"
            :to="item.href"
            :class="navLinkClasses(item.href)"
            @click="closeMobileMenu"
          >
            {{ item.name }}
          </router-link>
          
          <!-- Resources Dropdown -->
          <div
            class="relative"
            ref="resourcesMenuRef"
            @mouseenter="showResourcesMenu = true"
            @mouseleave="showResourcesMenu = false"
          >
            <button
              :class="[
                'nav-link flex items-center space-x-1',
                {
                  'nav-link-active': isResourcesRouteActive
                }
              ]"
            >
              <span>Resources</span>
              <Icon 
                name="chevron-down" 
                :size="16" 
                :class="[
                  'transition-transform duration-200 ease-in-out',
                  { 'rotate-180': showResourcesMenu }
                ]"
              />
            </button>

            <!-- Resources Dropdown -->
            <Transition name="dropdown">
              <div
                v-if="showResourcesMenu"
                class="absolute left-0 mt-2 w-48 bg-bg-secondary rounded-lg shadow-hig border border-border-primary py-1"
              >
                <router-link
                  to="/blog"
                  class="block px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  @click="closeResourcesMenu"
                >
                  Blog
                </router-link>
                <router-link
                  to="/tools"
                  class="block px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  @click="closeResourcesMenu"
                >
                  Tools
                </router-link>
                <router-link
                  to="/tutorials"
                  class="block px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                  @click="closeResourcesMenu"
                >
                  Tutorials
                </router-link>
              </div>
            </Transition>
          </div>
          
          <!-- Contact -->
          <router-link
            to="/contact"
            :class="navLinkClasses('/contact')"
            @click="closeMobileMenu"
          >
            Contact
          </router-link>
        </div>

        <!-- User Menu / Auth Buttons -->
        <div class="hidden md:flex items-center space-x-4">
          <!-- Admin Mode Indicator -->
          <span
            v-if="isAdminMode && currentUser?.isAdmin"
            class="px-2 py-1 text-xs font-semibold rounded-full bg-success-500/20 text-success-500 border border-success-500/30"
            title="Admin Mode is active"
          >
            Admin Mode
          </span>
          
          <template v-if="isAuthenticated">
            <div 
              class="relative" 
              ref="userMenuRef"
              @mouseenter="showUserMenu = true"
              @mouseleave="showUserMenu = false"
            >
              <button
                class="flex items-center space-x-2 text-text-primary hover:text-primary-500 transition-colors"
              >
                <div v-if="currentUser?.photoURL" class="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-bg-tertiary">
                  <img 
                    :src="currentUser.photoURL" 
                    :alt="currentUser?.displayName || 'User'"
                    class="w-full h-full object-cover"
                  />
                </div>
                <div v-else class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">
                    {{ userInitials }}
                  </span>
                </div>
                <span class="text-sm">{{ currentUser?.displayName || 'User' }}</span>
                <Icon 
                  name="chevron-down" 
                  :size="16" 
                  :class="[
                    'transition-transform duration-200 ease-in-out',
                    { 'rotate-180': showUserMenu }
                  ]"
                />
              </button>

              <!-- User Dropdown -->
              <Transition name="dropdown">
                <div v-if="showUserMenu" class="absolute right-0 mt-2 w-48 bg-bg-secondary rounded-lg shadow-hig border border-border-primary py-1">
                  <router-link
                    to="/profile"
                    class="block px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                    @click="closeUserMenu"
                  >
                    Profile
                  </router-link>
                  <router-link
                    to="/settings"
                    class="block px-4 py-2 text-sm text-text-primary hover:bg-bg-tertiary transition-colors"
                    @click="closeUserMenu"
                  >
                    Settings
                  </router-link>
                  <div class="border-t border-border-primary my-1"></div>
                  <button
                    class="block w-full text-left px-4 py-2 text-sm text-danger hover:bg-bg-tertiary transition-colors"
                    @click="handleLogout"
                  >
                    Sign Out
                  </button>
                </div>
              </Transition>
            </div>
          </template>
          <template v-else>
            <HIGButton variant="tertiary" size="sm" @click="showLoginModal = true">
              Sign In
            </HIGButton>
            <HIGButton variant="primary" size="sm" @click="showRegisterModal = true">
              Sign Up
            </HIGButton>
          </template>
        </div>
      </div>
    </div>

    <!-- Mobile Sidebar Backdrop -->
    <Teleport to="body">
      <Transition name="backdrop">
        <div
          v-if="showMobileMenu"
          class="md:hidden fixed inset-0 bg-black/50 z-[60]"
          @click="closeMobileMenu"
        ></div>
      </Transition>

      <!-- Mobile Sidebar -->
      <Transition name="sidebar">
        <aside
          v-if="showMobileMenu"
          class="md:hidden fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-[280px] max-w-[75vw] bg-bg-secondary border-r border-border-primary shadow-xl z-[70] overflow-y-auto"
        >
          <div class="p-4 space-y-2">
            <router-link
              v-for="item in regularNavigationItems"
              :key="item.name"
              :to="item.href"
              :class="mobileNavLinkClasses(item.href)"
              @click="closeMobileMenu"
            >
              {{ item.name }}
            </router-link>
            
            <!-- Resources Mobile Dropdown -->
            <div>
              <button
                class="block w-full px-4 py-2 text-sm font-medium rounded-md transition-colors text-text-secondary hover:text-text-primary hover:bg-bg-tertiary flex items-center justify-between"
                @click="toggleResourcesMobileMenu"
              >
                <span>Resources</span>
                <Icon
                  :name="showResourcesMobileMenu ? 'chevron-up' : 'chevron-down'"
                  :size="16"
                />
              </button>
              <Transition name="mobile-menu">
                <div v-if="showResourcesMobileMenu" class="pl-4 mt-2 space-y-2">
                  <router-link
                    to="/blog"
                    :class="mobileNavLinkClasses('/blog')"
                    @click="closeMobileMenu"
                  >
                    Blog
                  </router-link>
                  <router-link
                    to="/tools"
                    :class="mobileNavLinkClasses('/tools')"
                    @click="closeMobileMenu"
                  >
                    Tools
                  </router-link>
                  <router-link
                    to="/tutorials"
                    :class="mobileNavLinkClasses('/tutorials')"
                    @click="closeMobileMenu"
                  >
                    Tutorials
                  </router-link>
                </div>
              </Transition>
            </div>
            
            <!-- Contact -->
            <router-link
              to="/contact"
              :class="mobileNavLinkClasses('/contact')"
              @click="closeMobileMenu"
            >
              Contact
            </router-link>
          </div>
          
          <div v-if="isAuthenticated" class="px-4 mt-4 pt-4 border-t border-border-primary space-y-2">
            <router-link
              to="/profile"
              :class="mobileNavLinkClasses('/profile')"
              @click="closeMobileMenu"
            >
              Profile
            </router-link>
            <router-link
              to="/settings"
              :class="mobileNavLinkClasses('/settings')"
              @click="closeMobileMenu"
            >
              Settings
            </router-link>
          </div>
          
          <div v-if="!isAuthenticated" class="px-4 mt-4 pt-4 border-t border-border-primary space-y-2">
            <HIGButton
              variant="tertiary"
              size="sm"
              full-width
              @click="showLoginModal = true; closeMobileMenu()"
            >
              Sign In
            </HIGButton>
            <HIGButton
              variant="primary"
              size="sm"
              full-width
              @click="showRegisterModal = true; closeMobileMenu()"
            >
              Sign Up
            </HIGButton>
          </div>
        </aside>
      </Transition>

      <!-- Menu Overlay Backdrop -->
      <Transition name="backdrop">
        <div
          v-if="showMenuOverlay"
          class="md:hidden fixed inset-0 bg-black/50 z-[60]"
          @click="closeMenuOverlay"
        ></div>
      </Transition>

      <!-- Menu Overlay (WhatsApp style) -->
      <Transition name="menu-overlay">
        <div
          v-if="showMenuOverlay"
          class="md:hidden fixed top-14 right-2 bg-bg-secondary rounded-lg shadow-hig-lg border border-border-primary z-[70] min-w-[220px] max-w-[85vw] overflow-hidden"
        >
          <div class="py-1">
            <router-link
              to="/"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Home
            </router-link>
            <router-link
              v-if="isAuthenticated"
              to="/profile"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Profile
            </router-link>
            <router-link
              v-if="isAuthenticated"
              to="/settings"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Settings
            </router-link>
            <router-link
              to="/about"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              About
            </router-link>
            <div v-if="isAuthenticated" class="border-t border-border-primary my-1"></div>
            <router-link
              to="/blog"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Blog
            </router-link>
            <router-link
              to="/tools"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Tools
            </router-link>
            <router-link
              to="/tutorials"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Tutorials
            </router-link>
            <router-link
              to="/contact"
              class="block px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="closeMenuOverlay"
            >
              Contact
            </router-link>
            <div v-if="isAuthenticated" class="border-t border-border-primary my-1"></div>
            <button
              v-if="isAuthenticated"
              class="block w-full text-left px-4 py-3.5 text-sm text-danger hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
              @click="handleMenuLogout"
            >
              Sign Out
            </button>
            <template v-else>
              <div class="border-t border-border-primary my-1"></div>
              <button
                class="block w-full text-left px-4 py-3.5 text-sm text-text-primary hover:bg-bg-tertiary active:bg-bg-tertiary transition-colors"
                @click="handleMenuSignIn"
              >
                Sign In
              </button>
            </template>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Login Modal -->
    <HIGModal
      v-model:is-open="showLoginModal"
      title="Sign In"
      size="sm"
    >
      <LoginForm @success="handleLoginSuccess" />
    </HIGModal>

    <!-- Register Modal -->
    <HIGModal
      v-model:is-open="showRegisterModal"
      title="Create Account"
      size="sm"
    >
      <RegisterForm @success="handleRegisterSuccess" />
    </HIGModal>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { useAuth } from '../composables/useAuth'
import { useAdminMode } from '../composables/useAdminMode'
import HIGButton from './hig/HIGButton.vue'
import HIGModal from './hig/HIGModal.vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import Icon from './Icon.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { logout } = useAuth()

// Admin mode state
const isAdminMode = computed(() => store.getters.isAdminMode)
const {
  canUndo,
  canRedo,
  hasPendingChanges,
  undoEdit,
  redoEdit,
  saveChanges
} = useAdminMode()

const saving = ref(false)

// State
const showMobileMenu = ref(false)
const showMenuOverlay = ref(false)
const showUserMenu = ref(false)
const showResourcesMenu = ref(false)
const showResourcesMobileMenu = ref(false)
const showLoginModal = ref(false)
const showRegisterModal = ref(false)
const userMenuRef = ref<HTMLElement>()
const resourcesMenuRef = ref<HTMLElement>()
const menuButtonRef = ref<HTMLElement>()

// Navigation items
const regularNavigationItems = [
  { name: 'Home', href: '/' },
  // { name: 'Projects', href: '/projects' },
  { name: 'About', href: '/about' }
]

const resourcesItems = [
  { name: 'Blog', href: '/blog' },
  { name: 'Tools', href: '/tools' },
  { name: 'Tutorials', href: '/tutorials' }
]

// Computed
const isAuthenticated = computed(() => store.getters.isAuthenticated)
const currentUser = computed(() => store.getters.currentUser)
const userInitials = computed(() => {
  if (!currentUser.value?.displayName) return 'U'
  return currentUser.value.displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const isResourcesRouteActive = computed(() => {
  return resourcesItems.some(item => route.path === item.href || route.path.startsWith(item.href + '/'))
})

// Methods
const navLinkClasses = (href: string) => [
  'nav-link',
  {
    'nav-link-active': route.path === href
  }
]

const mobileNavLinkClasses = (href: string) => [
  'block px-4 py-2 text-sm font-medium rounded-md transition-colors',
  {
    'text-primary-500 bg-primary-50': route.path === href,
    'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary': route.path !== href
  }
]

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
  updateBodyScroll()
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
  showResourcesMobileMenu.value = false
  updateBodyScroll()
}

const toggleMenuOverlay = () => {
  showMenuOverlay.value = !showMenuOverlay.value
  if (showMenuOverlay.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMenuOverlay = () => {
  showMenuOverlay.value = false
  document.body.style.overflow = ''
}

const updateBodyScroll = () => {
  if (showMobileMenu.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeUserMenu = () => {
  showUserMenu.value = false
}

const closeResourcesMenu = () => {
  showResourcesMenu.value = false
}

const toggleResourcesMobileMenu = () => {
  showResourcesMobileMenu.value = !showResourcesMobileMenu.value
}

const handleLogout = async () => {
  try {
    await logout()
    closeUserMenu()
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

const handleMenuLogout = async () => {
  closeMenuOverlay()
  await handleLogout()
}

const handleMenuSignIn = () => {
  closeMenuOverlay()
  showLoginModal.value = true
}

// Admin mode handlers
const handleUndo = () => {
  undoEdit()
}

const handleRedo = () => {
  redoEdit()
}

const handleSave = async () => {
  try {
    saving.value = true
    await saveChanges()
  } catch (error) {
    // Error is already handled in saveChanges
  } finally {
    saving.value = false
  }
}

const handleLoginSuccess = () => {
  console.log('Login success handler called')
  showLoginModal.value = false
  
  // Wait a moment for store to update, then verify user is actually signed in
  setTimeout(() => {
    const user = store.getters.currentUser
    const authenticated = store.getters.isAuthenticated
    console.log('After login - User:', user, 'Authenticated:', authenticated)
    
    if (authenticated && user) {
      // User is actually signed in, navigate if needed
      if (route.path === '/auth' || route.path.includes('/auth')) {
        router.push('/')
      }
    } else {
      // User not actually signed in - show error
      console.error('Login appeared successful but user is not in store')
      store.dispatch('addNotification', {
        type: 'error',
        message: 'Sign in may not have completed. Please try again.'
      })
    }
  }, 100)
}

const handleRegisterSuccess = () => {
  console.log('Register success handler called')
  showRegisterModal.value = false
  
  // Remove signup query parameter
  if (route.query.signup) {
    router.replace({ query: {} })
  }
  
  // Wait a moment for store to update, then verify user is actually signed in
  setTimeout(() => {
    const user = store.getters.currentUser
    const authenticated = store.getters.isAuthenticated
    console.log('After register - User:', user, 'Authenticated:', authenticated)
    
    if (authenticated && user) {
      // User is actually signed in, navigate if needed
      if (route.path === '/auth' || route.path.includes('/auth')) {
        router.push('/')
      }
    } else {
      // User not actually signed in - might need email confirmation
      console.log('User registered but may need email confirmation')
      // Don't show error - email confirmation message already shown
    }
  }, 100)
}

// Watch for signup query parameter to open register modal
watch(() => route.query.signup, (signup) => {
  if (signup === 'true' && !isAuthenticated.value) {
    showRegisterModal.value = true
  }
}, { immediate: true })

// Also check on mount
onMounted(() => {
  if (route.query.signup === 'true' && !isAuthenticated.value) {
    showRegisterModal.value = true
  }
})

// Watch route changes to close sidebar and menu overlay
watch(() => route.path, () => {
  if (showMobileMenu.value) {
    closeMobileMenu()
  }
  if (showMenuOverlay.value) {
    closeMenuOverlay()
  }
})

// Provide sidebar state for App.vue to use
provide('isMobileSidebarOpen', showMobileMenu)

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
  if (showMenuOverlay.value) {
    closeMenuOverlay()
  }
})
</script>

<style scoped>
.nav-bar {
  backdrop-filter: blur(10px);
  background-color: rgba(var(--bg-secondary-rgb), 0.95);
}

/* Mobile top bar styling */
@media (max-width: 767px) {
  nav.md\\:hidden {
    backdrop-filter: blur(10px);
    background-color: var(--color-bg-secondary);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 0.2s ease;
}

.mobile-menu-enter-from {
  opacity: 0;
  max-height: 0;
}

.mobile-menu-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Sidebar slide-in animation */
.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.3s ease-in-out;
}

.sidebar-enter-from {
  transform: translateX(-100%);
}

.sidebar-leave-to {
  transform: translateX(-100%);
}

/* Ensure sidebar is off-screen when closed */
aside.md\\:hidden {
  transform: translateX(-100%);
}

aside.md\\:hidden[data-sidebar-open="true"] {
  transform: translateX(0);
}

/* Backdrop fade animation */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

/* Menu overlay animation */
.menu-overlay-enter-active,
.menu-overlay-leave-active {
  transition: all 0.2s ease;
}

.menu-overlay-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.menu-overlay-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
</style>

