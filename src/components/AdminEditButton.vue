<template>
  <button
    v-if="canEdit"
    class="admin-edit-button absolute top-2 right-2 z-10 p-2 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors opacity-0 group-hover:opacity-100"
    :title="title || 'Edit'"
    @click.stop="$emit('click')"
  >
    <Icon
      name="edit"
      :size="16"
    />
  </button>
</template>

<script setup lang="ts">
import { useAdminMode } from '../composables/useAdminMode'
import Icon from './Icon.vue'

interface Props {
  title?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Edit'
})

defineEmits<{
  click: []
}>()

const { canEdit } = useAdminMode()
</script>

<style scoped>
.admin-edit-button {
  transition: opacity 0.2s ease;
}
</style>

