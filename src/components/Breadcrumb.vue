<template>
  <nav class="mb-6">
    <div class="flex items-center space-x-2 text-sm text-text-tertiary">
      <template v-for="(item, index) in items" :key="index">
        <router-link
          v-if="item.to"
          :to="item.to"
          class="hover:text-primary-500 transition-colors"
        >
          {{ item.label }}
        </router-link>
        <span v-else>{{ item.label }}</span>
        <span v-if="index < items.length - 1">/</span>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

