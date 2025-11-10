<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Loading State -->
    <div v-if="loading" class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <div class="animate-pulse space-y-6">
          <div class="h-12 bg-bg-tertiary rounded w-3/4"></div>
          <div class="h-4 bg-bg-tertiary rounded w-1/4"></div>
          <div class="aspect-video bg-bg-tertiary rounded-lg"></div>
          <div class="space-y-3">
            <div class="h-4 bg-bg-tertiary rounded w-full"></div>
            <div class="h-4 bg-bg-tertiary rounded w-full"></div>
            <div class="h-4 bg-bg-tertiary rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto text-center">
        <div class="w-24 h-24 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
          <Icon name="error" :size="48" class="text-text-tertiary" />
        </div>
        <h2 class="text-2xl font-bold text-text-primary mb-4">Article Not Found</h2>
        <p class="text-text-secondary mb-8">{{ error }}</p>
        <HIGButton variant="primary" @click="$router.push('/blog')">
          Back to Blog
        </HIGButton>
      </div>
    </div>

    <!-- Article Content -->
    <article v-else-if="post" class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <header class="mb-12">
          <div class="flex items-center space-x-2 text-sm text-text-tertiary mb-4">
            <router-link to="/blog" class="hover:text-primary-500 transition-colors">Blog</router-link>
            <span>/</span>
            <span>{{ post.category }}</span>
          </div>
          
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            {{ post.title }}
          </h1>
          
          <div class="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
            <div class="flex items-center space-x-2">
              <div v-if="post.authorPhotoUrl" class="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  :src="post.authorPhotoUrl" 
                  :alt="post.author"
                  class="w-full h-full object-cover"
                />
              </div>
              <div v-else class="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span class="text-white font-medium">{{ post.authorInitials }}</span>
              </div>
              <div>
                <div class="font-medium text-text-primary">{{ post.author }}</div>
                <div>{{ formatDate(post.createdAt) }}</div>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <span class="badge badge-secondary">{{ post.category }}</span>
              <span>{{ post.readTime }} min read</span>
            </div>
          </div>
        </header>

        <!-- Featured Image -->
        <div v-if="post.featuredImageUrl" class="aspect-video bg-bg-tertiary rounded-lg mb-12 overflow-hidden">
          <img 
            :src="post.featuredImageUrl" 
            :alt="post.title"
            class="w-full h-full object-cover"
          />
        </div>

        <!-- Article Content -->
        <div class="markdown-content prose prose-invert max-w-none">
          <div 
            class="text-lg text-text-secondary leading-relaxed"
            v-html="renderedContent"
          ></div>
        </div>

        <!-- Tags -->
        <div v-if="post.tags && post.tags.length" class="mt-12 pt-8 border-t border-border-primary">
          <h3 class="text-sm font-semibold text-text-primary mb-4">Tags</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="badge badge-secondary"
            >
              {{ tag }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-12 pt-8 border-t border-border-primary flex items-center justify-between">
          <HIGButton variant="secondary" @click="$router.push('/blog')">
            ← Back to Blog
          </HIGButton>
          
          <div class="flex items-center space-x-4">
            <button
              class="flex items-center space-x-2 p-2 text-text-tertiary hover:text-primary-500 transition-colors"
              :class="{ 'text-primary-500': post.isLiked }"
              :title="post.isLiked ? 'Unlike' : 'Like'"
              :disabled="isLiking"
              @click="toggleLike"
            >
              <Icon name="heart" :size="20" />
              <span class="text-sm font-medium">{{ likeCount }}</span>
            </button>
            <button
              class="p-2 text-text-tertiary hover:text-primary-500 transition-colors"
              title="Share"
              @click="sharePost"
            >
              <Icon name="share" :size="20" />
            </button>
          </div>
        </div>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, onBeforeRouteUpdate } from 'vue-router'
import { useStore } from 'vuex'
import { supabase } from '../supabase'
import HIGButton from '../components/hig/HIGButton.vue'
import Icon from '../components/Icon.vue'
import { renderMarkdown } from '../utils/markdown'
import 'highlight.js/styles/vs2015.css'

const route = useRoute()
const store = useStore()

