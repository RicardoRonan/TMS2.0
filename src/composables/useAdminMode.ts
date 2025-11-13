import { computed } from 'vue'
import { useStore } from 'vuex'
import { useAuth } from './useAuth'
import { supabase } from '../supabase'
import { groupChangesByEntity, createUpdatePayload, getTableName, getIdField } from '../utils/changeTracker'
import type { PendingChange } from '../utils/changeTracker'

export function useAdminMode() {
  const store = useStore()
  const { user } = useAuth()

  // Computed properties
  const isAdminMode = computed(() => store.getters.isAdminMode)
  const canEdit = computed(() => {
    return user.value?.isAdmin && isAdminMode.value
  })
  const canUndo = computed(() => store.getters.canUndo)
  const canRedo = computed(() => store.getters.canRedo)
  const hasPendingChanges = computed(() => store.getters.hasPendingChanges)
  const pendingChanges = computed(() => store.getters.pendingChanges)

  // Toggle admin mode
  const toggleAdminMode = () => {
    if (!user.value?.isAdmin) {
      store.dispatch('addNotification', {
        type: 'error',
        message: 'Only administrators can enable admin mode'
      })
      return
    }
    store.dispatch('toggleAdminMode')
  }

  // Record an edit
  const recordEdit = (type: string, entityId: string, field: string, oldValue: any, newValue: any) => {
    if (!canEdit.value) return
    
    store.dispatch('recordEdit', {
      type,
      entityId,
      field,
      oldValue,
      newValue
    })
  }

  // Undo last edit
  const undoEdit = () => {
    if (!canUndo.value) return
    store.dispatch('undoEdit')
  }

  // Redo last undone edit
  const redoEdit = () => {
    if (!canRedo.value) return
    store.dispatch('redoEdit')
  }

  // Save all pending changes to database
  const saveChanges = async () => {
    if (!hasPendingChanges.value) {
      store.dispatch('addNotification', {
        type: 'info',
        message: 'No changes to save'
      })
      return
    }

    try {
      store.dispatch('setLoading', true)
      
      const changes = pendingChanges.value
      const grouped = groupChangesByEntity(changes)
      
      // Process each entity type
      const updatePromises: Promise<any>[] = []

      Object.entries(grouped).forEach(([type, entities]) => {
        // Skip 'content' type changes as they are for static page content tracking only
        // and don't correspond to database tables
        if (type === 'content') {
          console.log(`Skipping ${Object.keys(entities).length} 'content' type changes (static page content tracking only)`)
          return
        }

        const tableName = getTableName(type)
        const idField = getIdField(type)
        
        Object.entries(entities).forEach(([entityId, change]) => {
          const payload = createUpdatePayload(change)
          
          // Add updated_at timestamp if the table has it
          if (tableName !== 'users') {
            payload.updated_at = new Date().toISOString()
          }
          
          const updatePromise = supabase
            .from(tableName)
            .update(payload)
            .eq(idField, entityId)
          
          updatePromises.push(updatePromise)
        })
      })
      
      // Execute all updates
      const results = await Promise.all(updatePromises)
      
      // Check for errors
      const errors = results.filter(r => r.error)
      if (errors.length > 0) {
        const errorMessages = errors.map(e => e.error?.message || 'Unknown error').join(', ')
        throw new Error(`Failed to save some changes: ${errorMessages}`)
      }
      
      // Clear pending changes on success
      store.dispatch('saveChanges')
      
      store.dispatch('addNotification', {
        type: 'success',
        message: 'All changes saved successfully'
      })
    } catch (error: any) {
      console.error('Error saving changes:', error)
      store.dispatch('addNotification', {
        type: 'error',
        message: error.message || 'Failed to save changes'
      })
      throw error
    } finally {
      store.dispatch('setLoading', false)
    }
  }

  // Cancel all pending changes
  const cancelChanges = async () => {
    if (!hasPendingChanges.value) {
      return
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to cancel all pending changes? This action cannot be undone.'
    )
    
    if (!confirmed) {
      return
    }

    store.dispatch('cancelChanges')
    
    store.dispatch('addNotification', {
      type: 'info',
      message: 'All pending changes have been discarded'
    })
  }

  return {
    // State
    isAdminMode,
    canEdit,
    canUndo,
    canRedo,
    hasPendingChanges,
    pendingChanges,
    
    // Methods
    toggleAdminMode,
    recordEdit,
    undoEdit,
    redoEdit,
    saveChanges,
    cancelChanges
  }
}

