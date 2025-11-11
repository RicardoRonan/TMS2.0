<template>
  <div class="n8n-workflow-viewer" ref="containerRef">
    <!-- Controls -->
    <div class="workflow-controls">
      <button 
        @click="resetView" 
        class="control-btn"
        title="Reset View"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
      <button 
        @click="zoomIn" 
        class="control-btn"
        title="Zoom In"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
        </svg>
      </button>
      <button 
        @click="zoomOut" 
        class="control-btn"
        title="Zoom Out"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
        </svg>
      </button>
      <div class="zoom-level">{{ Math.round(zoom * 100) }}%</div>
    </div>

    <!-- SVG Container -->
    <div 
      class="workflow-svg-container"
      @wheel.prevent="handleWheel"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    >
      <svg 
        :width="svgWidth" 
        :height="svgHeight"
        class="workflow-svg"
        :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoom})` }"
      >
        <!-- Grid Background -->
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-border-primary)" stroke-width="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        <!-- Connections -->
        <g class="connections">
          <path
            v-for="(connection, index) in connections"
            :key="`connection-${index}`"
            :d="connection.path"
            class="connection-line"
            :stroke-width="2"
            fill="none"
            marker-end="url(#arrowhead)"
          />
        </g>

        <!-- Nodes -->
        <g class="nodes">
          <g
            v-for="node in nodes"
            :key="node.id"
            :transform="`translate(${node.position[0]}, ${node.position[1]})`"
            class="node-group"
            @mousedown.stop="startNodeDrag(node, $event)"
          >
            <!-- Node Rectangle -->
            <rect
              :width="nodeWidth"
              :height="nodeHeight"
              :class="['node-rect', getNodeTypeClass(node.type)]"
              rx="8"
              :fill="getNodeColor(node.type)"
              :stroke="selectedNode?.id === node.id ? 'var(--color-primary-500)' : 'var(--color-border-primary)'"
              :stroke-width="selectedNode?.id === node.id ? 2 : 1"
            />
            
            <!-- Node Icon -->
            <text
              x="20"
              y="30"
              class="node-icon"
              font-size="16"
            >
              {{ getNodeIcon(node.type) }}
            </text>

            <!-- Node Name -->
            <text
              x="50"
              y="25"
              class="node-name"
              font-size="14"
              font-weight="600"
            >
              {{ node.name }}
            </text>

            <!-- Node Type -->
            <text
              x="50"
              y="42"
              class="node-type"
              font-size="11"
            >
              {{ getNodeTypeLabel(node.type) }}
            </text>

            <!-- Output Connector -->
            <circle
              :cx="nodeWidth - 8"
              :cy="nodeHeight / 2"
              r="6"
              class="connector output-connector"
              @mousedown.stop="startConnection(node, $event)"
            />

            <!-- Input Connector (if not trigger) -->
            <circle
              v-if="!isTriggerNode(node.type)"
              cx="8"
              :cy="nodeHeight / 2"
              r="6"
              class="connector input-connector"
            />
          </g>
        </g>

        <!-- Arrow Marker -->
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="var(--color-primary-500)"
            />
          </marker>
        </defs>
      </svg>
    </div>

    <!-- Node Details Panel -->
    <div v-if="selectedNode" class="node-details-panel">
      <div class="panel-header">
        <h3>{{ selectedNode.name }}</h3>
        <button @click="selectedNode = null" class="close-btn">×</button>
      </div>
      <div class="panel-content">
        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">{{ getNodeTypeLabel(selectedNode.type) }}</span>
        </div>
        <div v-if="selectedNode.parameters" class="detail-row">
          <span class="detail-label">Parameters:</span>
          <pre class="detail-value">{{ JSON.stringify(selectedNode.parameters, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface N8nNode {
  id: string
  name: string
  type: string
  position: [number, number]
  parameters?: Record<string, any>
}

interface N8nWorkflow {
  name: string
  nodes: N8nNode[]
  connections: Record<string, any>
}

interface Props {
  workflow: N8nWorkflow | string
  width?: number
  height?: number
}

const props = withDefaults(defineProps<Props>(), {
  width: 800,
  height: 600
})

const containerRef = ref<HTMLElement | null>(null)
const svgWidth = ref(props.width)
const svgHeight = ref(props.height)

// Pan and Zoom
const panX = ref(0)
const panY = ref(0)
const zoom = ref(1)
const isPanning = ref(false)
const startPanX = ref(0)
const startPanY = ref(0)
const mouseStartX = ref(0)
const mouseStartY = ref(0)

// Node dragging
const isDragging = ref(false)
const draggedNode = ref<N8nNode | null>(null)
const selectedNode = ref<N8nNode | null>(null)

// Node dimensions
const nodeWidth = 200
const nodeHeight = 80

// Parse workflow
const workflowData = computed(() => {
  if (typeof props.workflow === 'string') {
    try {
      return JSON.parse(props.workflow) as N8nWorkflow
    } catch {
      return null
    }
  }
  return props.workflow
})

const nodes = computed(() => {
  if (!workflowData.value) return []
  return workflowData.value.nodes || []
})

// Calculate connections
const connections = computed(() => {
  if (!workflowData.value?.connections) return []
  
  const conns: Array<{ path: string }> = []
  const connections = workflowData.value.connections

  Object.keys(connections).forEach((nodeName) => {
    const nodeConnections = connections[nodeName]
    if (nodeConnections.main) {
      nodeConnections.main.forEach((outputs: any[]) => {
        outputs.forEach((output: any) => {
          const sourceNode = nodes.value.find(n => n.name === nodeName)
          const targetNode = nodes.value.find(n => n.name === output.node)
          
          if (sourceNode && targetNode) {
            const sourceX = sourceNode.position[0] + nodeWidth - 8
            const sourceY = sourceNode.position[1] + nodeHeight / 2
            const targetX = targetNode.position[0] + 8
            const targetY = targetNode.position[1] + nodeHeight / 2
            
            // Create curved path
            const midX = (sourceX + targetX) / 2
            const path = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX} ${targetY}`
            conns.push({ path })
          }
        })
      })
    }
  })

  return conns
})

