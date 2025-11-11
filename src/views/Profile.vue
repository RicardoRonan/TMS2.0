<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Profile
          </h1>
          <p class="text-xl text-text-secondary">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
    </section>

    <!-- Profile Content -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Profile Info Card -->
            <HIGCard class="md:col-span-2">
              <div class="p-6">
                <h2 class="text-2xl font-bold text-text-primary mb-6">Account Information</h2>
                
                <div class="space-y-6">
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-2">Display Name</label>
                    <div class="text-text-primary text-lg">{{ currentUser?.displayName || 'Not set' }}</div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-2">Email</label>
                    <div class="text-text-primary text-lg">{{ currentUser?.email || 'Not set' }}</div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-text-secondary mb-2">Member Since</label>
                    <div class="text-text-primary text-lg">{{ formatDate(currentUser?.createdAt) }}</div>
                  </div>
                  
                  <div v-if="currentUser?.isAdmin" class="pt-4 border-t border-border-primary">
                    <div class="flex items-center space-x-2 mb-4">
                      <span class="badge badge-primary">Admin</span>
                    </div>
                    <p class="text-text-secondary text-sm mb-4">
                      You have administrative privileges. Access the admin panel to manage content.
                    </p>
                    <router-link to="/admin">
                      <HIGButton variant="primary">
                        Go to Admin Panel
                      </HIGButton>
                    </router-link>
                  </div>
                </div>
              </div>
            </HIGCard>

            <!-- Quick Actions -->
            <HIGCard>
              <div class="p-6">
                <h2 class="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
                <div class="space-y-3">
                  <HIGButton variant="secondary" full-width @click="showEditModal = true">
                    Edit Profile
                  </HIGButton>
                  <HIGButton variant="tertiary" full-width @click="handleLogout">
                    Sign Out
                  </HIGButton>
                </div>
              </div>
            </HIGCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Tutorial Progress Section -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <HIGCard>
            <div class="p-6">
              <h2 class="text-2xl font-bold text-text-primary mb-6">Tutorial Progress</h2>
              
              <div v-if="loadingTutorialProgress" class="space-y-4">
                <div v-for="n in 3" :key="n" class="animate-pulse">
                  <div class="h-4 bg-bg-tertiary rounded w-3/4 mb-2"></div>
                  <div class="h-2 bg-bg-tertiary rounded w-full mb-4"></div>
                </div>
              </div>
              
              <div v-else-if="tutorialProgress.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="tutorial" :size="32" class="text-text-tertiary" />
                </div>
                <p class="text-text-secondary">No tutorial progress yet. Start learning!</p>
                <router-link to="/tutorials" class="mt-4 inline-block">
                  <HIGButton variant="primary">Browse Tutorials</HIGButton>
                </router-link>
              </div>
              
              <div v-else class="space-y-6">
                <div
                  v-for="progress in tutorialProgress"
                  :key="progress.category_id"
                  class="border border-border-primary rounded-lg p-4 hover:bg-bg-secondary transition-colors"
                >
                  <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                      <h3 class="text-lg font-semibold text-text-primary mb-1">
                        {{ progress.category_title }}
                      </h3>
                      <p class="text-sm text-text-secondary">
                        {{ progress.completed_pages }} / {{ progress.total_pages }} pages completed
                      </p>
                    </div>
                    <span class="badge badge-secondary">{{ progress.category_level }}</span>
                  </div>
                  
                  <div class="mb-3">
                    <div class="w-full bg-bg-tertiary rounded-full h-2">
                      <div
                        class="bg-primary-500 h-2 rounded-full transition-all"
                        :style="{ width: `${progress.percentage}%` }"
                      ></div>
                    </div>
                    <p class="text-xs text-text-tertiary mt-1">{{ Math.round(progress.percentage) }}% complete</p>
                  </div>
                  
                  <router-link
                    :to="`/tutorials/${progress.category_slug}`"
                    class="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors text-sm"
                  >
                    {{ progress.percentage === 100 ? 'Review Tutorial' : 'Continue Learning' }}
                    <Icon name="arrow-right" :size="16" class="ml-1" />
                  </router-link>
                </div>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Liked Blog Posts Section -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <HIGCard>
            <div class="p-6">
              <h2 class="text-2xl font-bold text-text-primary mb-6">Liked Blog Posts</h2>
              
              <div v-if="loadingLikedPosts" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="n in 6" :key="n" class="animate-pulse">
                  <div class="aspect-video bg-bg-tertiary rounded-lg mb-2"></div>
                  <div class="h-4 bg-bg-tertiary rounded w-3/4 mb-2"></div>
                  <div class="h-4 bg-bg-tertiary rounded w-full"></div>
                </div>
              </div>
              
              <div v-else-if="likedPosts.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="heart" :size="32" class="text-text-tertiary" />
                </div>
                <p class="text-text-secondary">No liked posts yet. Start exploring!</p>
                <router-link to="/blog" class="mt-4 inline-block">
                  <HIGButton variant="primary">Browse Blog</HIGButton>
                </router-link>
              </div>
              
              <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div
                  v-for="post in likedPosts"
                  :key="post.id"
                  class="border border-border-primary rounded-lg overflow-hidden hover:shadow-hig-lg transition-shadow"
                >
                  <!-- Featured Image - Commented out for now -->
                  <!-- <div v-if="post.featured_image_url" class="aspect-video bg-bg-tertiary overflow-hidden">
                    <img
                      :src="post.featured_image_url"
                      :alt="post.title"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <div v-else class="aspect-video bg-bg-tertiary flex items-center justify-center">
                    <span class="text-text-tertiary">No Image</span>
                  </div> -->
                  <div class="p-4">
                    <div class="flex items-center space-x-2 text-sm text-text-tertiary mb-2">
                      <span v-if="post.category" class="badge badge-secondary">{{ post.category }}</span>
                      <span v-if="post.category">•</span>
                      <span>{{ formatDate(post.created_at) }}</span>
                    </div>
                    <h3 class="text-lg font-semibold text-text-primary line-clamp-2 mb-2">
                      {{ post.title }}
                    </h3>
                    <p class="text-text-secondary line-clamp-2 text-sm mb-3">
                      {{ post.excerpt }}
                    </p>
                    <router-link
                      :to="`/blog/${post.slug}`"
                      class="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors text-sm"
                    >
                      Read More
                      <Icon name="arrow-right" :size="16" class="ml-1" />
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- My Comments Section -->
    <section class="py-8">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <HIGCard>
            <div class="p-6">
              <h2 class="text-2xl font-bold text-text-primary mb-6">My Comments</h2>
              
              <div v-if="loadingUserComments" class="space-y-4">
                <div v-for="n in 5" :key="n" class="animate-pulse">
                  <div class="h-4 bg-bg-tertiary rounded w-3/4 mb-2"></div>
                  <div class="h-4 bg-bg-tertiary rounded w-full mb-2"></div>
                  <div class="h-4 bg-bg-tertiary rounded w-1/2"></div>
                </div>
              </div>
              
              <div v-else-if="userComments.length === 0" class="text-center py-8">
                <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="chat" :size="32" class="text-text-tertiary" />
                </div>
                <p class="text-text-secondary">No comments yet. Join the conversation!</p>
                <router-link to="/blog" class="mt-4 inline-block">
                  <HIGButton variant="primary">Browse Blog</HIGButton>
                </router-link>
              </div>
              
              <div v-else class="space-y-4">
                <div
                  v-for="comment in userComments"
                  :key="comment.id"
                  class="border border-border-primary rounded-lg p-4 hover:bg-bg-secondary transition-colors"
                >
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1">
                      <router-link
                        :to="`/blog/${comment.blog_slug}`"
                        class="text-lg font-semibold text-text-primary hover:text-primary-500 transition-colors"
                      >
                        {{ comment.blog_title }}
                      </router-link>
                      <p class="text-xs text-text-tertiary mt-1">
                        {{ formatDate(comment.created_at) }}
                      </p>
                    </div>
                  </div>
                  
                  <p class="text-text-secondary text-sm line-clamp-3 mb-3">
                    {{ comment.content }}
                  </p>
                  
                  <router-link
                    :to="`/blog/${comment.blog_slug}`"
                    class="inline-flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors text-sm"
                  >
                    View Post
                    <Icon name="arrow-right" :size="16" class="ml-1" />
                  </router-link>
                </div>
              </div>
            </div>
          </HIGCard>
        </div>
      </div>
    </section>

    <!-- Edit Profile Modal -->
    <HIGModal
      v-model:is-open="showEditModal"
      title="Edit Profile"
      size="md"
    >
      <div class="space-y-4">
        <HIGInput
          v-model="editForm.displayName"
          label="Display Name"
          placeholder="Enter your display name"
        />
        <div class="flex justify-end space-x-3 pt-4">
          <HIGButton variant="tertiary" @click="showEditModal = false">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" @click="handleUpdateProfile" :disabled="updating">
            {{ updating ? 'Updating...' : 'Update' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../supabase'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGModal from '../components/hig/HIGModal.vue'
import Icon from '../components/Icon.vue'

const store = useStore()
const router = useRouter()
const { logout, updateProfile } = useAuth()

const showEditModal = ref(false)
const updating = ref(false)
const editForm = ref({
  displayName: ''
})

// Tutorial Progress State
const tutorialProgress = ref<any[]>([])
const loadingTutorialProgress = ref(false)

// Liked Posts State
const likedPosts = ref<any[]>([])
const loadingLikedPosts = ref(false)

// User Comments State
const userComments = ref<any[]>([])
const loadingUserComments = ref(false)

const currentUser = computed(() => store.getters.currentUser)

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleUpdateProfile = async () => {
  try {
    updating.value = true
    await updateProfile({
      displayName: editForm.value.displayName
    })
    showEditModal.value = false
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Profile updated successfully'
    })
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to update profile'
    })
  } finally {
    updating.value = false
  }
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Successfully signed out'
    })
  } catch (error) {
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to sign out'
    })
  }
}

