<template>
  <div
    v-if="isAdminMode && isAdmin"
    class="admin-bottom-nav fixed md:bottom-0 bottom-16 left-0 right-0 z-[51] bg-bg-secondary border-t border-border-primary"
  >
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between max-w-6xl mx-auto gap-2 md:gap-4">
        <!-- Left side: Undo/Redo -->
        <div class="flex items-center space-x-1 md:space-x-2">
          <HIGButton
            variant="secondary"
            size="sm"
            :disabled="!canUndo"
            @click="handleUndo"
            title="Undo (Ctrl+Z)"
            class="admin-nav-btn"
          >
            <Icon name="undo" :size="16" class="md:mr-1" />
            <span class="hidden md:inline">Undo</span>
          </HIGButton>
          <HIGButton
            variant="secondary"
            size="sm"
            :disabled="!canRedo"
            @click="handleRedo"
            title="Redo (Ctrl+R)"
            class="admin-nav-btn"
          >
            <Icon name="redo" :size="16" class="md:mr-1" />
            <span class="hidden md:inline">Redo</span>
          </HIGButton>
        </div>

        <!-- Center: Status indicator -->
        <div class="flex items-center space-x-2 text-xs md:text-sm flex-1 justify-center mx-2">
          <span
            v-if="hasPendingChanges"
            class="px-2 md:px-3 py-1 rounded-full bg-warning-500/20 text-warning-500 border border-warning-500/30 whitespace-nowrap"
          >
            <span class="hidden sm:inline">{{ Object.keys(pendingChanges).length }} change(s) pending</span>
            <span class="sm:hidden">{{ Object.keys(pendingChanges).length }}</span>
          </span>
          <span
            v-else
            class="px-2 md:px-3 py-1 rounded-full bg-success-500/20 text-success-500 border border-success-500/30 whitespace-nowrap"
          >
            <span class="hidden sm:inline">No pending changes</span>
            <span class="sm:hidden">Saved</span>
          </span>
        </div>

        <!-- Right side: Save/Cancel -->
        <div class="flex items-center space-x-1 md:space-x-2">
          <HIGButton
            variant="tertiary"
            size="sm"
            :disabled="!hasPendingChanges || saving"
            @click="handleCancel"
            title="Cancel all changes"
            class="admin-nav-btn"
          >
            <span class="hidden sm:inline">Cancel</span>
            <span class="sm:hidden">Cancel</span>
          </HIGButton>
          <HIGButton
            variant="primary"
            size="sm"
            :disabled="!hasPendingChanges || saving"
            :loading="saving"
            @click="handleSave"
            title="Save all changes"
            class="admin-nav-btn"
          >
            {{ saveButtonText }}
          </HIGButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { useAdminMode } from '../composables/useAdminMode'
import { useAuth } from '../composables/useAuth'
import HIGButton from './hig/HIGButton.vue'
import Icon from './Icon.vue'

const store = useStore()
const { user } = useAuth()
const {
  isAdminMode,
  canUndo,
  canRedo,
  hasPendingChanges,
  pendingChanges,
  undoEdit,
  redoEdit,
  saveChanges,
  cancelChanges
} = useAdminMode()

const saving = ref(false)
const isMobile = ref(false)

const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const saveButtonText = computed(() => {
  if (saving.value) {
    return isMobile.value ? '...' : 'Saving...'
  }
  return 'Save'
})

const isAdmin = computed(() => user.value?.isAdmin || false)

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

const handleCancel = async () => {
  await cancelChanges()
}

// Listen for Ctrl+S keyboard shortcut
const handleSaveShortcut = () => {
  if (hasPendingChanges.value && !saving.value) {
    handleSave()
  }
}

onMounted(() => {
  window.addEventListener('admin-save-shortcut', handleSaveShortcut)
})

onUnmounted(() => {
  window.removeEventListener('admin-save-shortcut', handleSaveShortcut)
})
</script>

<style scoped>
.admin-bottom-nav {
  /* Simple solid background, no backdrop filter */
}

.admin-nav-btn {
  min-width: auto;
}

/* Mobile: Make buttons more compact */
@media (max-width: 640px) {
  .admin-nav-btn {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
  
  .admin-bottom-nav {
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
}

/* Add padding to body when admin nav is visible to prevent content overlap */
:global(body:has(.admin-bottom-nav)) {
  padding-bottom: 60px;
}

@media (max-width: 640px) {
  :global(body:has(.admin-bottom-nav)) {
    padding-bottom: 140px; /* Account for both admin nav (64px) and mobile nav (64px) */
  }
}
</style>

