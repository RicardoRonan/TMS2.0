<template>
  <div :class="listClasses">
    <div
      v-if="title"
      class="px-4 py-2 text-sm font-medium text-text-secondary border-b border-border-primary"
    >
      {{ title }}
    </div>
    
    <ul class="list">
      <li
        v-for="(item, index) in items"
        :key="getItemKey(item, index)"
        :class="getItemClasses(item, index)"
        @click="handleItemClick(item, index)"
      >
        <div
          v-if="$slots.item"
          class="flex items-center w-full"
        >
          <slot
            name="item"
            :item="item"
            :index="index"
          />
        </div>
        <div
          v-else
          class="flex items-center justify-between w-full"
        >
          <div class="flex items-center space-x-3">
            <div
              v-if="item.icon"
              class="flex-shrink-0"
            >
              <component
                :is="item.icon"
                class="h-5 w-5 text-text-tertiary"
              />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-text-primary truncate">
                {{ getItemTitle(item) }}
              </p>
              <p
                v-if="getItemSubtitle(item)"
                class="text-sm text-text-secondary truncate"
              >
                {{ getItemSubtitle(item) }}
              </p>
            </div>
          </div>
          <div
            v-if="item.badge"
            class="flex-shrink-0"
          >
            <span class="badge badge-secondary">{{ item.badge }}</span>
          </div>
        </div>
      </li>
    </ul>
    
    <div
      v-if="emptyText && items.length === 0"
      class="px-4 py-8 text-center text-text-tertiary"
    >
      {{ emptyText }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ListItem {
  id?: string | number
  title?: string
  subtitle?: string
  icon?: any
  badge?: string
  active?: boolean
  disabled?: boolean
  [key: string]: any
}

interface Props {
  items: ListItem[]
  title?: string
  emptyText?: string
  selectable?: boolean
  keyField?: string
  titleField?: string
  subtitleField?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
  keyField: 'id',
  titleField: 'title',
  subtitleField: 'subtitle'
})

const emit = defineEmits<{
  'item-click': [item: ListItem, index: number]
  'item-select': [item: ListItem, index: number]
}>()

const listClasses = computed(() => [
  'bg-bg-secondary rounded-lg border border-border-primary overflow-hidden',
  {
    'cursor-pointer': props.selectable
  }
])

const getItemKey = (item: ListItem, index: number): string | number => {
  return item[props.keyField] || index
}

const getItemTitle = (item: ListItem): string => {
  return item[props.titleField] || ''
}

const getItemSubtitle = (item: ListItem): string => {
  return item[props.subtitleField] || ''
}

const getItemClasses = (item: ListItem, index: number) => [
  'list-item',
  {
    'list-item-active': item.active,
    'opacity-50 cursor-not-allowed': item.disabled
  }
]

const handleItemClick = (item: ListItem, index: number) => {
  if (item.disabled) return
  
  emit('item-click', item, index)
  
  if (props.selectable) {
    emit('item-select', item, index)
  }
}
</script>