// Node type helpers
const isTriggerNode = (type: string) => {
  return type.includes('trigger') || type.includes('webhook') || type.includes('schedule')
}

const getNodeTypeClass = (type: string) => {
  if (isTriggerNode(type)) return 'node-trigger'
  if (type.includes('http')) return 'node-http'
  if (type.includes('email')) return 'node-email'
  if (type.includes('code') || type.includes('function')) return 'node-code'
  return 'node-default'
}

const getNodeColor = (type: string) => {
  if (isTriggerNode(type)) return 'var(--color-primary-500)'
  if (type.includes('http')) return 'var(--color-info)'
  if (type.includes('email')) return 'var(--color-success)'
  if (type.includes('code') || type.includes('function')) return 'var(--color-warning)'
  return 'var(--color-bg-tertiary)'
}

const getNodeIcon = (type: string) => {
  if (isTriggerNode(type)) return '⚡'
  if (type.includes('http')) return '🌐'
  if (type.includes('email')) return '📧'
  if (type.includes('code') || type.includes('function')) return '⚙️'
  if (type.includes('slack')) return '💬'
  if (type.includes('google')) return '🔍'
  return '📦'
}

const getNodeTypeLabel = (type: string) => {
  const parts = type.split('.')
  return parts[parts.length - 1] || type
}

// Pan and Zoom handlers
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  zoom.value = Math.max(0.5, Math.min(2, zoom.value * delta))
}

const handleMouseDown = (e: MouseEvent) => {
  if (e.button === 0) { // Left mouse button
    isPanning.value = true
    mouseStartX.value = e.clientX
    mouseStartY.value = e.clientY
    startPanX.value = panX.value
    startPanY.value = panY.value
  }
}

const handleMouseMove = (e: MouseEvent) => {
  if (isPanning.value && !isDragging.value) {
    const dx = e.clientX - mouseStartX.value
    const dy = e.clientY - mouseStartY.value
    panX.value = startPanX.value + dx
    panY.value = startPanY.value + dy
  } else if (isDragging.value && draggedNode.value) {
    const container = containerRef.value?.querySelector('.workflow-svg-container')
    if (container) {
      const rect = container.getBoundingClientRect()
      const x = (e.clientX - rect.left - panX.value) / zoom.value
      const y = (e.clientY - rect.top - panY.value) / zoom.value
      draggedNode.value.position[0] = Math.max(0, x - nodeWidth / 2)
      draggedNode.value.position[1] = Math.max(0, y - nodeHeight / 2)
    }
  }
}

