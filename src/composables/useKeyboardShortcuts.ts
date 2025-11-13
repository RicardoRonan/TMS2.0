import { onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'

export function useKeyboardShortcuts() {
  const store = useStore()

  const handleKeyDown = (event: KeyboardEvent) => {
    // Only handle shortcuts when admin mode is active
    if (!store.getters.isAdminMode) return
    
    // Ctrl+Z for undo
    if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      if (store.getters.canUndo) {
        store.dispatch('undoEdit')
      }
      return
    }
    
    // Ctrl+R for redo (or Ctrl+Shift+Z)
    if ((event.ctrlKey && event.key === 'r') || (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
      event.preventDefault()
      if (store.getters.canRedo) {
        store.dispatch('redoEdit')
      }
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}