const loading = ref(true)
const error = ref<string | null>(null)
const post = ref<any>(null)
const likeCount = ref(0)
const isLiking = ref(false)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const getInitials = (name: string | null | undefined, email: string | null | undefined) => {
  if (name) {
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  if (email) {
    return email.substring(0, 2).toUpperCase()
  }
  return 'AN'
}

const renderedContent = computed(() => {
  if (!post.value?.content) return ''
  return renderMarkdown(post.value.content)
})

const currentUser = computed(() => store.getters.currentUser)
const isAuthenticated = computed(() => store.getters.isAuthenticated)

const toggleLike = async () => {
  if (!isAuthenticated.value) {
    store.dispatch('addNotification', {
      type: 'info',
      message: 'Please sign in to like articles'
    })
    return
  }

  if (!post.value || isLiking.value) return

  try {
    isLiking.value = true
    const userId = currentUser.value?.uid

    if (!userId) {
      throw new Error('User not found')
    }

    if (post.value.isLiked) {
      // Unlike: Remove the like
      const { error: unlikeError } = await supabase
        .from('blog_likes')
        .delete()
        .eq('blog_id', post.value.id)
        .eq('user_id', userId)

      if (unlikeError) {
        // If table doesn't exist, show helpful message
        if (unlikeError.code === '42P01' || unlikeError.message?.includes('does not exist')) {
          throw new Error('Likes feature is not available yet. Please run the database migration.')
        }
        throw unlikeError
      }

      post.value.isLiked = false
      likeCount.value = Math.max(0, likeCount.value - 1)
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Removed like'
      })
    } else {
      // Like: Add the like
      const { error: likeError } = await supabase
        .from('blog_likes')
        .insert({
          blog_id: post.value.id,
          user_id: userId
        })

      if (likeError) {
        // If table doesn't exist, show helpful message
        if (likeError.code === '42P01' || likeError.message?.includes('does not exist')) {
          throw new Error('Likes feature is not available yet. Please run the database migration.')
        }
        // If it's a unique constraint error, the like already exists
        if (likeError.code !== '23505') {
          throw likeError
        }
      }

      post.value.isLiked = true
      likeCount.value += 1
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Liked this article'
      })
    }
  } catch (err: any) {
    console.error('Error toggling like:', err)
    store.dispatch('addNotification', {
      type: 'error',
      message: err.message || 'Failed to update like. Please try again.'
    })
  } finally {
    isLiking.value = false
  }
}

const sharePost = async () => {
  if (!post.value) return

  const shareData = {
    title: post.value.title,
    text: post.value.excerpt || post.value.title,
    url: window.location.href
  }

  // Try Web Share API first (mobile/desktop browsers that support it)
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Article shared successfully'
      })
      return
    } catch (err: any) {
      // User cancelled sharing or error occurred
      if (err.name !== 'AbortError') {
        console.error('Error sharing:', err)
      }
      // Fall through to clipboard fallback
    }
  }

  // Fallback: copy to clipboard
  try {
    await navigator.clipboard.writeText(window.location.href)
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Link copied to clipboard!'
    })
  } catch (err) {
    console.error('Error copying to clipboard:', err)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to copy link. Please try again.'
    })
  }
}

// Fetch blog post function
const fetchBlogPost = async (slug: string) => {
  try {
    loading.value = true
    error.value = null
    
    // Ensure Supabase session is restored before making calls
    await supabase.auth.getSession()
    
    const { data, error: fetchError } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users!author_id (
          id,
          display_name,
          email,
          photo_url
        )
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (fetchError) {
      throw fetchError
    }

    if (!data) {
      error.value = 'Article not found'
      return
    }

    const author = data.author
    const authorName = author?.display_name || author?.email?.split('@')[0] || 'Anonymous'
    const authorInitials = getInitials(author?.display_name, author?.email)

    // Check if current user has liked this post
    let userLiked = false
    let likeCountValue = 0
    const currentUserId = store.getters.currentUser?.uid
    
    try {
      if (currentUserId) {
        const { data: likeData, error: likeCheckError } = await supabase
          .from('blog_likes')
          .select('id')
          .eq('blog_id', data.id)
          .eq('user_id', currentUserId)
          .maybeSingle()
        
        // If table doesn't exist, likeCheckError will be set, but we'll continue
        if (!likeCheckError || likeCheckError.code !== 'PGRST116') {
          userLiked = !!likeData
        }
      }

      // Get like count
      const { count, error: countError } = await supabase
        .from('blog_likes')
        .select('*', { count: 'exact', head: true })
        .eq('blog_id', data.id)

      // If table doesn't exist, countError will be set, but we'll use 0
      if (!countError) {
        likeCountValue = count || 0
      }
    } catch (err) {
      // Table might not exist yet, that's okay - just use defaults
      console.log('Likes table may not exist yet:', err)
    }

    post.value = {
      id: data.id,
      title: data.title,
      excerpt: data.excerpt || '',
      content: data.content,
      category: data.category,
      slug: data.slug,
      author: authorName,
      authorInitials: authorInitials,
      authorPhotoUrl: author?.photo_url,
      createdAt: data.created_at,
      readTime: data.read_time || 5,
      featuredImageUrl: data.featured_image_url,
      tags: data.category ? [data.category] : [],
      isLiked: userLiked
    }

    likeCount.value = likeCountValue
  } catch (err: any) {
    console.error('Error fetching blog post:', err)
    error.value = err.message || 'Failed to load article. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchBlogPost(route.params.slug as string)
})