const handleMouseUp = () => {
  isPanning.value = false
  isDragging.value = false
  draggedNode.value = null
}

const startNodeDrag = (node: N8nNode, e: MouseEvent) => {
  e.preventDefault()
  isDragging.value = true
  draggedNode.value = node
  selectedNode.value = node
  mouseStartX.value = e.clientX
  mouseStartY.value = e.clientY
}

const startConnection = (node: N8nNode, e: MouseEvent) => {
  e.stopPropagation()
  // Connection logic can be added here
}

const zoomIn = () => {
  zoom.value = Math.min(2, zoom.value * 1.2)
}

const zoomOut = () => {
  zoom.value = Math.max(0.5, zoom.value * 0.8)
}

const resetView = () => {
  zoom.value = 1
  panX.value = 0
  panY.value = 0
}

// Update dimensions on mount
onMounted(() => {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect()
    svgWidth.value = Math.max(props.width, rect.width - 40)
    svgHeight.value = Math.max(props.height, 400)
  }
})
</script>

<style scoped>
.n8n-workflow-viewer {
  @apply relative w-full bg-bg-secondary rounded-lg border border-border-primary overflow-hidden;
  min-height: 400px;
}

.workflow-controls {
  @apply absolute top-4 right-4 z-10 flex items-center gap-2 bg-bg-elevated rounded-lg p-2 border border-border-primary shadow-lg;
}

.control-btn {
  @apply p-2 rounded hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.zoom-level {
  @apply px-2 text-sm text-text-secondary font-mono;
  min-width: 50px;
  text-align: center;
}

.workflow-svg-container {
  @apply w-full overflow-hidden cursor-grab active:cursor-grabbing;
  height: 600px;
  position: relative;
}

.workflow-svg {
  @apply absolute top-0 left-0;
  transform-origin: 0 0;
}

.connection-line {
  stroke: var(--color-primary-500);
  opacity: 0.6;
}

.node-group {
  cursor: move;
}

.node-rect {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: all 0.2s ease;
}

.node-group:hover .node-rect {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
  transform: translateY(-1px);
}

.node-icon {
  fill: var(--color-text-primary);
  font-size: 16px;
}

.node-name {
  fill: var(--color-text-primary);
  font-family: var(--font-family-primary);
}

.node-type {
  fill: var(--color-text-secondary);
  font-family: var(--font-family-primary);
  font-size: 11px;
}

.connector {
  fill: var(--color-bg-primary);
  stroke: var(--color-primary-500);
  stroke-width: 2;
  cursor: crosshair;
  transition: all 0.2s ease;
}

.connector:hover {
  fill: var(--color-primary-500);
  r: 8;
}

.node-details-panel {
  @apply absolute bottom-4 left-4 right-4 bg-bg-elevated border border-border-primary rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto;
}

.panel-header {
  @apply flex items-center justify-between p-4 border-b border-border-primary;
}

.panel-header h3 {
  @apply text-text-primary font-semibold;
}

.close-btn {
  @apply text-text-tertiary hover:text-text-primary text-2xl leading-none;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.panel-content {
  @apply p-4 space-y-2;
}

.detail-row {
  @apply flex flex-col gap-1;
}

.detail-label {
  @apply text-text-tertiary text-sm font-medium;
}

.detail-value {
  @apply text-text-secondary text-sm font-mono;
}

.detail-value pre {
  @apply bg-bg-tertiary p-2 rounded text-xs overflow-x-auto;
  max-height: 200px;
}

/* Responsive */
@media (max-width: 768px) {
  .workflow-svg-container {
    height: 400px;
  }
  
  .workflow-controls {
    @apply top-2 right-2;
    flex-wrap: wrap;
  }
  
  .node-details-panel {
    @apply bottom-2 left-2 right-2;
  }
}
</style>




