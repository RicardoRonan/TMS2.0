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

// Mount app immediately - don't wait for auth initialization
app.mount('#app')

// Initialize auth listener and test Supabase connection asynchronously after mount (non-blocking)
Promise.resolve().then(async () => {
  try {
    const { initializeAuthListener } = await import('./composables/useAuth')
    initializeAuthListener(store)
    
    // Test Supabase connection
    try {
      const { supabase } = await import('./supabase')
      const { error } = await supabase.from('blogs').select('id').limit(1)
      if (error && error.code !== 'PGRST116') {
        store.dispatch('addNotification', {
          type: 'error',
          message: `Supabase connection error: ${error.message || error.code}`,
          duration: 10000
        })
      }
    } catch (testErr: any) {
      store.dispatch('addNotification', {
        type: 'error',
        message: `Failed to connect to Supabase: ${testErr.message || 'Unknown error'}`,
        duration: 10000
      })
    }
  } catch (err) {
    // Silently fail - auth listener is not critical for app startup
  }
})