// Watch for route param changes (when navigating between blog posts)
watch(() => route.params.slug, (newSlug) => {
  if (newSlug) {
    fetchBlogPost(newSlug as string)
  }
})

// Handle navigation within the same component
onBeforeRouteUpdate((to, from, next) => {
  if (to.params.slug !== from.params.slug) {
    fetchBlogPost(to.params.slug as string)
  }
  next()
})
</script>

<style scoped>
/* Markdown Content Styles */
.markdown-content {
  @apply text-text-secondary;
}

.markdown-content :deep(h1) {
  @apply text-4xl font-bold text-text-primary mt-8 mb-4;
}

.markdown-content :deep(h2) {
  @apply text-3xl font-bold text-text-primary mt-6 mb-3;
}

.markdown-content :deep(h3) {
  @apply text-2xl font-semibold text-text-primary mt-5 mb-2;
}

.markdown-content :deep(h4) {
  @apply text-xl font-semibold text-text-primary mt-4 mb-2;
}

.markdown-content :deep(h5) {
  @apply text-lg font-semibold text-text-primary mt-3 mb-2;
}

.markdown-content :deep(h6) {
  @apply text-base font-semibold text-text-primary mt-3 mb-2;
}

.markdown-content :deep(p) {
  @apply mb-4 leading-relaxed;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  @apply mb-4 ml-6;
}

.markdown-content :deep(ul) {
  @apply list-disc;
}

.markdown-content :deep(ol) {
  @apply list-decimal;
}

.markdown-content :deep(li) {
  @apply mb-2;
}

.markdown-content :deep(li > p) {
  @apply mb-2;
}

.markdown-content :deep(blockquote) {
  @apply border-l-4 border-primary-500 pl-4 py-2 my-4 italic text-text-secondary bg-bg-secondary rounded-r;
}

.markdown-content :deep(a) {
  @apply text-primary-500 hover:text-primary-600 underline transition-colors;
}

.markdown-content :deep(img) {
  @apply max-w-full h-auto rounded-lg my-4;
}

.markdown-content :deep(code) {
  @apply bg-bg-tertiary text-primary-400 px-1.5 py-0.5 rounded text-sm font-mono;
}

.markdown-content :deep(pre) {
  @apply rounded-lg p-4 my-4 overflow-x-auto;
  border: 1px solid var(--color-border-primary);
  background: var(--color-bg-tertiary) !important;
}

.markdown-content :deep(pre code) {
  @apply p-0 text-sm;
  background: transparent !important;
  color: inherit;
  /* Ensure syntax highlighting colors are visible */
}

.markdown-content :deep(pre code.hljs) {
  background: transparent !important;
  padding: 0;
}

.markdown-content :deep(hr) {
  @apply border-border-primary my-8;
}

.markdown-content :deep(table) {
  @apply w-full border-collapse my-4;
}

.markdown-content :deep(thead) {
  @apply bg-bg-secondary;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  @apply border border-border-primary px-4 py-2 text-left;
}

.markdown-content :deep(th) {
  @apply font-semibold text-text-primary;
}

.markdown-content :deep(td) {
  @apply text-text-secondary;
}

.markdown-content :deep(strong) {
  @apply font-semibold text-text-primary;
}

.markdown-content :deep(em) {
  @apply italic;
}
</style>
