# Admin Mode Editing Guide

This guide explains how to add editing functionality to pages when admin mode is enabled.

## Quick Start

1. **Enable Admin Mode**: Go to your Profile page and toggle "Admin Mode" ON (only visible to admins)
2. **Edit Content**: When admin mode is active, you'll see edit buttons on editable content
3. **Save Changes**: Use the bottom navigation bar to save all changes or cancel them

## How to Make Content Editable

### Method 1: Using AdminEditOverlay (Recommended)

Wrap any content you want to make editable with the `AdminEditOverlay` component:

```vue
<template>
  <AdminEditOverlay edit-title="Edit Hero Title" @edit="editHeroTitle">
    <h1>{{ heroTitle }}</h1>
  </AdminEditOverlay>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'
import AdminEditOverlay from '../components/AdminEditOverlay.vue'

const { recordEdit } = useAdminMode()
const heroTitle = ref('Build the Future with MetaStack')

const editHeroTitle = () => {
  const newTitle = prompt('Enter new title:', heroTitle.value)
  if (newTitle && newTitle !== heroTitle.value) {
    const oldValue = heroTitle.value
    heroTitle.value = newTitle
    // Record the edit for undo/redo and saving
    recordEdit('content', 'hero-title', 'title', oldValue, newTitle)
  }
}
</script>
```

### Method 2: Inline Editing with Input Fields

For a better UX, you can make content directly editable:

```vue
<template>
  <div class="relative group">
    <!-- Show input when in admin mode, otherwise show text -->
    <input
      v-if="canEdit"
      v-model="editableTitle"
      @blur="saveTitle"
      @keyup.enter="saveTitle"
      class="w-full bg-transparent border-2 border-primary-500 rounded px-2 py-1"
    />
    <h1 v-else>{{ heroTitle }}</h1>
    
    <!-- Edit button (only shows in admin mode) -->
    <AdminEditButton v-if="canEdit && !isEditing" @click="startEditing" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'
import AdminEditButton from '../components/AdminEditButton.vue'

const { canEdit, recordEdit } = useAdminMode()
const heroTitle = ref('Build the Future with MetaStack')
const editableTitle = ref('')
const isEditing = ref(false)

const startEditing = () => {
  editableTitle.value = heroTitle.value
  isEditing.value = true
}

const saveTitle = () => {
  if (editableTitle.value !== heroTitle.value) {
    const oldValue = heroTitle.value
    heroTitle.value = editableTitle.value
    recordEdit('content', 'hero-title', 'title', oldValue, editableTitle.value)
  }
  isEditing.value = false
}
</script>
```

### Method 3: Editing Database Content (Blogs, Tutorials, etc.)

For content stored in the database, you need to:
1. Load the content from Supabase
2. Make it editable
3. Record edits
4. Save will batch all changes to the database

```vue
<template>
  <AdminEditOverlay edit-title="Edit Blog Post" @edit="openEditModal">
    <div>
      <h1>{{ blogPost.title }}</h1>
      <p>{{ blogPost.content }}</p>
    </div>
  </AdminEditOverlay>
  
  <!-- Edit Modal -->
  <HIGModal v-model:is-open="showEditModal" title="Edit Blog Post">
    <div class="space-y-4">
      <HIGInput
        v-model="editForm.title"
        label="Title"
        @input="handleTitleChange"
      />
      <textarea
        v-model="editForm.content"
        @input="handleContentChange"
        class="w-full"
      />
    </div>
  </HIGModal>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'
import { supabase } from '../supabase'
import AdminEditOverlay from '../components/AdminEditOverlay.vue'

const { recordEdit } = useAdminMode()
const blogPost = ref({ id: null, title: '', content: '' })
const showEditModal = ref(false)
const editForm = ref({ title: '', content: '' })

onMounted(async () => {
  // Load blog post from database
  const { data } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', 'your-slug')
    .single()
  
  if (data) {
    blogPost.value = data
    editForm.value = { title: data.title, content: data.content }
  }
})

const openEditModal = () => {
  showEditModal.value = true
}

const handleTitleChange = () => {
  if (blogPost.value.id) {
    recordEdit(
      'blog',
      blogPost.value.id.toString(),
      'title',
      blogPost.value.title,
      editForm.value.title
    )
    blogPost.value.title = editForm.value.title
  }
}

const handleContentChange = () => {
  if (blogPost.value.id) {
    recordEdit(
      'blog',
      blogPost.value.id.toString(),
      'content',
      blogPost.value.content,
      editForm.value.content
    )
    blogPost.value.content = editForm.value.content
  }
}
</script>
```