// Initialize edit form with current user data
const initEditForm = () => {
  if (currentUser.value) {
    editForm.value.displayName = currentUser.value.displayName || ''
  }
}

// Watch for modal opening to populate form
watch(showEditModal, (isOpen) => {
  if (isOpen) {
    initEditForm()
  }
})

// Fetch Tutorial Progress
const fetchTutorialProgress = async () => {
  if (!currentUser.value?.uid) return

  try {
    loadingTutorialProgress.value = true

    // First, get all progress entries for the user
    const { data: progressData, error: progressError } = await supabase
      .from('tutorial_progress')
      .select(`
        *,
        category:tutorials_category!tutorial_category_id (
          category_id,
          title,
          slug,
          level
        )
      `)
      .eq('user_id', currentUser.value.uid)

    if (progressError) {
      // If table doesn't exist, that's okay - just use empty array
      if (progressError.code === '42P01' ||
          progressError.message?.includes('does not exist') ||
          progressError.message?.includes('schema cache') ||
          progressError.code === 'PGRST116') {
        tutorialProgress.value = []
        return
      }
      throw progressError
    }

    // Get all published tutorial categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('tutorials_category')
      .select('category_id, title, slug, level')
      .eq('published', true)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      tutorialProgress.value = []
      return
    }

    // For each category, calculate progress
    const progressMap = new Map()
    
    // Initialize all categories
    categoriesData?.forEach((category: any) => {
      progressMap.set(category.category_id, {
        category_id: category.category_id,
        category_title: category.title,
        category_slug: category.slug,
        category_level: category.level,
        completed_pages: 0,
        total_pages: 0,
        percentage: 0
      })
    })

    // Get total pages per category
    const { data: pagesData } = await supabase
      .from('tutorial_pages')
      .select('id, category_id')
      .eq('published', true)

    // Count total pages per category
    const pagesByCategory = new Map()
    pagesData?.forEach((page: any) => {
      const count = pagesByCategory.get(page.category_id) || 0
      pagesByCategory.set(page.category_id, count + 1)
    })

    // Update progress map with totals
    pagesByCategory.forEach((total, categoryId) => {
      const progress = progressMap.get(categoryId)
      if (progress) {
        progress.total_pages = total
      }
    })

    // Count completed pages from progress data
    progressData?.forEach((progress: any) => {
      const categoryId = progress.tutorial_category_id
      const categoryProgress = progressMap.get(categoryId)
      if (categoryProgress && progress.completed) {
        categoryProgress.completed_pages += 1
      }
    })

    // Calculate percentages and filter out categories with no progress
    const progressArray = Array.from(progressMap.values())
      .map((progress: any) => {
        if (progress.total_pages > 0) {
          progress.percentage = (progress.completed_pages / progress.total_pages) * 100
        }
        return progress
      })
      .filter((progress: any) => {
        // Only show categories where user has some progress
        return progressData?.some((p: any) => p.tutorial_category_id === progress.category_id)
      })
      .sort((a: any, b: any) => b.percentage - a.percentage)

    tutorialProgress.value = progressArray
  } catch (err: any) {
    console.error('Error fetching tutorial progress:', err)
    tutorialProgress.value = []
  } finally {
    loadingTutorialProgress.value = false
  }
}

