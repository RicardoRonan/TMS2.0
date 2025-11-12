import { createApp } from 'vue'
import { createStore } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import './styles/main.css'

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

// Initialize auth BEFORE mounting to ensure session is restored immediately
// This is critical for session persistence on page reload
async function initializeApp() {
  try {
    // Check if Supabase is configured before initializing
    const { isSupabaseConfigured } = await import('./supabase')
    
    if (isSupabaseConfigured()) {
      // Initialize auth listener FIRST (before mounting)
      // This ensures INITIAL_SESSION event is captured as soon as possible
      const { initializeAuthListener } = await import('./composables/useAuth')
      await initializeAuthListener(store)
      
      // Small delay to let INITIAL_SESSION event fire
      await new Promise(resolve => setTimeout(resolve, 100))
    } else {
      // Supabase not configured - show notification but don't break app
      console.warn('⚠️ Supabase not configured - auth features disabled')
      setTimeout(() => {
        store.dispatch('addNotification', {
          type: 'error',
          message: 'Supabase not configured. Set environment variables in Netlify.',
          duration: 15000
        })
      }, 2000)
    }
  } catch (err: any) {
    // Continue even if auth init fails - don't break the app
    console.error('Auth initialization error (non-critical):', err?.message)
  }
  
  // Mount app - always mount even if auth init failed
  app.mount('#app')
  
  // Test Supabase connection after mount (non-blocking)
  Promise.resolve().then(async () => {
    try {
      const { supabase, isSupabaseConfigured } = await import('./supabase')
      
      if (!isSupabaseConfigured()) {
        return // Skip test if not configured
      }
      
      const { error } = await supabase.from('blogs').select('id').limit(1)
      if (error && error.code !== 'PGRST116') {
        // Only show error if it's not a "not found" error
        store.dispatch('addNotification', {
          type: 'error',
          message: `Supabase connection error: ${error.message || error.code}`,
          duration: 10000
        })
      }
    } catch (testErr: any) {
      // Silently fail - connection test is not critical
      console.warn('Connection test failed (non-critical):', testErr?.message)
    }
  })
}

// Start app initialization
initializeApp()

