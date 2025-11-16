<template>
  <div 
    v-if="headings.length > 0 && isContentVisible"
    class="scroll-indicator fixed right-4 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col items-center"
    :style="{ 
      maxHeight: `${maxContainerHeight}px`
    }"
  >
    <div class="bg-bg-secondary border border-border-primary rounded-lg p-2 flex flex-col items-center shadow-lg relative">
      <!-- Up Arrow -->
      <button
        v-if="needsScrolling"
        @click="scrollUp"
        :disabled="!canScrollUp"
        :class="[
          'w-6 h-6 flex items-center justify-center transition-colors mb-1',
          canScrollUp 
            ? 'text-text-tertiary hover:text-primary-500 cursor-pointer' 
            : 'text-text-tertiary/30 cursor-not-allowed'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      
      <!-- Scrollable container for headings -->
      <div 
        ref="scrollContainerRef"
        class="scroll-container flex flex-col items-center gap-1.5 overflow-y-auto"
        :style="{ 
          maxHeight: `${scrollContainerHeight}px`,
          width: '16px'
        }"
      >
        <!-- Horizontal lines for each heading -->
        <button
          v-for="heading in headings"
          :key="heading.id"
          :class="[
            'w-full h-1.5 rounded-full transition-all cursor-pointer relative group',
            activeHeadingId === heading.id 
              ? 'bg-primary-500 h-2' 
              : 'bg-text-tertiary hover:bg-primary-400 hover:h-2'
          ]"
          @click="scrollToHeading(heading.id)"
          @mouseenter="hoveredHeading = heading"
          @mouseleave="hoveredHeading = null"
        />
      </div>
      
      <!-- Down Arrow -->
      <button
        v-if="needsScrolling"
        @click="scrollDown"
        :disabled="!canScrollDown"
        :class="[
          'w-6 h-6 flex items-center justify-center transition-colors mt-1',
          canScrollDown 
            ? 'text-text-tertiary hover:text-primary-500 cursor-pointer' 
            : 'text-text-tertiary/30 cursor-not-allowed'
        ]"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <!-- Tooltip - positioned outside scroll container -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 translate-x-2"
        enter-to-class="opacity-100 translate-x-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-x-0"
        leave-to-class="opacity-0 translate-x-2"
      >
        <div
          v-if="hoveredHeading"
          class="absolute right-full mr-4 top-1/2 -translate-y-1/2 px-3 py-2 bg-bg-secondary border border-border-primary rounded-lg shadow-xl text-sm font-medium text-text-primary whitespace-nowrap pointer-events-none z-50"
          :style="{ 
            maxWidth: '250px',
            top: hoveredHeadingPosition + '%'
          }"
        >
          {{ hoveredHeading.text }}
          <!-- Arrow pointing to indicator -->
          <div class="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-border-primary" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'

interface Heading {
  id: string
  text: string
  element: HTMLElement
  level: number
}

interface Props {
  contentRef?: HTMLElement | null
  contentSelector?: string
}

const props = withDefaults(defineProps<Props>(), {
  contentSelector: '.markdown-content'
})

const headings = ref<Heading[]>([])
const activeHeadingId = ref<string | null>(null)
const hoveredHeading = ref<Heading | null>(null)
const scrollContainerRef = ref<HTMLElement | null>(null)
const maxContainerHeight = ref(600) // Max height of the entire container
const scrollContainerHeight = ref(500) // Height of the scrollable area
const needsScrolling = ref(false)
const scrollPosition = ref(0)
const isContentVisible = ref(false)
const hoveredHeadingPosition = ref(50) // Position for tooltip

// Calculate if we can scroll up or down
const canScrollUp = computed(() => {
  if (!scrollContainerRef.value || !needsScrolling.value) return false
  // Use scrollPosition ref to ensure reactivity
  return scrollPosition.value > 0
})

const canScrollDown = computed(() => {
  if (!scrollContainerRef.value || !needsScrolling.value) return false
  const container = scrollContainerRef.value
  return scrollPosition.value < container.scrollHeight - container.clientHeight - 1
})