// Fetch Liked Blog Posts
const fetchLikedPosts = async () => {
  if (!currentUser.value?.uid) return

  try {
    loadingLikedPosts.value = true

    const { data, error } = await supabase
      .from('blog_likes')
      .select(`
        *,
        blog:blogs!blog_id (
          id,
          title,
          slug,
          excerpt,
          category,
          featured_image_url,
          created_at,
          read_time
        )
      `)
      .eq('user_id', currentUser.value.uid)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      // If table doesn't exist, that's okay - just use empty array
      if (error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache') ||
          error.code === 'PGRST116') {
        likedPosts.value = []
        return
      }
      throw error
    }

    likedPosts.value = (data || [])
      .map((like: any) => ({
        id: like.blog?.id,
        title: like.blog?.title,
        slug: like.blog?.slug,
        excerpt: like.blog?.excerpt,
        category: like.blog?.category,
        featured_image_url: like.blog?.featured_image_url,
        created_at: like.blog?.created_at,
        read_time: like.blog?.read_time
      }))
      .filter((post: any) => post.id) // Filter out any null posts
  } catch (err: any) {
    console.error('Error fetching liked posts:', err)
    likedPosts.value = []
  } finally {
    loadingLikedPosts.value = false
  }
}

// Fetch User Comments
const fetchUserComments = async () => {
  if (!currentUser.value?.uid) return

  try {
    loadingUserComments.value = true

    const { data, error } = await supabase
      .from('blog_comments')
      .select(`
        *,
        blog:blogs!blog_id (
          id,
          title,
          slug
        )
      `)
      .eq('user_id', currentUser.value.uid)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      // If table doesn't exist, that's okay - just use empty array
      if (error.code === '42P01' ||
          error.message?.includes('does not exist') ||
          error.message?.includes('schema cache') ||
          error.code === 'PGRST116') {
        userComments.value = []
        return
      }
      throw error
    }

    userComments.value = (data || [])
      .map((comment: any) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        blog_title: comment.blog?.title || 'Unknown Post',
        blog_slug: comment.blog?.slug || ''
      }))
      .filter((comment: any) => comment.blog_slug) // Filter out comments with no blog
  } catch (err: any) {
    console.error('Error fetching user comments:', err)
    userComments.value = []
  } finally {
    loadingUserComments.value = false
  }
}

// Fetch all data on mount
onMounted(() => {
  if (currentUser.value?.uid) {
    fetchTutorialProgress()
    fetchLikedPosts()
    fetchUserComments()
  }
})

// Watch for user changes
watch(currentUser, (newUser) => {
  if (newUser?.uid) {
    fetchTutorialProgress()
    fetchLikedPosts()
    fetchUserComments()
  } else {
    tutorialProgress.value = []
    likedPosts.value = []
    userComments.value = []
  }
})
</script>

