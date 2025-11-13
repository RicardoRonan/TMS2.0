/**
 * Utility functions for change tracking and batching
 */

export interface PendingChange {
  type: string
  entityId: string
  changes: Record<string, { oldValue: any; newValue: any }>
}

/**
 * Groups pending changes by entity type and ID for efficient batch updates
 */
export function groupChangesByEntity(pendingChanges: Record<string, PendingChange>) {
  const grouped: Record<string, Record<string, PendingChange>> = {}
  
  Object.values(pendingChanges).forEach(change => {
    if (!grouped[change.type]) {
      grouped[change.type] = {}
    }
    grouped[change.type][change.entityId] = change
  })
  
  return grouped
}

/**
 * Creates update payload for a single entity from its pending changes
 */
export function createUpdatePayload(change: PendingChange) {
  const payload: Record<string, any> = {}
  
  Object.entries(change.changes).forEach(([field, { newValue }]) => {
    payload[field] = newValue
  })
  
  return payload
}

/**
 * Gets the table name for a given entity type
 */
export function getTableName(type: string): string {
  const typeMap: Record<string, string> = {
    blog: 'blogs',
    blogs: 'blogs',
    tutorial: 'tutorials_category',
    tutorials: 'tutorials_category',
    tutorialPage: 'tutorial_pages',
    tutorialPages: 'tutorial_pages',
    tool: 'tools',
    tools: 'tools',
    page: 'pages',
    pages: 'pages',
    content: 'content',
    user: 'users',
    users: 'users'
  }
  
  return typeMap[type] || type
}

/**
 * Gets the ID field name for a given entity type
 */
export function getIdField(type: string): string {
  const idFieldMap: Record<string, string> = {
    blog: 'id',
    blogs: 'id',
    tutorial: 'category_id',
    tutorials: 'category_id',
    tutorialPage: 'id',
    tutorialPages: 'id',
    tool: 'id',
    tools: 'id',
    page: 'id',
    pages: 'id',
    content: 'id',
    user: 'id',
    users: 'id'
  }
  
  return idFieldMap[type] || 'id'
}