// Extract headings from the content
const extractHeadings = () => {
  const contentElement = props.contentRef || document.querySelector(props.contentSelector)
  if (!contentElement) return []

  const headingElements = contentElement.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const extracted: Heading[] = []

  headingElements.forEach((element, index) => {
    const htmlElement = element as HTMLElement
    const text = htmlElement.textContent?.trim() || ''
    
    // Generate or use existing ID
    let id = htmlElement.id
    if (!id) {
      // Create a slug from the heading text
      id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      htmlElement.id = id
    }

    // Get heading level (1-6)
    const level = parseInt(htmlElement.tagName.charAt(1))

    extracted.push({
      id,
      text,
      element: htmlElement,
      level
    })
  })

  return extracted
}

// Update container height based on viewport
const updateContainerHeight = () => {
  const viewportHeight = window.innerHeight
  maxContainerHeight.value = Math.min(viewportHeight * 0.8, 600)
  scrollContainerHeight.value = maxContainerHeight.value - 60 // Account for arrows and padding
  
  // Check if scrolling is needed
  nextTick(() => {
    if (scrollContainerRef.value) {
      const container = scrollContainerRef.value
      needsScrolling.value = container.scrollHeight > container.clientHeight
      // Initialize scroll position
      scrollPosition.value = container.scrollTop
    }
  })
}

// Check if content is visible in viewport
const checkContentVisibility = () => {
  const contentElement = props.contentRef || document.querySelector(props.contentSelector)
  if (!contentElement) {
    isContentVisible.value = false
    return
  }

  const rect = contentElement.getBoundingClientRect()
  // Content is visible if it's in the viewport (even partially)
  isContentVisible.value = rect.top < window.innerHeight && rect.bottom > 0
}

// Track active heading based on scroll position
const updateActiveHeading = () => {
  if (headings.value.length === 0) return

  const contentElement = props.contentRef || document.querySelector(props.contentSelector)
  if (!contentElement) return

  const scrollPosition = window.scrollY + window.innerHeight / 3 // Trigger point at 1/3 from top

  // Find the heading that's currently in view
  let activeHeading: Heading | null = null
  
  for (let i = headings.value.length - 1; i >= 0; i--) {
    const heading = headings.value[i]
    const headingTop = heading.element.getBoundingClientRect().top + window.scrollY
    
    if (headingTop <= scrollPosition) {
      activeHeading = heading
      break
    }
  }

  // If no heading found, use the first one
  if (!activeHeading && headings.value.length > 0) {
    activeHeading = headings.value[0]
  }

  activeHeadingId.value = activeHeading?.id || null
  
  // Auto-scroll the indicator to show the active heading
  scrollToActiveHeading()
  
  // Update tooltip position when hovering
  updateTooltipPosition()
}

// Scroll indicator container to show active heading
const scrollToActiveHeading = () => {
  if (!scrollContainerRef.value || !activeHeadingId.value || !needsScrolling.value) return
  
  const activeIndex = headings.value.findIndex(h => h.id === activeHeadingId.value)
  if (activeIndex === -1) return
  
  const container = scrollContainerRef.value
  const itemHeight = 12 // Height of each line + gap (h-1.5 + gap-1.5 = ~12px)
  const targetScroll = activeIndex * itemHeight - (container.clientHeight / 2) + (itemHeight / 2)
  
  container.scrollTo({
    top: Math.max(0, Math.min(targetScroll, container.scrollHeight - container.clientHeight)),
    behavior: 'smooth'
  })
}

// Scroll to a specific heading
const scrollToHeading = (headingId: string) => {
  const heading = headings.value.find(h => h.id === headingId)
  if (!heading) return

  // Get navbar height (h-16 = 64px)
  const navbarHeight = 64
  const headingRect = heading.element.getBoundingClientRect()
  const headingTop = headingRect.top + window.scrollY
  
  // Calculate target scroll position with navbar offset
  const targetScroll = headingTop - navbarHeight - 16 // 16px extra padding

  // Smooth scroll to the target position
  window.scrollTo({
    top: Math.max(0, targetScroll),
    behavior: 'smooth'
  })
}

