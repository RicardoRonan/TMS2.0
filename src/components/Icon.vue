<template>
  <FontAwesomeIcon 
    v-if="iconDefinition"
    :icon="iconDefinition"
    :class="iconClasses"
    :style="iconStyle"
  />
  <span v-else class="icon-placeholder" :style="{ width: size, height: size }"></span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { getIconMapping } from '../utils/iconMap'

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

const mapping = computed(() => getIconMapping(props.name))
const iconDefinition = computed(() => mapping.value?.icon || null)

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
