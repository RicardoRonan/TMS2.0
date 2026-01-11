<template>
  <FontAwesomeIcon 
    v-if="iconDefinition"
    :icon="iconDefinition"
    :class="iconClasses"
    :style="iconStyle"
  />
  <span
    v-else
    class="icon-placeholder"
    :style="{ width: size, height: size }"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { getIconAsync } from '../utils/iconMap'

interface Props {
  name: string
  size?: number | string
  class?: string
  variant?: 'line' | 'solid' | 'duo' | 'flat' | 'gradient' | 'neon' | 'pop' | 'remix'
}

const props = withDefaults(defineProps<Props>(), {
  size: 24,
  variant: 'solid'
})

const iconDefinition = ref<IconDefinition | null>(null)

// Load icon asynchronously
const loadIcon = async () => {
  try {
    const icon = await getIconAsync(props.name)
    iconDefinition.value = icon
  } catch (error) {
    console.warn(`Failed to load icon: ${props.name}`, error)
    iconDefinition.value = null
  }
}

// Load icon when component mounts or name changes
onMounted(() => {
  loadIcon()
})

watch(() => props.name, () => {
  loadIcon()
})

const iconClasses = computed(() => [
  'icon',
  props.class
])

const iconStyle = computed(() => {
  const sizeValue = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    fontSize: sizeValue,
    width: sizeValue,
    height: sizeValue
  }
})
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
  color: currentColor;
}

.icon-placeholder {
  display: inline-block;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}
</style>
