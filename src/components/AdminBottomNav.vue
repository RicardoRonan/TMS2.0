<template>
  <div
    v-if="isAdminMode && isAdmin"
    class="admin-bottom-nav fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border-primary shadow-lg"
  >
    <div class="container mx-auto px-4 py-3">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <!-- Left side: Undo/Redo -->
        <div class="flex items-center space-x-2">
          <HIGButton
            variant="secondary"
            size="sm"
            :disabled="!canUndo"
            @click="handleUndo"
            title="Undo (Ctrl+Z)"
          >
            <Icon name="undo" :size="16" class="mr-1" />
            Undo
          </HIGButton>
          <HIGButton
            variant="secondary"
            size="sm"
            :disabled="!canRedo"
            @click="handleRedo"
            title="Redo (Ctrl+R)"
          >
            <Icon name="redo" :size="16" class="mr-1" />
            Redo
          </HIGButton>
        </div>

        <!-- Center: Status indicator -->
        <div class="flex items-center space-x-2 text-sm">
          <span
            v-if="hasPendingChanges"
            class="px-3 py-1 rounded-full bg-warning-500/20 text-warning-500 border border-warning-500/30"
          >
            {{ Object.keys(pendingChanges).length }} change(s) pending
          </span>
          <span
            v-else
            class="px-3 py-1 rounded-full bg-success-500/20 text-success-500 border border-success-500/30"
          >
            No pending changes
          </span>
        </div>

        <!-- Right side: Save/Cancel -->
        <div class="flex items-center space-x-2">
          <HIGButton
            variant="tertiary"
            size="sm"
            :disabled="!hasPendingChanges || saving"
            @click="handleCancel"
            title="Cancel all changes"
          >
            Cancel
          </HIGButton>
          <HIGButton
            variant="primary"
            size="sm"
            :disabled="!hasPendingChanges || saving"
            :loading="saving"
            @click="handleSave"
            title="Save all changes"
          >
            {{ saving ? 'Saving...' : 'Save' }}
          </HIGButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
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
</script>

<style scoped>
.admin-bottom-nav {
  backdrop-filter: blur(10px);
  background-color: rgba(var(--bg-secondary-rgb), 0.95);
}

/* Add padding to body when admin nav is visible to prevent content overlap */
:global(body:has(.admin-bottom-nav)) {
  padding-bottom: 60px;
}
</style>

