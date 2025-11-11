import { createApp } from 'vue'
import { createStore } from 'vuex'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import './styles/main.css'

// Import all FontAwesome icons used in the app
import { 
  faHome, 
  faBars, 
  faXmark, 
  faChevronDown, 
  faChevronUp, 
  faChevronLeft, 
  faChevronRight,
  faMagnifyingGlass,
  faArrowUpRightFromSquare,
  faHeart,
  faStar,
  faBookmark,
  faShare,
  faDownload,
  faUpload,
  faPen,
  faTrash,
  faCopy,
  faGear,
  faFilter,
  faUser,
  faUserCircle,
  faRightToBracket,
  faRightFromBracket,
  faIdCard,
  faFile,
  faFileLines,
  faNewspaper,
  faFolder,
  faComments,
  faEnvelope,
  faBell,
  faToolbox,
  faWrench,
  faCode,
  faGraduationCap,
  faCheck,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faMinus,
  faCircleInfo,
  faTriangleExclamation,
  faCheckCircle,
  faImage,
  faVideo,
  faMusic,
  faCalendar,
  faClock,
  faTag,
  faLink,
  faPhone,
  faLocationDot,
  faSun,
  faMoon,
  faCodeBranch,
  faUsers,
  faAward,
  faLightbulb,
  faHeart,
  faBook,
  faDatabase,
  faLaptopCode,
  faRobot,
  faGears,
  faFileCode,
  faCircleNodes
} from '@fortawesome/free-solid-svg-icons'

import {
  faTwitter,
  faGithub,
  faLinkedin,
  faFacebook,
  faPinterest
} from '@fortawesome/free-brands-svg-icons'

// Add icons to the library
library.add(
  faHome, 
  faBars, 
  faXmark, 
  faChevronDown, 
  faChevronUp, 
  faChevronLeft, 
  faChevronRight,
  faMagnifyingGlass,
  faArrowUpRightFromSquare,
  faHeart,
  faStar,
  faBookmark,
  faShare,
  faDownload,
  faUpload,
  faPen,
  faTrash,
  faCopy,
  faGear,
  faFilter,
  faUser,
  faUserCircle,
  faRightToBracket,
  faRightFromBracket,
  faIdCard,
  faFile,
  faFileLines,
  faNewspaper,
  faFolder,
  faComments,
  faEnvelope,
  faBell,
  faToolbox,
  faWrench,
  faCode,
  faGraduationCap,
  faCheck,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faMinus,
  faCircleInfo,
  faTriangleExclamation,
  faCheckCircle,
  faImage,
  faVideo,
  faMusic,
  faCalendar,
  faClock,
  faTag,
  faLink,
  faPhone,
  faLocationDot,
  faSun,
  faMoon,
  faCodeBranch,
  faUsers,
  faAward,
  faLightbulb,
  faHeart,
  faBook,
  faDatabase,
  faLaptopCode,
  faRobot,
  faGears,
  faFileCode,
  faCircleNodes,
  faTwitter,
  faGithub,
  faLinkedin,
  faFacebook,
  faPinterest
)

// Create Vuex store
const store = createStore({
  state: {
    user: null,
    theme: 'dark',
    loading: false,
    notifications: []
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    SET_THEME(state, theme) {
      state.theme = theme
    },
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification)
    },
    REMOVE_NOTIFICATION(state, id) {
      state.notifications = state.notifications.filter(n => n.id !== id)
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user)
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme)
      localStorage.setItem('theme', theme)
      document.documentElement.setAttribute('data-theme', theme)
    },
    setLoading({ commit }, loading) {
      commit('SET_LOADING', loading)
    },
    addNotification({ commit }, notification) {
      const id = Date.now()
      commit('ADD_NOTIFICATION', { id, ...notification })
      setTimeout(() => {
        commit('REMOVE_NOTIFICATION', id)
      }, 5000)
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    currentTheme: state => state.theme,
    isLoading: state => state.loading,
    notifications: state => state.notifications
  }
})

const app = createApp(App)

// Register FontAwesome component globally
app.component('FontAwesomeIcon', FontAwesomeIcon)

app.use(store)
app.use(router)

// Initialize auth state before mounting app (restore session on reload)
// This ensures users stay logged in after page reload
async function initializeApp() {
  try {
    // Initialize auth listener first (this sets up the global auth state listener)
    const { initializeAuthListener } = await import('./composables/useAuth')
    initializeAuthListener(store)
    
    // Also initialize auth state (restore session)
    const { initializeAuth } = await import('./utils/initAuth')
    await initializeAuth(store)
  } catch (err) {
    console.error('Error initializing auth:', err)
    // Continue app startup even if auth init fails
  }

  // Test Supabase connection on startup (in development) - non-blocking
  if (import.meta.env.DEV) {
    // Run diagnostic tool first for detailed analysis
    import('./utils/diagnoseSupabase').then(({ diagnoseSupabase }) => {
      diagnoseSupabase().catch(err => {
        console.error('Diagnostic tool error:', err)
      })
    }).catch(err => {
      console.error('Failed to load diagnostic tool:', err)
    })
    
    // Also run the connection test
    import('./utils/testSupabase').then(({ testSupabaseConnection }) => {
      // Run test but don't block app startup
      testSupabaseConnection().catch(err => {
        console.error('Supabase connection test error:', err)
      })
    }).catch(err => {
      console.error('Failed to load Supabase test utility:', err)
    })
  }

  // Mount app after auth is initialized
  app.mount('#app')
}

// Start app initialization
initializeApp()