// Scroll indicator container up
const scrollUp = () => {
  if (!scrollContainerRef.value || !canScrollUp.value) return
  const container = scrollContainerRef.value
  const scrollAmount = 80 // Scroll by 80px (about 10 items)
  container.scrollBy({
    top: -scrollAmount,
    behavior: 'smooth'
  })
}

// Scroll indicator container down
const scrollDown = () => {
  if (!scrollContainerRef.value || !canScrollDown.value) return
  const container = scrollContainerRef.value
  const scrollAmount = 80 // Scroll by 80px (about 10 items)
  container.scrollBy({
    top: scrollAmount,
    behavior: 'smooth'
  })
}

// Update tooltip position based on hovered heading
const updateTooltipPosition = () => {
  if (!hoveredHeading.value || !scrollContainerRef.value) {
    return
  }
  
  const headingIndex = headings.value.findIndex(h => h.id === hoveredHeading.value?.id)
  if (headingIndex === -1) return
  
  const container = scrollContainerRef.value
  const itemHeight = 12 // Height of each line + gap
  const headingTop = headingIndex * itemHeight
  const containerHeight = container.clientHeight
  const scrollTop = container.scrollTop
  
  // Calculate position relative to container (0-100%)
  const relativePosition = ((headingTop - scrollTop + itemHeight / 2) / containerHeight) * 100
  hoveredHeadingPosition.value = Math.max(10, Math.min(90, relativePosition))
}

// Handle scroll events
const handleScroll = () => {
  checkContentVisibility()
  updateActiveHeading()
}

// Handle resize events
const handleResize = () => {
  updateContainerHeight()
  checkContentVisibility()
  updateActiveHeading()
}

// Handle scroll events on the indicator container
const handleContainerScroll = () => {
  // This will trigger computed properties to update
  // Force reactivity update
  if (scrollContainerRef.value) {
    scrollPosition.value = scrollContainerRef.value.scrollTop
  }
  // Update tooltip position when container scrolls
  if (hoveredHeading.value) {
    updateTooltipPosition()
  }
}

// Initialize headings and positions
const initialize = async () => {
  await nextTick()
  headings.value = extractHeadings()
  
  if (headings.value.length > 0) {
    updateContainerHeight()
    checkContentVisibility()
    updateActiveHeading()
  }
}

// Watch for content changes
watch(() => props.contentRef, () => {
  initialize()
}, { immediate: true })

// Watch for hovered heading changes to update tooltip position
watch(() => hoveredHeading.value, () => {
  if (hoveredHeading.value) {
    nextTick(() => {
      updateTooltipPosition()
    })
  }
})

// Watch for content element changes (when markdown is updated)
const observeContentChanges = () => {
  const contentElement = props.contentRef || document.querySelector(props.contentSelector)
  if (!contentElement) return

  // Use MutationObserver to detect when headings are added/removed
  const observer = new MutationObserver(() => {
    // Debounce the initialization
    clearTimeout((window as any).__scrollIndicatorTimeout)
    ;(window as any).__scrollIndicatorTimeout = setTimeout(() => {
      initialize()
    }, 100)
  })

  observer.observe(contentElement, {
    childList: true,
    subtree: true
  })

  return observer
}

let contentObserver: MutationObserver | null = null

onMounted(() => {
  initialize()
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleResize)
  
  // Add scroll listener to container
  nextTick(() => {
    if (scrollContainerRef.value) {
      scrollContainerRef.value.addEventListener('scroll', handleContainerScroll, { passive: true })
    }
    contentObserver = observeContentChanges()
    // Initial visibility check
    checkContentVisibility()
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleResize)
  if (scrollContainerRef.value) {
    scrollContainerRef.value.removeEventListener('scroll', handleContainerScroll)
  }
  if (contentObserver) {
    contentObserver.disconnect()
  }
  if ((window as any).__scrollIndicatorTimeout) {
    clearTimeout((window as any).__scrollIndicatorTimeout)
  }
})
</script>

<style scoped>
.scroll-container {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>