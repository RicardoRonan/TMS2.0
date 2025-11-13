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
    notifications: [],
    // Admin mode state
    adminMode: false,
    editHistory: [],
    currentHistoryIndex: -1,
    pendingChanges: {} // Map of entityId -> { type, entityId, changes: { field: { oldValue, newValue } } }
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
    editHistory: state => state.editHistory
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

