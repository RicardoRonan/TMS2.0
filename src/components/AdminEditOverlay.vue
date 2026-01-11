<template>
  <div
    v-if="canEdit"
    class="admin-edit-overlay relative group"
    :class="overlayClass"
  >
    <slot />
    <AdminEditButton
      :title="editTitle"
      @click="$emit('edit')"
    />
  </div>
  <div v-else>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'
import AdminEditButton from './AdminEditButton.vue'

interface Props {
  editTitle?: string
  overlayClass?: string
}

withDefaults(defineProps<Props>(), {
  editTitle: 'Edit',
  overlayClass: ''
})

defineEmits<{
  edit: []
}>()

const { canEdit } = useAdminMode()
</script>

<style scoped>
.admin-edit-overlay {
  position: relative;
}

.admin-edit-overlay:hover {
  outline: 2px dashed rgba(var(--primary-500-rgb), 0.5);
  outline-offset: 2px;
}
</style>

