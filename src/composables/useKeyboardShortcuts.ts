import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

export function useKeyboardShortcuts() {
  const store = useStore()
  const router = useRouter()

  const handleKeyDown = (event: KeyboardEvent) => {
    // Check if user is typing in an input field
    const target = event.target as HTMLElement
    const isInputField = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable ||
                        target.closest('input, textarea, [contenteditable="true"]')
    
    // Admin mode shortcuts
    if (store.getters.isAdminMode) {
      // Ctrl+Z for undo
      // In admin mode, we want to override browser undo for content edits
      // But allow normal undo when typing in input fields (unless Alt is held)
      if (event.ctrlKey && event.key === 'z' && !event.shiftKey && !event.metaKey) {
        // If Alt is held, always use admin undo
        // If not in input field, use admin undo
        // If in input field without Alt, allow browser undo
        if (!isInputField || event.altKey) {
          event.preventDefault()
          event.stopPropagation()
          if (store.getters.canUndo) {
            store.dispatch('undoEdit')
            return
          }
        }
      }
      
      // Ctrl+Shift+Z or Ctrl+Y for redo
      if ((event.ctrlKey && event.shiftKey && event.key === 'Z') || 
          (event.ctrlKey && event.key === 'y' && !event.shiftKey && !event.metaKey)) {
        if (!isInputField || event.altKey) {
          event.preventDefault()
          event.stopPropagation()
          if (store.getters.canRedo) {
            store.dispatch('redoEdit')
            return
          }
        }
      }
      
      // Ctrl+S for save (prevent browser save dialog)
      if (event.ctrlKey && event.key === 's' && !event.shiftKey && !event.metaKey) {
        event.preventDefault()
        event.stopPropagation()
        if (store.getters.hasPendingChanges) {
          // Dispatch save action directly through store
          // The AdminBottomNav component will handle the actual save
          // We can trigger it by dispatching a custom event or using the store action
          const saveEvent = new CustomEvent('admin-save-shortcut')
          window.dispatchEvent(saveEvent)
          return
        }
      }
    }
    
    // Global shortcuts (work everywhere, not just admin mode)
    // Escape key - handled by individual components, but we can add global handling here
    
    // Ctrl+K or Cmd+K for search (common pattern)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k' && !event.shiftKey) {
      // Could implement global search here
      // For now, just prevent default to avoid conflicts
      if (!isInputField) {
        event.preventDefault()
        // Future: Open search modal
      }
    }
  }

  onMounted(() => {
    // Use capture phase to catch events early
    // This ensures we can intercept before other handlers
    document.addEventListener('keydown', handleKeyDown, true)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown, true)
  })
}