## recordEdit Function Parameters

The `recordEdit` function signature:
```typescript
recordEdit(
  type: string,        // Entity type: 'blog', 'tutorial', 'content', 'page', etc.
  entityId: string,   // Unique ID of the entity being edited
  field: string,      // Field name: 'title', 'content', 'description', etc.
  oldValue: any,      // Previous value
  newValue: any       // New value
)
```

## Entity Types

Use these entity types for different content:
- `'blog'` - Blog posts (table: `blogs`)
- `'tutorial'` - Tutorial categories (table: `tutorials_category`)
- `'tutorialPage'` - Tutorial pages (table: `tutorial_pages`)
- `'tool'` - Tools (table: `tools`)
- `'content'` - Static page content (not in database, just for tracking)
- `'page'` - Generic pages

## Example: Making Home Page Editable

Here's a complete example for the Home page:

```vue
<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="relative bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary py-20 lg:py-32">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto text-center">
          <AdminEditOverlay edit-title="Edit Hero Title" @edit="editHeroTitle">
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary mb-6 leading-tight">
              {{ heroTitle }}
              <span class="text-primary-500">{{ heroSubtitle }}</span>
            </h1>
          </AdminEditOverlay>
          
          <AdminEditOverlay edit-title="Edit Hero Description" @edit="editHeroDescription">
            <p class="text-xl md:text-2xl text-text-secondary mb-8 leading-relaxed">
              {{ heroDescription }}
            </p>
          </AdminEditOverlay>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAdminMode } from '../composables/useAdminMode'
import AdminEditOverlay from '../components/AdminEditOverlay.vue'

const { recordEdit } = useAdminMode()

// Content state
const heroTitle = ref('Build the Future with')
const heroSubtitle = ref('MetaStack')
const heroDescription = ref('A digital community platform for developers, designers, and creators...')

// Edit handlers
const editHeroTitle = () => {
  const newTitle = prompt('Enter new title:', heroTitle.value)
  if (newTitle && newTitle !== heroTitle.value) {
    const oldValue = heroTitle.value
    heroTitle.value = newTitle
    recordEdit('content', 'home-hero-title', 'title', oldValue, newTitle)
  }
}

const editHeroDescription = () => {
  const newDesc = prompt('Enter new description:', heroDescription.value)
  if (newDesc && newDesc !== heroDescription.value) {
    const oldValue = heroDescription.value
    heroDescription.value = newDesc
    recordEdit('content', 'home-hero-description', 'description', oldValue, newDesc)
  }
}
</script>
```

## Saving Changes

When you're done editing:
1. **Save**: Click the "Save" button in the bottom navigation bar
   - All changes are batched and saved to the database
   - Pending changes are cleared
   - Edit history is reset

2. **Cancel**: Click the "Cancel" button to discard all changes
   - Confirmation dialog will appear
   - All changes are reverted
   - Edit history is cleared

3. **Undo/Redo**: 
   - Use the buttons in the bottom nav, or
   - Press `Ctrl+Z` to undo, `Ctrl+R` to redo

## Best Practices

1. **Use unique entity IDs**: Make sure each editable piece of content has a unique ID
2. **Group related edits**: Use the same entity ID for related fields (e.g., blog post title and content)
3. **Save frequently**: Don't wait too long before saving to avoid data loss
4. **Test thoroughly**: Always test your edits before deploying

## Troubleshooting

**Edit button not showing?**
- Make sure admin mode is enabled in your Profile page
- Check that you're logged in as an admin user
- Verify the `canEdit` computed property is true

**Changes not saving?**
- Check browser console for errors
- Verify the entity type and table name match
- Ensure you have admin permissions in Supabase RLS policies

**Undo/Redo not working?**
- Make sure you're using `recordEdit` for all changes
- Check that changes are being recorded in the Vuex store

