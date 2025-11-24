<template>
  <nav class="mb-6 mt-4">
    <div class="flex items-center space-x-2 text-sm text-text-tertiary">
      <template v-for="(item, index) in items" :key="index">
        <router-link
          v-if="item.to && !item.onClick"
          :to="item.to"
          class="hover:text-primary-500 transition-colors cursor-pointer"
        >
          {{ item.label }}
        </router-link>
        <a
          v-else-if="item.to && item.onClick"
          @click.prevent="item.onClick"
          class="hover:text-primary-500 transition-colors cursor-pointer"
        >
          {{ item.label }}
        </a>
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
  onClick?: () => void
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

