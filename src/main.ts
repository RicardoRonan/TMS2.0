import { createApp } from 'vue'
import { createStore } from 'vuex'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import App from './App.vue'
import router from './router'
import './styles/main.css'
import { getCachedData as getCache, setCachedData as setCache, clearCache as clearCacheUtil, hasValidCache, type CacheType } from './utils/cache'

// Create Vuex store
const store = createStore({
  state: {
    user: null,
    theme: 'dark',
    loading: false,
    notifications: [],
    // Admin mode state
    adminMode: false,
    editHistory: [],
    currentHistoryIndex: -1,
    pendingChanges: {}, // Map of entityId -> { type, entityId, changes: { field: { oldValue, newValue } } }
    // Cache state - data is persisted in localStorage via cache utils
    cache: {
      // Cache metadata is stored in localStorage, this is just for reactive access
      lastUpdated: {} as Record<CacheType, number>
    }
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
      // Persist user data to localStorage for session restoration
      if (user) {
        try {
          localStorage.setItem('user', JSON.stringify(user))
        } catch (err) {
          console.warn('Failed to save user to localStorage:', err)
        }
      } else {
        // Clear user data from localStorage on logout
        try {
          localStorage.removeItem('user')
        } catch (err) {
          console.warn('Failed to remove user from localStorage:', err)
        }
      }
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
    },
    // Admin mode mutations
    SET_ADMIN_MODE(state, enabled) {
      state.adminMode = enabled
      localStorage.setItem('adminMode', String(enabled))
    },
    ADD_EDIT_HISTORY(state, edit) {
      // Remove any edits after current index (when undoing and then making new edit)
      if (state.currentHistoryIndex < state.editHistory.length - 1) {
        state.editHistory = state.editHistory.slice(0, state.currentHistoryIndex + 1)
      }
      // Add new edit
      state.editHistory.push(edit)
      state.currentHistoryIndex = state.editHistory.length - 1
      // Limit history size to 50
      if (state.editHistory.length > 50) {
        state.editHistory.shift()
        state.currentHistoryIndex = state.editHistory.length - 1
      }
    },
    UNDO_EDIT(state) {
      if (state.currentHistoryIndex >= 0) {
        const edit = state.editHistory[state.currentHistoryIndex]
        // Revert the change in pendingChanges
        const key = `${edit.type}:${edit.entityId}`
        if (state.pendingChanges[key]) {
          state.pendingChanges[key].changes[edit.field] = {
            oldValue: state.pendingChanges[key].changes[edit.field].oldValue,
            newValue: edit.oldValue
          }
        }
        state.currentHistoryIndex--
      }
    },
    REDO_EDIT(state) {
      if (state.currentHistoryIndex < state.editHistory.length - 1) {
        state.currentHistoryIndex++
        const edit = state.editHistory[state.currentHistoryIndex]
        // Apply the change in pendingChanges
        const key = `${edit.type}:${edit.entityId}`
        if (state.pendingChanges[key]) {
          state.pendingChanges[key].changes[edit.field] = {
            oldValue: state.pendingChanges[key].changes[edit.field].oldValue,
            newValue: edit.newValue
          }
        }
      }
    },
    CLEAR_PENDING_CHANGES(state) {
      state.pendingChanges = {}
      state.editHistory = []
      state.currentHistoryIndex = -1
    },
    UPDATE_PENDING_CHANGE(state, { type, entityId, field, oldValue, newValue }) {
      const key = `${type}:${entityId}`
      if (!state.pendingChanges[key]) {
        state.pendingChanges[key] = {
          type,
          entityId,
          changes: {}
        }
      }
      // If this is the first edit to this field, store the oldValue
      if (!state.pendingChanges[key].changes[field]) {
        state.pendingChanges[key].changes[field] = { oldValue, newValue }
      } else {
        // Update the newValue
        state.pendingChanges[key].changes[field].newValue = newValue
      }
    },
    // Cache mutations
    UPDATE_CACHE_TIMESTAMP(state, { type, timestamp }) {
      state.cache.lastUpdated[type] = timestamp
    }
  },
  actions: {
    setUser({ commit }, user) {
      commit('SET_USER', user)
      // Clear admin mode if user logs out
      if (!user) {
        commit('SET_ADMIN_MODE', false)
        commit('CLEAR_PENDING_CHANGES')
      }
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
    },
    // Admin mode actions
    toggleAdminMode({ commit, state }) {
      const newState = !state.adminMode
      commit('SET_ADMIN_MODE', newState)
      if (!newState) {
        // Clear pending changes when disabling admin mode
        commit('CLEAR_PENDING_CHANGES')
      }
    },
    recordEdit({ commit }, { type, entityId, field, oldValue, newValue }) {
      // Skip if value hasn't actually changed
      if (oldValue === newValue) return
      
      // Update pending changes
      commit('UPDATE_PENDING_CHANGE', { type, entityId, field, oldValue, newValue })
      
      // Add to history
      commit('ADD_EDIT_HISTORY', {
        type,
        entityId,
        field,
        oldValue,
        newValue,
        timestamp: Date.now()
      })
    },
    undoEdit({ commit, state }) {
      if (state.currentHistoryIndex >= 0) {
        commit('UNDO_EDIT')
      }
    },
    redoEdit({ commit, state }) {
      if (state.currentHistoryIndex < state.editHistory.length - 1) {
        commit('REDO_EDIT')
      }
    },
    saveChanges({ commit, state }) {
      // This will be implemented in the composable with actual DB operations
      // For now, just clear pending changes
      commit('CLEAR_PENDING_CHANGES')
    },
    cancelChanges({ commit }) {
      commit('CLEAR_PENDING_CHANGES')
    },
    // Cache actions
    setCachedData({ commit }, { type, data, ttl }) {
      setCache(type, data, ttl)
      commit('UPDATE_CACHE_TIMESTAMP', { type, timestamp: Date.now() })
    },
    getCachedData({ commit }, type) {
      const data = getCache(type)
      if (data) {
        commit('UPDATE_CACHE_TIMESTAMP', { type, timestamp: Date.now() })
      }
      return data
    },
    clearCache({ commit, state }, type) {
      clearCacheUtil(type)
      if (type) {
        delete state.cache.lastUpdated[type]
      } else {
        state.cache.lastUpdated = {}
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    currentUser: state => state.user,
    currentTheme: state => state.theme,
    isLoading: state => state.loading,
    notifications: state => state.notifications,
    // Admin mode getters
    isAdminMode: state => state.adminMode,
    canUndo: state => state.currentHistoryIndex >= 0,
    canRedo: state => state.currentHistoryIndex < state.editHistory.length - 1,
    hasPendingChanges: state => Object.keys(state.pendingChanges).length > 0,
    pendingChanges: state => state.pendingChanges,
    editHistory: state => state.editHistory,
    // Cache getters
    getCachedData: () => (type: CacheType) => {
      return getCache(type)
    },
    hasValidCache: () => (type: CacheType) => {
      return hasValidCache(type)
    }
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
  // Restore user data from localStorage FIRST (immediate restoration)
  // This ensures user appears logged in immediately on page reload
  try {
    const savedUser = localStorage.getItem('user')
    const supabaseSession = localStorage.getItem('supabase.auth.token')
    
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser)
        // Restore user data immediately (before Supabase loads)
        // This provides instant UI feedback while Supabase session is being verified
        store.commit('SET_USER', userData)
      } catch (parseErr) {
        console.warn('⚠️ Failed to parse saved user data:', parseErr)
        localStorage.removeItem('user')
      }
    }
  } catch (err) {
    console.warn('⚠️ Failed to restore user from localStorage:', err)
  }

  try {
    // Check if Supabase is configured before initializing
    const { isSupabaseConfigured } = await import('./supabase')
    
    if (isSupabaseConfigured()) {
      // Import supabase module to trigger client initialization
      // Supabase client automatically restores session from localStorage
      await import('./supabase')
      
      // Initialize auth listener (this will verify and sync the session)
      // The INITIAL_SESSION event will fire immediately if session exists
      const { initializeAuthListener } = await import('./composables/useAuth')
      await initializeAuthListener(store)
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
  
  // Load admin mode state from localStorage
  const savedAdminMode = localStorage.getItem('adminMode') === 'true'
  if (savedAdminMode) {
    store.commit('SET_ADMIN_MODE', savedAdminMode)
  }
  
  // Mount app - always mount even if auth init failed
  app.mount('#app')
  
  // Test Supabase connection after mount (non-blocking)
  Promise.resolve().then(async () => {
    try {
      const { supabase, isSupabaseConfigured } = await import('./supabase')
      
      if (!isSupabaseConfigured()) {
        store.dispatch('addNotification', {
          type: 'error',
          message: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.',
          duration: 15000
        })
        return
      }
      
      // Test connection with a simple query
      const { error } = await supabase.from('blogs').select('id').limit(1)
      if (error) {
        // Don't show error for "not found" (empty table) - that's okay
        if (error.code === 'PGRST116') {
          return
        }
        
        // Provide helpful error messages based on error type
        let userMessage = 'Supabase connection error'
        
        if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
          userMessage = 'Database access denied. Please check Row Level Security (RLS) policies in Supabase. Tables need SELECT policies for both anonymous and authenticated users.'
        } else if (error.code === '42P01' || error.message?.includes('does not exist')) {
          userMessage = 'Database table not found. Please check your Supabase database schema.'
        } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
          userMessage = 'Cannot connect to Supabase. Please check your network connection and VITE_SUPABASE_URL.'
        } else {
          userMessage = `Supabase connection error: ${error.message || error.code}`
        }
        
        store.dispatch('addNotification', {
          type: 'error',
          message: userMessage,
          duration: 15000
        })
      }
    } catch (testErr: any) {
      // Only show critical errors
      if (testErr?.message?.includes('Supabase') || testErr?.message?.includes('environment')) {
        store.dispatch('addNotification', {
          type: 'error',
          message: 'Failed to initialize Supabase. Please check your environment variables.',
          duration: 10000
        })
      }
    }
  })
}

// Start app initialization
initializeApp()

