<template>
  <div class="min-h-screen bg-bg-primary">
    <!-- Header -->
    <section class="py-16 bg-gradient-to-br from-bg-secondary to-bg-tertiary">
      <div class="container mx-auto px-4">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-text-primary mb-6">
            Admin Panel
          </h1>
          <p class="text-xl text-text-secondary">
            Manage content, users, and platform settings
          </p>
        </div>
      </div>
    </section>

    <!-- Admin Dashboard -->
    <section class="py-16">
      <div class="container mx-auto px-4">
        <div class="max-w-6xl mx-auto">
          <!-- Stats -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            <HIGCard>
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-primary-500 mb-2">{{ stats.blogs }}</div>
                <div class="text-text-secondary">Blog Posts</div>
              </div>
            </HIGCard>
            <HIGCard>
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-primary-500 mb-2">{{ stats.tutorials }}</div>
                <div class="text-text-secondary">Tutorial Categories</div>
              </div>
            </HIGCard>
            <HIGCard>
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-primary-500 mb-2">{{ stats.tools }}</div>
                <div class="text-text-secondary">Tools</div>
              </div>
            </HIGCard>
            <HIGCard>
              <div class="p-6 text-center">
                <div class="text-3xl font-bold text-primary-500 mb-2">{{ stats.users }}</div>
                <div class="text-text-secondary">Total Users</div>
              </div>
            </HIGCard>
          </div>

          <!-- Tabs -->
          <div class="mb-8">
            <div class="flex space-x-2 md:space-x-4 border-b border-border-primary overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                :class="tabButtonClasses(tab.id)"
                @click="activeTab = tab.id"
                class="whitespace-nowrap px-3 md:px-4 py-2 text-sm md:text-base"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- Tab Content -->
          <div>
            <!-- Tutorials Management -->
            <div v-if="activeTab === 'tutorials'" class="space-y-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-text-primary">Tutorials Management</h2>
                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <HIGButton variant="secondary" @click="openCreateCategoryModal" class="w-full sm:w-auto">
                    + New Category
                  </HIGButton>
                  <HIGButton variant="primary" @click="openCreatePageModal" class="w-full sm:w-auto">
                    + New Page
                  </HIGButton>
                </div>
              </div>

              <!-- Categories Section -->
              <div class="mb-8">
                <button
                  @click="toggleCategorySection('tutorial')"
                  class="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors mb-4"
                >
                  <h3 class="text-xl font-semibold text-text-primary">Categories</h3>
                  <svg
                    :class="['w-5 h-5 text-text-tertiary transition-transform', { 'rotate-180': expandedCategorySections.tutorial }]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div v-if="expandedCategorySections.tutorial">
                <div v-if="loadingCategories" class="text-center py-12">
                  <HIGSpinner />
                  <p class="text-text-secondary mt-4">Loading categories...</p>
                </div>
                <div v-else-if="categories.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <HIGCard v-for="category in categories" :key="category.category_id" class="hover:shadow-hig-lg transition-shadow">
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                          <h4 class="text-base font-semibold text-text-primary mb-1">{{ category.title }}</h4>
                          <p class="text-text-secondary text-sm line-clamp-2">{{ category.description || 'No description' }}</p>
                          <div class="flex items-center space-x-2 mt-1.5 text-xs text-text-tertiary">
                            <span>{{ category.level }}</span>
                            <span>•</span>
                            <span>{{ category.duration }} min</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-border-primary">
                        <button
                          class="p-1.5 text-text-primary hover:text-primary-500 active:opacity-70 transition-colors rounded-lg hover:bg-bg-tertiary"
                          @click="editCategory(category)"
                          title="Edit category"
                          aria-label="Edit category"
                        >
                          <Icon name="edit" :size="16" />
                        </button>
                        <button
                          class="p-1.5 text-text-primary hover:text-danger active:opacity-70 transition-colors rounded-lg hover:bg-bg-tertiary"
                          @click="confirmDeleteCategory(category)"
                          title="Delete category"
                          aria-label="Delete category"
                        >
                          <Icon name="delete" :size="16" />
                        </button>
                      </div>
                    </div>
                  </HIGCard>
                </div>
                <HIGCard v-else>
                  <div class="p-6 text-center py-12 text-text-secondary">
                    <p>No categories yet. Create your first category!</p>
                  </div>
                </HIGCard>
                </div>
              </div>

              <!-- Pages Section -->
              <div>
                <h3 class="text-xl font-semibold text-text-primary mb-4">Pages</h3>
                <div v-if="loadingPages" class="text-center py-12">
                  <HIGSpinner />
                  <p class="text-text-secondary mt-4">Loading pages...</p>
                </div>
                <div v-else-if="pages.length > 0" class="space-y-4">
                  <div v-for="category in categoriesWithPages" :key="category.category_id" class="category-pages-group">
                    <button
                      @click="toggleCategory(category.category_id)"
                      class="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors mb-2"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-lg font-semibold text-text-primary">{{ category.title }}</span>
                        <span class="text-sm text-text-tertiary">({{ getCategoryPages(category.category_id).length }} pages)</span>
                      </div>
                      <svg
                        :class="['w-5 h-5 text-text-tertiary transition-transform', { 'rotate-180': expandedCategories[category.category_id] }]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div v-if="expandedCategories[category.category_id]" class="space-y-2 ml-4">
                      <HIGCard v-for="page in getCategoryPages(category.category_id)" :key="page.id" class="hover:shadow-hig-lg transition-shadow">
                        <div class="p-4 md:p-6">
                          <div class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                            <div class="flex-1 min-w-0">
                              <div class="flex flex-wrap items-center gap-2 mb-2">
                                <h4 class="text-base sm:text-lg font-semibold text-text-primary break-words">{{ page.title }}</h4>
                                <span 
                                  :class="[
                                    'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                                    page.published 
                                      ? 'bg-success-500/20 text-success-500' 
                                      : 'bg-warning-500/20 text-warning-500'
                                  ]"
                                >
                                  {{ page.published ? 'Published' : 'Draft' }}
                                </span>
                              </div>
                              <div class="flex flex-wrap items-center gap-2 text-sm text-text-tertiary mb-2">
                                <span>Order: {{ page.page_order }}</span>
                                <span>•</span>
                                <span>{{ formatDate(page.created_at) }}</span>
                              </div>
                            </div>
                            <div class="flex items-center space-x-2 sm:ml-4 w-full sm:w-auto">
                              <HIGButton variant="tertiary" size="sm" @click="editPage(page)" class="flex-1 sm:flex-none">
                                Edit
                              </HIGButton>
                              <HIGButton variant="danger" size="sm" @click="confirmDeletePage(page)" class="flex-1 sm:flex-none">
                                Delete
                              </HIGButton>
                            </div>
                          </div>
                        </div>
                      </HIGCard>
                    </div>
                  </div>
                </div>
                <HIGCard v-else>
                  <div class="p-6 text-center py-12 text-text-secondary">
                    <p>No pages yet. Create your first page!</p>
                  </div>
                </HIGCard>
              </div>
            </div>

            <!-- Blog Management -->
            <div v-if="activeTab === 'blog'" class="space-y-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-text-primary">Blog Posts</h2>
                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <HIGButton variant="secondary" @click="openCreateBlogCategoryModal" class="w-full sm:w-auto">
                    + New Category
                  </HIGButton>
                  <HIGButton variant="primary" @click="openCreateModal" class="w-full sm:w-auto">
                    + New Post
                  </HIGButton>
                </div>
              </div>

              <!-- Blog Categories Section -->
              <div class="mb-8">
                <button
                  @click="toggleCategorySection('blog')"
                  class="w-full flex items-center justify-between p-4 bg-bg-secondary hover:bg-bg-tertiary rounded-lg transition-colors mb-4"
                >
                  <h3 class="text-xl font-semibold text-text-primary">Categories</h3>
                  <svg
                    :class="['w-5 h-5 text-text-tertiary transition-transform', { 'rotate-180': expandedCategorySections.blog }]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div v-if="expandedCategorySections.blog">
                <div v-if="loadingBlogCategories" class="text-center py-12">
                  <HIGSpinner />
                  <p class="text-text-secondary mt-4">Loading categories...</p>
                </div>
                <div v-else-if="blogCategoriesList.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <HIGCard v-for="category in blogCategoriesList" :key="category.id" class="hover:shadow-hig-lg transition-shadow">
                    <div class="p-4">
                      <div class="flex items-start justify-between mb-2">
                        <div class="flex-1">
                          <h4 class="text-base font-semibold text-text-primary mb-1">{{ category.name }}</h4>
                          <p v-if="category.description" class="text-text-secondary text-sm line-clamp-2">{{ category.description }}</p>
                          <div class="flex items-center space-x-2 mt-1.5 text-xs text-text-tertiary">
                            <span>{{ getBlogsInCategory(category.name).length }} posts</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center justify-end space-x-1 mt-3 pt-3 border-t border-border-primary">
                        <button
                          class="p-1.5 text-text-primary hover:text-primary-500 active:opacity-70 transition-colors rounded-lg hover:bg-bg-tertiary"
                          @click="editBlogCategory(category)"
                          title="Edit category"
                          aria-label="Edit category"
                        >
                          <Icon name="edit" :size="16" />
                        </button>
                        <button
                          class="p-1.5 text-text-primary hover:text-danger active:opacity-70 transition-colors rounded-lg hover:bg-bg-tertiary"
                          @click="confirmDeleteBlogCategory(category)"
                          title="Delete category"
                          aria-label="Delete category"
                        >
                          <Icon name="delete" :size="16" />
                        </button>
                      </div>
                    </div>
                  </HIGCard>
                </div>
                <HIGCard v-else>
                  <div class="p-6 text-center py-12 text-text-secondary">
                    <p>No categories yet. Create your first category!</p>
                  </div>
                </HIGCard>
                </div>
              </div>

              <!-- Search and Filter -->
              <div class="mb-6 flex flex-col md:flex-row gap-4">
                <HIGInput
                  v-model="blogSearchQuery"
                  placeholder="Search blogs..."
                  class="flex-1"
                />
                <select
                  v-model="blogFilterCategory"
                  class="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  <option v-for="cat in blogCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <select
                  v-model="blogFilterStatus"
                  class="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              <!-- Loading State -->
              <div v-if="loadingBlogs" class="text-center py-12">
                <HIGSpinner />
                <p class="text-text-secondary mt-4">Loading blogs...</p>
              </div>

              <!-- Blog List -->
              <div v-else-if="filteredBlogs.length > 0" class="space-y-4">
                <HIGCard v-for="blog in filteredBlogs" :key="blog.id" class="hover:shadow-hig-lg transition-shadow">
                  <div class="p-4 md:p-6">
                    <div class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                          <h3 class="text-lg sm:text-xl font-semibold text-text-primary break-words">{{ blog.title }}</h3>
                          <span 
                            :class="[
                              'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                              blog.published 
                                ? 'bg-success-500/20 text-success-500' 
                                : 'bg-warning-500/20 text-warning-500'
                            ]"
                          >
                            {{ blog.published ? 'Published' : 'Draft' }}
                          </span>
                        </div>
                        <p class="text-text-secondary mb-3 line-clamp-2">{{ blog.excerpt || 'No excerpt' }}</p>
                        <div class="flex flex-wrap items-center gap-2 text-sm text-text-tertiary">
                          <span>{{ blog.category || 'Uncategorized' }}</span>
                          <span>•</span>
                          <span>{{ formatDate(blog.created_at) }}</span>
                          <span v-if="blog.read_time">•</span>
                          <span v-if="blog.read_time">{{ blog.read_time }} min read</span>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2 sm:ml-4 w-full sm:w-auto">
                        <HIGButton variant="tertiary" size="sm" @click="editBlog(blog)" class="flex-1 sm:flex-none">
                          Edit
                        </HIGButton>
                        <HIGButton variant="danger" size="sm" @click="confirmDelete(blog)" class="flex-1 sm:flex-none">
                          Delete
                        </HIGButton>
                      </div>
                    </div>
                  </div>
                </HIGCard>
              </div>

              <!-- Empty State -->
              <HIGCard v-else>
                <div class="p-6">
                  <div class="text-center py-12 text-text-secondary">
                    <p class="mb-4">No blog posts found.</p>
                    <HIGButton variant="primary" @click="openCreateModal">
                      Create Your First Post
                    </HIGButton>
                  </div>
                </div>
              </HIGCard>
            </div>

              <!-- Tools Management -->
              <div v-if="activeTab === 'tools'" class="space-y-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-text-primary">Tools</h2>
                <HIGButton variant="primary" @click="openCreateToolModal" class="w-full sm:w-auto">
                  + New Tool
                </HIGButton>
              </div>

              <!-- Search and Filter -->
              <div class="mb-6 flex flex-col md:flex-row gap-4">
                <HIGInput
                  v-model="toolSearchQuery"
                  placeholder="Search tools..."
                  class="flex-1"
                />
                <select
                  v-model="toolFilterCategory"
                  class="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Categories</option>
                  <option v-for="cat in toolCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
                <select
                  v-model="toolFilterFeatured"
                  class="px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Tools</option>
                  <option value="true">Featured Only</option>
                </select>
              </div>

              <div v-if="loadingTools" class="text-center py-12">
                <HIGSpinner />
                <p class="text-text-secondary mt-4">Loading tools...</p>
              </div>

              <div v-else-if="filteredTools.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <HIGCard v-for="tool in filteredTools" :key="tool.id" class="hover:shadow-hig-lg transition-shadow">
                  <div class="p-4 md:p-6">
                    <div class="flex items-start justify-between mb-3">
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                          <h4 class="text-base sm:text-lg font-semibold text-text-primary break-words">{{ tool.name }}</h4>
                          <span v-if="tool.is_featured" class="px-2 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-500 whitespace-nowrap">
                            Featured
                          </span>
                        </div>
                        <p class="text-text-secondary text-sm line-clamp-2 mb-2">{{ tool.description || 'No description' }}</p>
                        <div class="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                          <span>{{ tool.category || 'Uncategorized' }}</span>
                          <span>•</span>
                          <a :href="tool.url" target="_blank" class="text-primary-500 hover:text-primary-600 break-all">Visit</a>
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 mt-4 pt-4 border-t border-border-primary">
                      <HIGButton variant="tertiary" size="sm" @click="editTool(tool)" class="flex-1 sm:flex-none">
                        Edit
                      </HIGButton>
                      <HIGButton variant="danger" size="sm" @click="confirmDeleteTool(tool)" class="flex-1 sm:flex-none">
                        Delete
                      </HIGButton>
                    </div>
                  </div>
                </HIGCard>
              </div>

              <HIGCard v-else>
                <div class="p-6 text-center py-12 text-text-secondary">
                  <p>No tools found.</p>
                </div>
              </HIGCard>
            </div>

              <!-- Users Management -->
            <div v-if="activeTab === 'users'" class="space-y-6">
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <h2 class="text-xl sm:text-2xl font-bold text-text-primary">Users</h2>
              </div>

              <!-- Search -->
              <div class="mb-6">
                <HIGInput
                  v-model="userSearchQuery"
                  placeholder="Search users by name or email..."
                  class="max-w-md"
                />
              </div>

              <div v-if="loadingUsers" class="text-center py-12">
                <HIGSpinner />
                <p class="text-text-secondary mt-4">Loading users...</p>
              </div>

              <div v-else-if="filteredUsers.length > 0" class="space-y-4">
                <HIGCard v-for="user in filteredUsers" :key="user.id" class="hover:shadow-hig-lg transition-shadow">
                  <div class="p-4 md:p-6">
                    <div class="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
                      <div class="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div v-if="user.photo_url" class="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-bg-tertiary flex-shrink-0">
                          <img :src="user.photo_url" :alt="user.display_name" class="w-full h-full object-cover">
                        </div>
                        <div v-else class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-bg-tertiary flex items-center justify-center text-text-tertiary flex-shrink-0">
                          {{ (user.display_name || user.email || 'U')[0].toUpperCase() }}
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex flex-wrap items-center gap-2 mb-1">
                            <h4 class="text-base sm:text-lg font-semibold text-text-primary break-words">{{ user.display_name || 'No name' }}</h4>
                            <span v-if="user.is_admin" class="px-2 py-1 rounded text-xs font-medium bg-primary-500/20 text-primary-500 whitespace-nowrap">
                              Admin
                            </span>
                          </div>
                          <p class="text-text-secondary text-sm mb-2 break-words">{{ user.email }}</p>
                          <div class="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
                            <span>Joined: {{ formatDate(user.created_at) }}</span>
                            <span v-if="user.last_login_at">•</span>
                            <span v-if="user.last_login_at">Last login: {{ formatDate(user.last_login_at) }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center space-x-2 sm:ml-4 w-full sm:w-auto">
                        <HIGButton variant="tertiary" size="sm" @click="editUser(user)" class="flex-1 sm:flex-none">
                          Edit
                        </HIGButton>
                      </div>
                    </div>
                  </div>
                </HIGCard>
              </div>

              <HIGCard v-else>
                <div class="p-6 text-center py-12 text-text-secondary">
                  <p>No users found.</p>
                </div>
              </HIGCard>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Modals will be added here - keeping existing blog modal and adding new ones -->
    <!-- Blog Modal -->
    <HIGModal
      v-model:is-open="showBlogModal"
      :title="editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'"
      size="lg"
    >
      <form @submit.prevent="handleSubmitBlog" class="space-y-4">
        <HIGInput
          v-model="blogForm.title"
          label="Title"
          placeholder="Enter blog post title"
          required
        />
        <HIGInput
          v-model="blogForm.slug"
          label="Slug"
          placeholder="blog-post-slug"
          hint="URL-friendly version of the title"
          required
        />
        <HIGInput
          v-model="blogForm.excerpt"
          label="Excerpt"
          placeholder="Brief description of the post"
        />
        <MarkdownEditor
          v-model="blogForm.content"
          label="Content"
          :rows="12"
          placeholder="Write your blog post content in Markdown format..."
          class="font-mono text-sm"
          required
          hint="Use the toolbar buttons to format your content, or type Markdown directly. Press F11 for fullscreen mode."
        />
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Category</label>
          <div class="flex gap-2">
            <select
              v-model="blogForm.category"
              class="flex-1 px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Uncategorized</option>
              <option 
                v-for="cat in blogCategories" 
                :key="cat" 
                :value="cat"
              >
                {{ cat }}
              </option>
            </select>
            <HIGButton variant="tertiary" size="sm" @click="openCreateBlogCategoryModal" type="button">
              + New
            </HIGButton>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Featured Image
          </label>
          <div class="space-y-2">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload($event, 'blog')"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600"
            />
            <p class="text-xs text-text-tertiary">
              Upload an image (will be uploaded to ImgBB) or paste a URL below
            </p>
            <HIGInput
              v-model="blogForm.featured_image_url"
              label="Or paste image URL"
              placeholder="https://example.com/image.jpg"
              type="url"
            />
            <div v-if="blogForm.featured_image_url" class="mt-2">
              <img 
                :src="blogForm.featured_image_url" 
                alt="Preview" 
                class="max-w-xs h-auto rounded-lg border border-border-primary"
                @error="blogForm.featured_image_url = ''"
              />
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HIGInput
            v-model.number="blogForm.read_time"
            label="Read Time (minutes)"
            type="number"
            placeholder="5"
          />
          <div class="flex items-center space-x-2 pt-6">
            <input
              id="published"
              v-model="blogForm.published"
              type="checkbox"
              class="w-4 h-4 text-primary-500 bg-bg-secondary border-border-primary rounded focus:ring-primary-500"
            />
            <label for="published" class="text-sm font-medium text-text-primary">
              Publish immediately
            </label>
          </div>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeBlogModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingBlog ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Delete Blog Modal -->
    <HIGModal
      v-model:is-open="showDeleteModal"
      title="Delete Blog Post"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-text-primary">
          Are you sure you want to delete "<strong>{{ blogToDelete?.title }}</strong>"? This action cannot be undone.
        </p>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <HIGButton variant="tertiary" @click="showDeleteModal = false" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="danger" @click="handleDeleteBlog" :disabled="deleting" class="w-full sm:w-auto">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>

    <!-- Tutorial Category Modal -->
    <HIGModal
      v-model:is-open="showCategoryModal"
      :title="editingCategory ? 'Edit Category' : 'Create New Category'"
      size="lg"
    >
      <form @submit.prevent="handleSubmitCategory" class="space-y-4">
        <HIGInput
          v-model="categoryForm.title"
          label="Title"
          placeholder="Enter category title"
          required
        />
        <HIGInput
          v-model="categoryForm.slug"
          label="Slug"
          placeholder="category-slug"
          required
        />
        <HIGInput
          v-model="categoryForm.description"
          label="Description"
          placeholder="Brief description"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">Level</label>
            <select
              v-model="categoryForm.level"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          <HIGInput
            v-model.number="categoryForm.duration"
            label="Duration (minutes)"
            type="number"
            placeholder="30"
          />
        </div>
        <div class="flex items-center space-x-2">
          <input
            id="categoryPublished"
            v-model="categoryForm.published"
            type="checkbox"
            class="w-4 h-4 text-primary-500 bg-bg-secondary border-border-primary rounded focus:ring-primary-500"
          />
          <label for="categoryPublished" class="text-sm font-medium text-text-primary">
            Publish immediately
          </label>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeCategoryModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingCategory ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Tutorial Page Modal -->
    <HIGModal
      v-model:is-open="showPageModal"
      :title="editingPage ? 'Edit Page' : 'Create New Page'"
      size="lg"
    >
      <form @submit.prevent="handleSubmitPage" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Category <span class="text-danger">*</span></label>
          <select
            v-model="pageForm.category_id"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="">Select a category</option>
            <option v-for="cat in categories" :key="cat.category_id" :value="cat.category_id">
              {{ cat.title }}
            </option>
          </select>
        </div>
        <HIGInput
          v-model="pageForm.title"
          label="Title"
          placeholder="Enter page title"
          required
        />
        <HIGInput
          v-model="pageForm.slug"
          label="Slug"
          placeholder="page-slug"
          required
        />
        <MarkdownEditor
          v-model="pageForm.content"
          label="Content"
          :rows="10"
          placeholder="Write page content here..."
          required
        />
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Page Type <span class="text-danger">*</span></label>
          <select
            v-model="pageForm.page_type"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="content">Content</option>
            <option value="qa">Q&A Exercise</option>
            <option value="mini_project">Mini Project</option>
            <option value="capstone">Capstone Project</option>
          </select>
          <p class="text-sm text-text-secondary mt-1">
            Select the type of page. Q&A, Mini Projects, and Capstone pages will show interactive exercises.
          </p>
        </div>
        <HIGInput
          v-model.number="pageForm.page_order"
          label="Order"
          type="number"
          placeholder="0"
        />
        <div class="flex items-center space-x-2">
          <input
            id="pagePublished"
            v-model="pageForm.published"
            type="checkbox"
            class="w-4 h-4 text-primary-500 bg-bg-secondary border-border-primary rounded focus:ring-primary-500"
          />
          <label for="pagePublished" class="text-sm font-medium text-text-primary">
            Publish immediately
          </label>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closePageModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingPage ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Exercise Management Modal -->
    <HIGModal
      v-model:is-open="showExerciseModal"
      :title="editingExercise ? 'Edit Exercise' : 'Create New Exercise'"
      size="xl"
    >
      <form @submit.prevent="handleSubmitExercise" class="space-y-4">
        <div class="text-sm text-text-secondary mb-4">
          Page: <strong>{{ currentPageForExercise?.title }}</strong>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Exercise Type <span class="text-danger">*</span></label>
          <select
            v-model="exerciseForm.exercise_type"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="code_editor">Code Editor</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="text_input">Text Input</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div v-if="exerciseForm.exercise_type === 'code_editor' || exerciseForm.exercise_type === 'mixed'">
          <div>
            <label class="block text-sm font-medium text-text-primary mb-2">Language</label>
            <select
              v-model="exerciseForm.language"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Starter Code</label>
            <textarea
              v-model="exerciseForm.starter_code"
              rows="8"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="// Write starter code here..."
            ></textarea>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Solution Code (Optional)</label>
            <textarea
              v-model="exerciseForm.solution_code"
              rows="8"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="// Write solution code here..."
            ></textarea>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Test Cases (JSON)</label>
            <textarea
              v-model="testCasesJson"
              rows="6"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder='[{"input": "test", "expected_output": "result", "description": "Test case 1"}]'
            ></textarea>
            <p class="text-xs text-text-secondary mt-1">Format: Array of objects with input, expected_output, and optional description</p>
          </div>
        </div>
        <div v-if="exerciseForm.exercise_type === 'multiple_choice' || exerciseForm.exercise_type === 'mixed'">
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Options (JSON)</label>
            <textarea
              v-model="optionsJson"
              rows="6"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder='[{"value": "A", "label": "Option A"}, {"value": "B", "label": "Option B"}]'
            ></textarea>
            <p class="text-xs text-text-secondary mt-1">Format: Array of objects with value and label</p>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Correct Answer(s)</label>
            <HIGInput
              v-model="exerciseForm.correct_answer"
              placeholder="A or A,B for multiple"
            />
          </div>
        </div>
        <div v-if="exerciseForm.exercise_type === 'text_input' || exerciseForm.exercise_type === 'mixed'">
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Correct Answer</label>
            <HIGInput
              v-model="exerciseForm.correct_answer"
              placeholder="Expected answer"
            />
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Instructions <span class="text-danger">*</span></label>
          <MarkdownEditor
            v-model="exerciseForm.instructions"
            :rows="6"
            placeholder="Write exercise instructions here..."
            required
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Hints (JSON Array)</label>
          <textarea
            v-model="hintsJson"
            rows="4"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            placeholder='["Hint 1", "Hint 2"]'
          ></textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HIGInput
            v-model.number="exerciseForm.points"
            label="Points"
            type="number"
            placeholder="10"
          />
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeExerciseModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingExercise ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Q&A Question Management Modal -->
    <HIGModal
      v-model:is-open="showQAModal"
      :title="editingQA ? 'Edit Q&A Question' : 'Create New Q&A Question'"
      size="xl"
    >
      <form @submit.prevent="handleSubmitQA" class="space-y-4">
        <div class="text-sm text-text-secondary mb-4">
          Page: <strong>{{ currentPageForQA?.title }}</strong>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Question Type <span class="text-danger">*</span></label>
          <select
            v-model="qaForm.question_type"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          >
            <option value="multiple_choice">Multiple Choice</option>
            <option value="text_input">Text Input</option>
            <option value="code">Code</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Question Text <span class="text-danger">*</span></label>
          <MarkdownEditor
            v-model="qaForm.question_text"
            :rows="4"
            placeholder="Enter your question here..."
            required
          />
        </div>
        <div v-if="qaForm.question_type === 'multiple_choice'">
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Options (JSON)</label>
            <textarea
              v-model="qaOptionsJson"
              rows="6"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder='[{"value": "A", "label": "Option A"}, {"value": "B", "label": "Option B"}]'
            ></textarea>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Correct Answer(s)</label>
            <HIGInput
              v-model="qaCorrectAnswersJson"
              placeholder='["A"] or ["A", "B"] for multiple correct answers'
            />
            <p class="text-xs text-text-secondary mt-1">JSON array of correct answer values</p>
          </div>
        </div>
        <div v-if="qaForm.question_type === 'text_input'">
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Correct Answer</label>
            <HIGInput
              v-model="qaForm.correct_answer"
              placeholder="Expected answer"
            />
          </div>
        </div>
        <div v-if="qaForm.question_type === 'code'">
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Language</label>
            <select
              v-model="qaForm.language"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
            </select>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-text-primary mb-2">Correct Answer (Code)</label>
            <textarea
              v-model="qaForm.correct_answer"
              rows="6"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
              placeholder="// Expected code solution"
            ></textarea>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Explanation</label>
          <MarkdownEditor
            v-model="qaForm.explanation"
            :rows="4"
            placeholder="Explanation shown after answering..."
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HIGInput
            v-model.number="qaForm.points"
            label="Points"
            type="number"
            placeholder="5"
          />
          <HIGInput
            v-model.number="qaForm.order_index"
            label="Order Index"
            type="number"
            placeholder="0"
          />
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeQAModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingQA ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Project Management Modal -->
    <HIGModal
      v-model:is-open="showProjectModal"
      :title="editingProject ? 'Edit Project' : 'Configure Project'"
      size="xl"
    >
      <form @submit.prevent="handleSubmitProject" class="space-y-4">
        <div class="text-sm text-text-secondary mb-4">
          Page: <strong>{{ currentPageForProject?.title }}</strong>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Language</label>
          <select
            v-model="projectForm.language"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Starter Code</label>
          <textarea
            v-model="projectForm.starter_code"
            rows="10"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            placeholder="// Write starter code here..."
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Requirements (One per line)</label>
          <textarea
            v-model="requirementsText"
            rows="6"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Requirement 1&#10;Requirement 2&#10;Requirement 3"
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Test Cases (JSON)</label>
          <textarea
            v-model="projectTestCasesJson"
            rows="6"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            placeholder='[{"input": "test", "expected_output": "result", "description": "Test case 1"}]'
          ></textarea>
        </div>
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Hints (One per line)</label>
          <textarea
            v-model="projectHintsText"
            rows="4"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Hint 1&#10;Hint 2"
          ></textarea>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <HIGInput
            v-model.number="projectForm.points"
            label="Points"
            type="number"
            placeholder="50"
          />
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeProjectModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingProject ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Tool Modal -->
    <HIGModal
      v-model:is-open="showToolModal"
      :title="editingTool ? 'Edit Tool' : 'Create New Tool'"
      size="lg"
    >
      <form @submit.prevent="handleSubmitTool" class="space-y-4">
        <HIGInput
          v-model="toolForm.name"
          label="Name"
          placeholder="Enter tool name"
          required
        />
        <HIGInput
          v-model="toolForm.description"
          label="Description"
          placeholder="Brief description"
        />
        <HIGInput
          v-model="toolForm.category"
          label="Category"
          placeholder="e.g., Build Tool, Framework"
        />
        <HIGInput
          v-model="toolForm.url"
          label="URL"
          placeholder="https://example.com"
          type="url"
          required
        />
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Logo
          </label>
          <div class="space-y-2">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload($event, 'tool')"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600"
            />
            <p class="text-xs text-text-tertiary">
              Upload a logo (will be uploaded to ImgBB) or paste a URL below
            </p>
            <HIGInput
              v-model="toolForm.logo_url"
              label="Or paste logo URL"
              placeholder="https://example.com/logo.png"
              type="url"
            />
            <div v-if="toolForm.logo_url" class="mt-2">
              <img 
                :src="toolForm.logo_url" 
                alt="Logo Preview" 
                class="max-w-xs h-auto rounded-lg border border-border-primary"
                @error="toolForm.logo_url = ''"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <input
            id="toolFeatured"
            v-model="toolForm.is_featured"
            type="checkbox"
            class="w-4 h-4 text-primary-500 bg-bg-secondary border-border-primary rounded focus:ring-primary-500"
          />
          <label for="toolFeatured" class="text-sm font-medium text-text-primary">
            Featured tool
          </label>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeToolModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingTool ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- User Edit Modal -->
    <HIGModal
      v-model:is-open="showUserModal"
      title="Edit User"
      size="md"
    >
      <form @submit.prevent="handleSubmitUser" class="space-y-4">
        <HIGInput
          v-model="userForm.display_name"
          label="Display Name"
          placeholder="Enter display name"
        />
        <HIGInput
          v-model="userForm.email"
          label="Email"
          type="email"
          disabled
        />
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">
            Photo
          </label>
          <div class="space-y-2">
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload($event, 'user')"
              class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-500 file:text-white hover:file:bg-primary-600"
            />
            <p class="text-xs text-text-tertiary">
              Upload a photo (will be uploaded to ImgBB) or paste a URL below
            </p>
            <HIGInput
              v-model="userForm.photo_url"
              label="Or paste photo URL"
              placeholder="https://example.com/photo.jpg"
              type="url"
            />
            <div v-if="userForm.photo_url" class="mt-2">
              <img 
                :src="userForm.photo_url" 
                alt="Photo Preview" 
                class="w-24 h-24 rounded-full object-cover border border-border-primary"
                @error="userForm.photo_url = ''"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <input
            id="userAdmin"
            v-model="userForm.is_admin"
            type="checkbox"
            class="w-4 h-4 text-primary-500 bg-bg-secondary border-border-primary rounded focus:ring-primary-500"
          />
          <label for="userAdmin" class="text-sm font-medium text-text-primary">
            Admin privileges
          </label>
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeUserModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : 'Update' }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Delete Modals for other entities -->
    <HIGModal
      v-model:is-open="showDeleteCategoryModal"
      title="Delete Category"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-text-primary">
          Are you sure you want to delete "<strong>{{ categoryToDelete?.title }}</strong>"? This will also delete all pages in this category. This action cannot be undone.
        </p>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <HIGButton variant="tertiary" @click="showDeleteCategoryModal = false" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="danger" @click="handleDeleteCategory" :disabled="deleting" class="w-full sm:w-auto">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>

    <HIGModal
      v-model:is-open="showDeletePageModal"
      title="Delete Page"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-text-primary">
          Are you sure you want to delete "<strong>{{ pageToDelete?.title }}</strong>"? This action cannot be undone.
        </p>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <HIGButton variant="tertiary" @click="showDeletePageModal = false" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="danger" @click="handleDeletePage" :disabled="deleting" class="w-full sm:w-auto">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>

    <HIGModal
      v-model:is-open="showDeleteToolModal"
      title="Delete Tool"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-text-primary">
          Are you sure you want to delete "<strong>{{ toolToDelete?.name }}</strong>"? This action cannot be undone.
        </p>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <HIGButton variant="tertiary" @click="showDeleteToolModal = false" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="danger" @click="handleDeleteTool" :disabled="deleting" class="w-full sm:w-auto">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>

    <!-- Blog Category Modal -->
    <HIGModal
      v-model:is-open="showBlogCategoryModal"
      :title="editingBlogCategory ? 'Edit Blog Category' : 'Create New Blog Category'"
      size="lg"
    >
      <form @submit.prevent="handleSubmitBlogCategory" class="space-y-4">
        <HIGInput
          v-model="blogCategoryForm.name"
          label="Name"
          placeholder="Enter category name"
          required
        />
        <HIGInput
          v-model="blogCategoryForm.slug"
          label="Slug"
          placeholder="category-slug"
          hint="URL-friendly version of the name"
          required
        />
        <div>
          <label class="block text-sm font-medium text-text-primary mb-2">Description</label>
          <textarea
            v-model="blogCategoryForm.description"
            placeholder="Brief description of the category"
            rows="3"
            class="w-full px-4 py-2 bg-bg-secondary border border-border-primary rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y"
          />
        </div>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-border-primary">
          <HIGButton variant="tertiary" type="button" @click="closeBlogCategoryModal" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="primary" type="submit" :disabled="submitting" class="w-full sm:w-auto">
            {{ submitting ? 'Saving...' : (editingBlogCategory ? 'Update' : 'Create') }}
          </HIGButton>
        </div>
      </form>
    </HIGModal>

    <!-- Delete Blog Category Modal -->
    <HIGModal
      v-model:is-open="showDeleteBlogCategoryModal"
      title="Delete Blog Category"
      size="sm"
    >
      <div class="space-y-4">
        <p class="text-text-primary">
          Are you sure you want to delete "<strong>{{ blogCategoryToDelete?.name }}</strong>"? 
          <span v-if="getBlogsInCategory(blogCategoryToDelete?.name).length > 0">
            This category has {{ getBlogsInCategory(blogCategoryToDelete?.name).length }} post(s). 
            They will be set to "Uncategorized".
          </span>
          This action cannot be undone.
        </p>
        <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
          <HIGButton variant="tertiary" @click="showDeleteBlogCategoryModal = false" class="w-full sm:w-auto">
            Cancel
          </HIGButton>
          <HIGButton variant="danger" @click="handleDeleteBlogCategory" :disabled="deleting" class="w-full sm:w-auto">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </HIGButton>
        </div>
      </div>
    </HIGModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { supabase } from '../supabase'
import { useAuth } from '../composables/useAuth'
import HIGCard from '../components/hig/HIGCard.vue'
import HIGButton from '../components/hig/HIGButton.vue'
import HIGInput from '../components/hig/HIGInput.vue'
import HIGModal from '../components/hig/HIGModal.vue'
import HIGSpinner from '../components/hig/HIGSpinner.vue'
import MarkdownEditor from '../components/MarkdownEditor.vue'
import Icon from '../components/Icon.vue'
import slugify from 'slugify'
import { uploadImageToImgBB } from '../utils/imgbb'

const store = useStore()
const { user } = useAuth()
const route = useRoute()

// State
const activeTab = ref('blog')
const loadingBlogs = ref(false)
const loadingCategories = ref(false)
const loadingPages = ref(false)
const loadingTools = ref(false)
const loadingUsers = ref(false)
const loadingBlogCategories = ref(false)
const submitting = ref(false)
const deleting = ref(false)

// Data
const blogs = ref<any[]>([])
const categories = ref<any[]>([])
const pages = ref<any[]>([])
const tools = ref<any[]>([])
const users = ref<any[]>([])
const blogCategoriesList = ref<any[]>([])
const expandedCategories = ref<Record<string, boolean>>({})
const expandedCategorySections = ref<Record<string, boolean>>({
  tutorial: true, // Default to expanded
  blog: true // Default to expanded
})

// Search and filters
const blogSearchQuery = ref('')
const blogFilterCategory = ref('')
const blogFilterStatus = ref('')
const toolSearchQuery = ref('')
const toolFilterCategory = ref('')
const toolFilterFeatured = ref('')
const userSearchQuery = ref('')

// Modals
const showBlogModal = ref(false)
const showCategoryModal = ref(false)
const showPageModal = ref(false)
const showToolModal = ref(false)
const showUserModal = ref(false)
const showDeleteModal = ref(false)
const showDeleteCategoryModal = ref(false)
const showDeletePageModal = ref(false)
const showDeleteToolModal = ref(false)
const showBlogCategoryModal = ref(false)
const showDeleteBlogCategoryModal = ref(false)
const showExerciseModal = ref(false)
const showQAModal = ref(false)
const showProjectModal = ref(false)

// Editing states
const editingBlog = ref<any>(null)
const editingCategory = ref<any>(null)
const editingPage = ref<any>(null)
const editingTool = ref<any>(null)
const editingUser = ref<any>(null)
const editingBlogCategory = ref<any>(null)
const editingExercise = ref<any>(null)
const editingQA = ref<any>(null)
const editingProject = ref<any>(null)

// Current page context for exercises/QA/projects
const currentPageForExercise = ref<any>(null)
const currentPageForQA = ref<any>(null)
const currentPageForProject = ref<any>(null)

// Delete targets
const blogToDelete = ref<any>(null)
const categoryToDelete = ref<any>(null)
const pageToDelete = ref<any>(null)
const toolToDelete = ref<any>(null)
const blogCategoryToDelete = ref<any>(null)

// Forms
const blogForm = ref({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  category: '',
  featured_image_url: '',
  read_time: 5,
  published: false
})

const categoryForm = ref({
  title: '',
  slug: '',
  description: '',
  level: 'Beginner',
  duration: 30,
  published: false
})

const pageForm = ref({
  category_id: '',
  title: '',
  slug: '',
  content: '',
  page_order: 0,
  page_type: 'content',
  published: false
})

// Exercise form
const exerciseForm = ref({
  exercise_type: 'code_editor',
  language: 'javascript',
  starter_code: '',
  solution_code: '',
  instructions: '',
  points: 10
})
const testCasesJson = ref('[]')
const optionsJson = ref('[]')
const hintsJson = ref('[]')

// QA form
const qaForm = ref({
  question_type: 'multiple_choice',
  question_text: '',
  correct_answer: '',
  explanation: '',
  points: 5,
  order_index: 0,
  language: 'javascript'
})
const qaOptionsJson = ref('[]')
const qaCorrectAnswersJson = ref('[]')

// Project form
const projectForm = ref({
  language: 'javascript',
  starter_code: '',
  points: 50
})
const requirementsText = ref('')
const projectTestCasesJson = ref('[]')
const projectHintsText = ref('')

const toolForm = ref({
  name: '',
  description: '',
  category: '',
  url: '',
  logo_url: '',
  is_featured: false
})

const userForm = ref({
  display_name: '',
  email: '',
  photo_url: '',
  is_admin: false
})

const blogCategoryForm = ref({
  name: '',
  slug: '',
  description: ''
})

const tabs = [
  { id: 'tutorials', label: 'Tutorials' },
  { id: 'blog', label: 'Blog Posts' },
  { id: 'tools', label: 'Tools' },
  { id: 'users', label: 'Users' }
]

// Computed
const stats = computed(() => ({
  blogs: blogs.value.length,
  tutorials: categories.value.length,
  tools: tools.value.length,
  users: users.value.length
}))

const blogCategories = computed(() => {
  // Use blogCategoriesList if available, otherwise fall back to extracting from blogs
  if (blogCategoriesList.value.length > 0) {
    return blogCategoriesList.value.map(cat => cat.name).sort()
  }
  const cats = new Set(blogs.value.map(b => b.category).filter(Boolean))
  return Array.from(cats).sort()
})

const toolCategories = computed(() => {
  const cats = new Set(tools.value.map(t => t.category).filter(Boolean))
  return Array.from(cats).sort()
})

const filteredBlogs = computed(() => {
  let filtered = blogs.value

  if (blogSearchQuery.value) {
    const query = blogSearchQuery.value.toLowerCase()
    filtered = filtered.filter(b => 
      b.title.toLowerCase().includes(query) ||
      (b.excerpt && b.excerpt.toLowerCase().includes(query)) ||
      (b.category && b.category.toLowerCase().includes(query))
    )
  }

  if (blogFilterCategory.value) {
    filtered = filtered.filter(b => b.category === blogFilterCategory.value)
  }

  if (blogFilterStatus.value) {
    filtered = filtered.filter(b => 
      blogFilterStatus.value === 'published' ? b.published : !b.published
    )
  }

  // Sort by newest date first
  return filtered.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime()
    const dateB = new Date(b.created_at).getTime()
    return dateB - dateA // Descending order (newest first)
  })
})

const filteredTools = computed(() => {
  let filtered = tools.value

  if (toolSearchQuery.value) {
    const query = toolSearchQuery.value.toLowerCase()
    filtered = filtered.filter(t => 
      t.name.toLowerCase().includes(query) ||
      (t.description && t.description.toLowerCase().includes(query)) ||
      (t.category && t.category.toLowerCase().includes(query))
    )
  }

  if (toolFilterCategory.value) {
    filtered = filtered.filter(t => t.category === toolFilterCategory.value)
  }

  if (toolFilterFeatured.value === 'true') {
    filtered = filtered.filter(t => t.is_featured)
  }

  return filtered
})

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value

  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(u => 
    (u.display_name && u.display_name.toLowerCase().includes(query)) ||
    (u.email && u.email.toLowerCase().includes(query))
  )
})

// Methods
const tabButtonClasses = (tabId: string) => [
  'px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap',
  {
    'text-primary-500 border-primary-500': activeTab.value === tabId,
    'text-text-secondary border-transparent hover:text-text-primary': activeTab.value !== tabId
  }
]

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c.category_id === categoryId)
  return category ? category.title : 'Unknown'
}

const getCategoryPages = (categoryId: string) => {
  return pages.value
    .filter(page => page.category_id === categoryId)
    .sort((a, b) => (a.page_order || 0) - (b.page_order || 0))
}

const categoriesWithPages = computed(() => {
  return categories.value
    .filter(cat => {
      const categoryPages = pages.value.filter(page => page.category_id === cat.category_id)
      return categoryPages.length > 0
    })
    .sort((a, b) => {
      const aName = a.title || ''
      const bName = b.title || ''
      return aName.localeCompare(bName)
    })
})

const toggleCategory = (categoryId: string) => {
  expandedCategories.value[categoryId] = !expandedCategories.value[categoryId]
}

const toggleCategorySection = (section: 'tutorial' | 'blog') => {
  expandedCategorySections.value[section] = !expandedCategorySections.value[section]
}

// Fetch functions
const fetchBlogs = async () => {
  try {
    loadingBlogs.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Blog fetch error:', error)
      throw error
    }
    blogs.value = data || []
  } catch (error: any) {
    console.error('Error fetching blogs:', error)
    const errorMessage = error.message || error.code || 'Failed to load blogs'
    store.dispatch('addNotification', {
      type: 'error',
      message: `Failed to load blogs: ${errorMessage}. Make sure you've run the admin policy SQL script.`
    })
  } finally {
    loadingBlogs.value = false
  }
}

const fetchCategories = async () => {
  try {
    loadingCategories.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { data, error } = await supabase
      .from('tutorials_category')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    categories.value = data || []
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to load categories'
    })
  } finally {
    loadingCategories.value = false
  }
}

const fetchPages = async () => {
  try {
    loadingPages.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { data, error } = await supabase
      .from('tutorial_pages')
      .select('*')
      .order('page_order', { ascending: true })

    if (error) throw error
    pages.value = data || []
  } catch (error: any) {
    console.error('Error fetching pages:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to load pages'
    })
  } finally {
    loadingPages.value = false
  }
}

const fetchTools = async () => {
  try {
    loadingTools.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    tools.value = data || []
  } catch (error: any) {
    console.error('Error fetching tools:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to load tools'
    })
  } finally {
    loadingTools.value = false
  }
}

const fetchUsers = async () => {
  try {
    loadingUsers.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    users.value = data || []
  } catch (error: any) {
    console.error('Error fetching users:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to load users'
    })
  } finally {
    loadingUsers.value = false
  }
}

const fetchBlogCategories = async () => {
  try {
    loadingBlogCategories.value = true
    // Try to fetch from blog_categories table, if it doesn't exist, we'll create it on first use
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      // If table doesn't exist, create it
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        console.log('blog_categories table does not exist, will be created on first category creation')
        blogCategoriesList.value = []
        return
      }
      throw error
    }
    blogCategoriesList.value = data || []
  } catch (error: any) {
    console.error('Error fetching blog categories:', error)
    // Don't show error if table doesn't exist - it will be created on first use
    if (error.code !== '42P01' && !error.message?.includes('does not exist')) {
      store.dispatch('addNotification', {
        type: 'error',
        message: 'Failed to load blog categories'
      })
    }
    blogCategoriesList.value = []
  } finally {
    loadingBlogCategories.value = false
  }
}

// Reload all data from Supabase to ensure fresh data
const reloadAllData = async () => {
  console.log('Reloading all data from Supabase...')
  try {
    // Reload all data in parallel for better performance
    await Promise.all([
      fetchBlogs(),
      fetchCategories(),
      fetchPages(),
      fetchTools(),
      fetchUsers(),
      fetchBlogCategories()
    ])
    console.log('All data reloaded successfully')
  } catch (error) {
    console.error('Error reloading data:', error)
    // Don't show error notification here - individual fetch functions handle their own errors
  }
}

// Blog functions
const openCreateModal = () => {
  editingBlog.value = null
  blogForm.value = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    featured_image_url: '',
    read_time: 5,
    published: false
  }
  showBlogModal.value = true
}

const editBlog = (blog: any) => {
  editingBlog.value = blog
  blogForm.value = {
    title: blog.title,
    slug: blog.slug,
    excerpt: blog.excerpt || '',
    content: blog.content,
    category: blog.category || '',
    featured_image_url: blog.featured_image_url || '',
    read_time: blog.read_time || 5,
    published: blog.published || false
  }
  showBlogModal.value = true
}

const closeBlogModal = () => {
  showBlogModal.value = false
  editingBlog.value = null
}

// Image upload handler
const handleImageUpload = async (event: Event, type: 'blog' | 'tool' | 'user') => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  try {
    submitting.value = true
    
    // Upload to ImgBB
    const response = await uploadImageToImgBB(file)
    
    // Set the URL based on type
    if (type === 'blog') {
      blogForm.value.featured_image_url = response.data.url
    } else if (type === 'tool') {
      toolForm.value.logo_url = response.data.url
    } else if (type === 'user') {
      userForm.value.photo_url = response.data.url
    }
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Image uploaded successfully to ImgBB'
    })
    
    // Reset file input
    target.value = ''
  } catch (error: any) {
    console.error('Error uploading image:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to upload image'
    })
  } finally {
    submitting.value = false
  }
}

const handleSubmitBlog = async () => {
  try {
    submitting.value = true

    if (!user.value) {
      throw new Error('User not authenticated')
    }

    // Supabase session is automatically managed - use user from store
    // The auth listener ensures the store user is always in sync with the session
    const authorId = user.value.uid

    // Validate required fields
    if (!blogForm.value.title || !blogForm.value.title.trim()) {
      throw new Error('Title is required')
    }
    if (!blogForm.value.slug || !blogForm.value.slug.trim()) {
      throw new Error('Slug is required')
    }
    if (!blogForm.value.content || !blogForm.value.content.trim()) {
      throw new Error('Content is required')
    }

    const blogData = {
      title: blogForm.value.title.trim(),
      slug: blogForm.value.slug.trim(),
      excerpt: blogForm.value.excerpt?.trim() || null,
      content: blogForm.value.content.trim(),
      category: blogForm.value.category?.trim() || null,
      featured_image_url: blogForm.value.featured_image_url?.trim() || null,
      read_time: blogForm.value.read_time || 5,
      author_id: authorId, // Use author_id to reference the users table
      published: blogForm.value.published || false,
      published_at: blogForm.value.published ? new Date().toISOString() : null
    }

    console.log('Saving blog:', { 
      isEdit: !!editingBlog.value, 
      blogData,
      userId: user.value.uid,
      userIsAdmin: user.value.isAdmin,
      userEmail: user.value.email
    })

    if (editingBlog.value) {
      console.log('Attempting to update blog:', {
        blogId: editingBlog.value.id,
        blogData,
        userId: user.value.uid
      })

      const { data, error } = await supabase
        .from('blogs')
        .update(blogData)
        .eq('id', editingBlog.value.id)
        .select()

      console.log('Update response:', { data, error, hasData: !!data, dataLength: data?.length })

      if (error) {
        console.error('Update error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        })
        throw error
      }
      
      if (!data || data.length === 0) {
        console.error('Update returned no data - this usually means RLS policy blocked the update')
        throw new Error('Update succeeded but no data returned. The UPDATE policy may be missing a WITH CHECK clause. Run the fix script: 27_fix_blogs_update_policy.sql')
      }
      
      console.log('Blog updated successfully:', data)
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Blog post updated successfully'
      })
    } else {
      console.log('Attempting to insert blog:', {
        blogData,
        userId: user.value.uid,
        userIsAdmin: user.value.isAdmin,
        userEmail: user.value.email
      })

      const { data, error } = await supabase
        .from('blogs')
        .insert(blogData)
        .select()

      console.log('Insert response:', { 
        data, 
        error, 
        hasData: !!data, 
        dataLength: data?.length,
        hasError: !!error
      })

      if (error) {
        console.error('Insert error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
          fullError: error
        })
        throw error
      }
      
      if (!data || data.length === 0) {
        console.error('Insert returned no data - this usually means RLS policy blocked the insert or prevented returning data')
        // Check if we can verify the insert actually happened by querying
        const { data: verifyData, error: verifyError } = await supabase
          .from('blogs')
          .select('id, title, slug')
          .eq('slug', blogData.slug)
          .eq('author_id', authorId)
          .limit(1)
        
        if (verifyError) {
          console.error('Verification query error:', verifyError)
        }
        
        if (verifyData && verifyData.length > 0) {
          console.log('Blog was actually created (verified by query):', verifyData)
          store.dispatch('addNotification', {
            type: 'success',
            message: 'Blog post created successfully (insert succeeded but RLS prevented data return)'
          })
          closeBlogModal()
          await reloadAllData()
          return
        }
        
        throw new Error('Insert succeeded but no data returned. This usually means RLS policy blocked the insert. Check the browser console and ensure you have INSERT permission on the blogs table.')
      }
      
      console.log('Blog created successfully:', data)
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Blog post created successfully'
      })
    }

    closeBlogModal()
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error saving blog - Full error object:', error)
    
    // Build comprehensive error message
    let errorMessage = 'Failed to save blog post'
    
    if (error.message) {
      errorMessage = error.message
    } else if (error.details) {
      errorMessage = error.details
    } else if (error.hint) {
      errorMessage = error.hint
    }
    
    // Add specific guidance for common errors
    if (error.code === '42501' || error.message?.includes('permission') || error.message?.includes('policy')) {
      errorMessage = 'Permission denied. Make sure you are logged in as an admin user. Check the browser console for details.'
    } else if (error.code === '23505') {
      errorMessage = `Duplicate slug: "${blogForm.value.slug}" already exists. Please use a different slug.`
    } else if (error.code === '23503') {
      errorMessage = 'Invalid author_id. Please sign out and sign in again.'
    }
    
    console.error('Error message to display:', errorMessage)
    store.dispatch('addNotification', {
      type: 'error',
      message: errorMessage
    })
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (blog: any) => {
  blogToDelete.value = blog
  showDeleteModal.value = true
}

const handleDeleteBlog = async () => {
  if (!blogToDelete.value) return

  try {
    deleting.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', blogToDelete.value.id)

    if (error) throw error

    store.dispatch('addNotification', {
      type: 'success',
      message: 'Blog post deleted successfully'
    })

    showDeleteModal.value = false
    blogToDelete.value = null
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error deleting blog:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to delete blog post'
    })
  } finally {
    deleting.value = false
  }
}

// Category functions
const openCreateCategoryModal = () => {
  editingCategory.value = null
  categoryForm.value = {
    title: '',
    slug: '',
    description: '',
    level: 'Beginner',
    duration: 30,
    published: false
  }
  showCategoryModal.value = true
}

const editCategory = (category: any) => {
  editingCategory.value = category
  categoryForm.value = {
    title: category.title,
    slug: category.slug,
    description: category.description || '',
    level: category.level || 'Beginner',
    duration: category.duration || 30,
    published: category.published || false
  }
  showCategoryModal.value = true
}

const closeCategoryModal = () => {
  showCategoryModal.value = false
  editingCategory.value = null
}

const handleSubmitCategory = async () => {
  try {
    submitting.value = true

    if (!user.value) {
      throw new Error('User not authenticated')
    }

    // Supabase session is automatically managed - no need to call getSession()

    const categoryData = {
      ...categoryForm.value,
      author_id: user.value.uid,
      published_at: categoryForm.value.published ? new Date().toISOString() : null
    }

    if (editingCategory.value) {
      const { error } = await supabase
        .from('tutorials_category')
        .update(categoryData)
        .eq('category_id', editingCategory.value.category_id)

      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Category updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('tutorials_category')
        .insert(categoryData)

      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Category created successfully'
      })
    }

    closeCategoryModal()
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error saving category:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save category'
    })
  } finally {
    submitting.value = false
  }
}

const confirmDeleteCategory = (category: any) => {
  categoryToDelete.value = category
  showDeleteCategoryModal.value = true
}

const handleDeleteCategory = async () => {
  if (!categoryToDelete.value) return

  try {
    deleting.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { error } = await supabase
      .from('tutorials_category')
      .delete()
      .eq('category_id', categoryToDelete.value.category_id)

    if (error) throw error

    store.dispatch('addNotification', {
      type: 'success',
      message: 'Category deleted successfully'
    })

    showDeleteCategoryModal.value = false
    categoryToDelete.value = null
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error deleting category:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to delete category'
    })
  } finally {
    deleting.value = false
  }
}

// Page functions
const openCreatePageModal = () => {
  editingPage.value = null
  pageForm.value = {
    category_id: '',
    title: '',
    slug: '',
    content: '',
    page_order: 0,
    page_type: 'content',
    published: false
  }
  showPageModal.value = true
}

const editPage = (page: any) => {
  editingPage.value = page
  pageForm.value = {
    category_id: page.category_id,
    title: page.title,
    slug: page.slug,
    content: page.content || '',
    page_order: page.page_order || 0,
    page_type: page.page_type || 'content',
    published: page.published || false
  }
  showPageModal.value = true
}

const closePageModal = () => {
  showPageModal.value = false
  editingPage.value = null
}

const handleSubmitPage = async () => {
  try {
    submitting.value = true
    // Supabase session is automatically managed - no need to call getSession()

    const pageData = {
      ...pageForm.value,
      published_at: pageForm.value.published ? new Date().toISOString() : null
    }

    if (editingPage.value) {
      const { error } = await supabase
        .from('tutorial_pages')
        .update(pageData)
        .eq('id', editingPage.value.id)

      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Page updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('tutorial_pages')
        .insert(pageData)

      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Page created successfully'
      })
    }

    closePageModal()
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error saving page:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save page'
    })
  } finally {
    submitting.value = false
  }
}

const confirmDeletePage = (page: any) => {
  pageToDelete.value = page
  showDeletePageModal.value = true
}

// Exercise management functions
const manageExercises = async (page: any) => {
  currentPageForExercise.value = page
  editingExercise.value = null
  exerciseForm.value = {
    exercise_type: 'code_editor',
    language: 'javascript',
    starter_code: '',
    solution_code: '',
    instructions: '',
    points: 10
  }
  testCasesJson.value = '[]'
  optionsJson.value = '[]'
  hintsJson.value = '[]'
  
  // Load existing exercises for this page
  try {
    const { data, error } = await supabase
      .from('tutorial_exercises')
      .select('*')
      .eq('tutorial_page_id', page.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (!error && data) {
      editingExercise.value = data
      exerciseForm.value = {
        exercise_type: data.exercise_type || 'code_editor',
        language: data.language || 'javascript',
        starter_code: data.starter_code || '',
        solution_code: data.solution_code || '',
        instructions: data.instructions || '',
        points: data.points || 10
      }
      testCasesJson.value = JSON.stringify(data.test_cases || [], null, 2)
      optionsJson.value = JSON.stringify(data.options || [], null, 2)
      hintsJson.value = JSON.stringify(data.hints || [], null, 2)
    }
  } catch (error) {
    console.error('Error loading exercise:', error)
  }
  
  showExerciseModal.value = true
}

const closeExerciseModal = () => {
  showExerciseModal.value = false
  editingExercise.value = null
  currentPageForExercise.value = null
}

const handleSubmitExercise = async () => {
  try {
    submitting.value = true
    
    let testCases = []
    let options = []
    let hints = []
    
    try {
      testCases = JSON.parse(testCasesJson.value || '[]')
    } catch {
      testCases = []
    }
    
    try {
      options = JSON.parse(optionsJson.value || '[]')
    } catch {
      options = []
    }
    
    try {
      hints = JSON.parse(hintsJson.value || '[]')
    } catch {
      hints = []
    }
    
    const exerciseData = {
      tutorial_page_id: currentPageForExercise.value.id,
      exercise_type: exerciseForm.value.exercise_type,
      language: exerciseForm.value.language,
      starter_code: exerciseForm.value.starter_code,
      solution_code: exerciseForm.value.solution_code,
      test_cases: testCases,
      instructions: exerciseForm.value.instructions,
      hints: hints,
      points: exerciseForm.value.points,
      options: options,
      correct_answer: exerciseForm.value.correct_answer
    }
    
    if (editingExercise.value) {
      const { error } = await supabase
        .from('tutorial_exercises')
        .update(exerciseData)
        .eq('id', editingExercise.value.id)
      
      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Exercise updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('tutorial_exercises')
        .insert(exerciseData)
      
      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Exercise created successfully'
      })
    }
    
    closeExerciseModal()
  } catch (error: any) {
    console.error('Error saving exercise:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save exercise'
    })
  } finally {
    submitting.value = false
  }
}

const manageQAQuestions = async (page: any) => {
  currentPageForQA.value = page
  editingQA.value = null
  qaForm.value = {
    question_type: 'multiple_choice',
    question_text: '',
    correct_answer: '',
    explanation: '',
    points: 5,
    order_index: 0,
    language: 'javascript'
  }
  qaOptionsJson.value = '[]'
  qaCorrectAnswersJson.value = '[]'
  showQAModal.value = true
}

const closeQAModal = () => {
  showQAModal.value = false
  editingQA.value = null
  currentPageForQA.value = null
}

const handleSubmitQA = async () => {
  try {
    submitting.value = true
    
    let options = []
    let correctAnswers = []
    
    try {
      options = JSON.parse(qaOptionsJson.value || '[]')
    } catch {
      options = []
    }
    
    try {
      correctAnswers = JSON.parse(qaCorrectAnswersJson.value || '[]')
    } catch {
      if (qaForm.value.correct_answer) {
        correctAnswers = [qaForm.value.correct_answer]
      }
    }
    
    const qaData = {
      tutorial_page_id: currentPageForQA.value.id,
      question_type: qaForm.value.question_type,
      question_text: qaForm.value.question_text,
      options: options.length > 0 ? options : null,
      correct_answer: qaForm.value.correct_answer,
      correct_answers: correctAnswers.length > 0 ? correctAnswers : null,
      explanation: qaForm.value.explanation,
      points: qaForm.value.points,
      order_index: qaForm.value.order_index
    }
    
    if (editingQA.value) {
      const { error } = await supabase
        .from('tutorial_qa_questions')
        .update(qaData)
        .eq('id', editingQA.value.id)
      
      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Q&A question updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('tutorial_qa_questions')
        .insert(qaData)
      
      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Q&A question created successfully'
      })
    }
    
    closeQAModal()
  } catch (error: any) {
    console.error('Error saving Q&A question:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save Q&A question'
    })
  } finally {
    submitting.value = false
  }
}

const manageProject = async (page: any) => {
  currentPageForProject.value = page
  editingProject.value = null
  projectForm.value = {
    language: 'javascript',
    starter_code: '',
    points: 50
  }
  requirementsText.value = ''
  projectTestCasesJson.value = '[]'
  projectHintsText.value = ''
  
  // Load existing project config
  try {
    const { data, error } = await supabase
      .from('tutorial_exercises')
      .select('*')
      .eq('tutorial_page_id', page.id)
      .limit(1)
      .maybeSingle()
    
    if (!error && data) {
      editingProject.value = data
      projectForm.value = {
        language: data.language || 'javascript',
        starter_code: data.starter_code || '',
        points: data.points || 50
      }
      projectTestCasesJson.value = JSON.stringify(data.test_cases || [], null, 2)
      projectHintsText.value = Array.isArray(data.hints) ? data.hints.join('\n') : ''
      
      if (page.exercise_config?.requirements) {
        requirementsText.value = Array.isArray(page.exercise_config.requirements) 
          ? page.exercise_config.requirements.join('\n')
          : ''
      }
    } else if (page.exercise_config) {
      projectForm.value.language = page.exercise_config.language || 'javascript'
      projectForm.value.starter_code = page.exercise_config.starter_code || ''
      if (page.exercise_config.requirements) {
        requirementsText.value = Array.isArray(page.exercise_config.requirements)
          ? page.exercise_config.requirements.join('\n')
          : ''
      }
    }
  } catch (error) {
    console.error('Error loading project:', error)
  }
  
  showProjectModal.value = true
}

const closeProjectModal = () => {
  showProjectModal.value = false
  editingProject.value = null
  currentPageForProject.value = null
}

const handleSubmitProject = async () => {
  try {
    submitting.value = true
    
    let testCases = []
    let hints = []
    let requirements = []
    
    try {
      testCases = JSON.parse(projectTestCasesJson.value || '[]')
    } catch {
      testCases = []
    }
    
    hints = projectHintsText.value.split('\n').filter(h => h.trim())
    requirements = requirementsText.value.split('\n').filter(r => r.trim())
    
    // Update page exercise_config
    const exerciseConfig = {
      language: projectForm.value.language,
      starter_code: projectForm.value.starter_code,
      requirements: requirements,
      test_cases: testCases,
      hints: hints,
      points: projectForm.value.points
    }
    
    const { error: pageError } = await supabase
      .from('tutorial_pages')
      .update({ exercise_config: exerciseConfig })
      .eq('id', currentPageForProject.value.id)
    
    if (pageError) throw pageError
    
    // Also create/update exercise entry
    const exerciseData = {
      tutorial_page_id: currentPageForProject.value.id,
      exercise_type: 'code_editor',
      language: projectForm.value.language,
      starter_code: projectForm.value.starter_code,
      test_cases: testCases,
      instructions: currentPageForProject.value.content || '',
      hints: hints,
      points: projectForm.value.points
    }
    
    if (editingProject.value) {
      const { error } = await supabase
        .from('tutorial_exercises')
        .update(exerciseData)
        .eq('id', editingProject.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('tutorial_exercises')
        .insert(exerciseData)
      
      if (error) throw error
    }
    
    store.dispatch('addNotification', {
      type: 'success',
      message: 'Project configured successfully'
    })
    
    closeProjectModal()
    await reloadAllData()
  } catch (error: any) {
    console.error('Error saving project:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save project'
    })
  } finally {
    submitting.value = false
  }
}

const handleDeletePage = async () => {
  if (!pageToDelete.value) return

  try {
    deleting.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { error } = await supabase
      .from('tutorial_pages')
      .delete()
      .eq('id', pageToDelete.value.id)

    if (error) throw error

    store.dispatch('addNotification', {
      type: 'success',
      message: 'Page deleted successfully'
    })

    showDeletePageModal.value = false
    pageToDelete.value = null
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error deleting page:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to delete page'
    })
  } finally {
    deleting.value = false
  }
}

// Tool functions
const openCreateToolModal = () => {
  editingTool.value = null
  toolForm.value = {
    name: '',
    description: '',
    category: '',
    url: '',
    logo_url: '',
    is_featured: false
  }
  showToolModal.value = true
}

const editTool = (tool: any) => {
  editingTool.value = tool
  toolForm.value = {
    name: tool.name,
    description: tool.description || '',
    category: tool.category || '',
    url: tool.url,
    logo_url: tool.logo_url || '',
    is_featured: tool.is_featured || false
  }
  showToolModal.value = true
}

const closeToolModal = () => {
  showToolModal.value = false
  editingTool.value = null
}

const handleSubmitTool = async () => {
  try {
    submitting.value = true
    // Supabase session is automatically managed - no need to call getSession()

    if (editingTool.value) {
      const { error } = await supabase
        .from('tools')
        .update(toolForm.value)
        .eq('id', editingTool.value.id)

      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Tool updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('tools')
        .insert(toolForm.value)

      if (error) throw error
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Tool created successfully'
      })
    }

    closeToolModal()
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error saving tool:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save tool'
    })
  } finally {
    submitting.value = false
  }
}

const confirmDeleteTool = (tool: any) => {
  toolToDelete.value = tool
  showDeleteToolModal.value = true
}

const handleDeleteTool = async () => {
  if (!toolToDelete.value) return

  try {
    deleting.value = true
    // Supabase session is automatically managed - no need to call getSession()
    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolToDelete.value.id)

    if (error) throw error

    store.dispatch('addNotification', {
      type: 'success',
      message: 'Tool deleted successfully'
    })

    showDeleteToolModal.value = false
    toolToDelete.value = null
    // Reload all data to ensure fresh state
    await reloadAllData()
  } catch (error: any) {
    console.error('Error deleting tool:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to delete tool'
    })
  } finally {
    deleting.value = false
  }
}

// User functions
const editUser = (userData: any) => {
  editingUser.value = userData
  userForm.value = {
    display_name: userData.display_name || '',
    email: userData.email || '',
    photo_url: userData.photo_url || '',
    is_admin: userData.is_admin || false
  }
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  editingUser.value = null
}

const handleSubmitUser = async () => {
  if (!editingUser.value) return

  try {
    submitting.value = true
    // Supabase session is automatically managed - no need to call getSession()

    const { error } = await supabase
      .from('users')
      .update({
        display_name: userForm.value.display_name,
        photo_url: userForm.value.photo_url,
        is_admin: userForm.value.is_admin
      })
      .eq('id', editingUser.value.id)

    if (error) throw error

    store.dispatch('addNotification', {
      type: 'success',
      message: 'User updated successfully'
    })

    closeUserModal()
    // Reload all data to ensure fresh state (especially important for admin status changes)
    await reloadAllData()
  } catch (error: any) {
    console.error('Error updating user:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to update user'
    })
  } finally {
    submitting.value = false
  }
}

// Blog Category functions
const openCreateBlogCategoryModal = () => {
  editingBlogCategory.value = null
  blogCategoryForm.value = {
    name: '',
    slug: '',
    description: ''
  }
  showBlogCategoryModal.value = true
}

const editBlogCategory = (category: any) => {
  editingBlogCategory.value = category
  blogCategoryForm.value = {
    name: category.name,
    slug: category.slug || slugify(category.name, { lower: true, strict: true }),
    description: category.description || ''
  }
  showBlogCategoryModal.value = true
}

const closeBlogCategoryModal = () => {
  showBlogCategoryModal.value = false
  editingBlogCategory.value = null
}

const handleSubmitBlogCategory = async () => {
  try {
    submitting.value = true

    if (!user.value) {
      throw new Error('User not authenticated')
    }

    // Validate required fields
    if (!blogCategoryForm.value.name || !blogCategoryForm.value.name.trim()) {
      throw new Error('Category name is required')
    }
    if (!blogCategoryForm.value.slug || !blogCategoryForm.value.slug.trim()) {
      throw new Error('Category slug is required')
    }

    const categoryData = {
      name: blogCategoryForm.value.name.trim(),
      slug: blogCategoryForm.value.slug.trim(),
      description: blogCategoryForm.value.description?.trim() || null
    }

    if (editingBlogCategory.value) {
      const { error } = await supabase
        .from('blog_categories')
        .update(categoryData)
        .eq('id', editingBlogCategory.value.id)

      if (error) {
        // If table doesn't exist, try to create it first
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          await createBlogCategoriesTable()
          // Retry the update
          const { error: retryError } = await supabase
            .from('blog_categories')
            .update(categoryData)
            .eq('id', editingBlogCategory.value.id)
          if (retryError) throw retryError
        } else {
          throw error
        }
      }
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Blog category updated successfully'
      })
    } else {
      const { error } = await supabase
        .from('blog_categories')
        .insert(categoryData)

      if (error) {
        // If table doesn't exist, try to create it first
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          await createBlogCategoriesTable()
          // Retry the insert
          const { error: retryError } = await supabase
            .from('blog_categories')
            .insert(categoryData)
          if (retryError) throw retryError
        } else {
          throw error
        }
      }
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Blog category created successfully'
      })
    }

    closeBlogCategoryModal()
    await reloadAllData()
  } catch (error: any) {
    console.error('Error saving blog category:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: error.message || 'Failed to save blog category'
    })
  } finally {
    submitting.value = false
  }
}

const createBlogCategoriesTable = async () => {
  // Note: This requires the table to be created in Supabase
  // We'll just show a helpful error message if it fails
  store.dispatch('addNotification', {
    type: 'info',
    message: 'Please create the blog_categories table in Supabase. Run: CREATE TABLE blog_categories (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name TEXT NOT NULL UNIQUE, slug TEXT NOT NULL UNIQUE, description TEXT, created_at TIMESTAMPTZ DEFAULT NOW());'
  })
}

const confirmDeleteBlogCategory = (category: any) => {
  blogCategoryToDelete.value = category
  showDeleteBlogCategoryModal.value = true
}

const handleDeleteBlogCategory = async () => {
  if (!blogCategoryToDelete.value) return

  try {
    deleting.value = true

    // First, update all blogs with this category to have null category
    const blogsWithCategory = blogs.value.filter(b => b.category === blogCategoryToDelete.value.name)
    if (blogsWithCategory.length > 0) {
      const { error: updateError } = await supabase
        .from('blogs')
        .update({ category: null })
        .in('id', blogsWithCategory.map(b => b.id))

      if (updateError) {
        console.error('Error updating blogs:', updateError)
        // Continue with deletion even if update fails
      }
    }

    // Then delete the category
    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', blogCategoryToDelete.value.id)

    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        // Table doesn't exist, nothing to delete
        store.dispatch('addNotification', {
          type: 'info',
          message: 'Category removed from blogs'
        })
      } else {
        throw error
      }
    } else {
      store.dispatch('addNotification', {
        type: 'success',
        message: 'Blog category deleted successfully'
      })
    }

    showDeleteBlogCategoryModal.value = false
    blogCategoryToDelete.value = null
    await reloadAllData()
  } catch (error: any) {
    console.error('Error deleting blog category:', error)
    store.dispatch('addNotification', {
      type: 'error',
      message: 'Failed to delete blog category'
    })
  } finally {
    deleting.value = false
  }
}

const getBlogsInCategory = (categoryName: string) => {
  if (!categoryName) return []
  return blogs.value.filter(b => b.category === categoryName)
}

// Auto-generate slugs
watch(() => blogForm.value.title, (newTitle) => {
  // Only auto-generate slug when creating (not editing)
  if (!editingBlog.value && newTitle) {
    // Always auto-generate slug from title when creating
    blogForm.value.slug = slugify(newTitle, { lower: true, strict: true })
  }
})

watch(() => categoryForm.value.title, (newTitle) => {
  if (!editingCategory.value && newTitle) {
    categoryForm.value.slug = slugify(newTitle, { lower: true, strict: true })
  }
})

watch(() => pageForm.value.title, (newTitle) => {
  if (!editingPage.value && newTitle) {
    pageForm.value.slug = slugify(newTitle, { lower: true, strict: true })
  }
})

watch(() => blogCategoryForm.value.name, (newName) => {
  if (!editingBlogCategory.value && newName) {
    blogCategoryForm.value.slug = slugify(newName, { lower: true, strict: true })
  }
})

// Load data when tab changes
watch(activeTab, (newTab) => {
  if (newTab === 'blog') {
    if (blogs.value.length === 0) fetchBlogs()
    if (blogCategoriesList.value.length === 0) fetchBlogCategories()
  }
  if (newTab === 'tutorials') {
    if (categories.value.length === 0) fetchCategories()
    if (pages.value.length === 0) fetchPages()
  }
  if (newTab === 'tools' && tools.value.length === 0) fetchTools()
  if (newTab === 'users' && users.value.length === 0) fetchUsers()
})

// Diagnostic function to check admin status and permissions
const checkAdminStatus = async () => {
  if (!user.value) {
    console.warn('No user logged in')
    return
  }

  try {
    // Supabase session is automatically managed - no need to call getSession()
    
    // Check user in database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, is_admin, display_name')
      .eq('id', user.value.uid)
      .single()

    if (userError) {
      console.error('Error fetching user from database')
    } else {
      if (userData?.is_admin !== user.value.isAdmin) {
        console.warn('⚠️ Admin status mismatch detected')
        // Update store with correct admin status
        store.dispatch('setUser', {
          ...user.value,
          isAdmin: userData?.is_admin || false
        })
      }
    }

    // Test if we can insert a test blog (will be rolled back)
    const testBlogData = {
      title: 'TEST - DELETE ME',
      slug: `test-${Date.now()}`,
      content: 'This is a test',
      author_id: user.value.uid,
      published: false
    }

    const { data: testData, error: testError } = await supabase
      .from('blogs')
      .insert(testBlogData)
      .select()

    if (testError) {
      console.error('❌ Blog insert test failed:', {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint
      })
    } else {
      console.log('✅ Blog insert test succeeded!')
      // Delete the test blog
      if (testData && testData[0]) {
        await supabase
          .from('blogs')
          .delete()
          .eq('id', testData[0].id)
        console.log('Test blog deleted')
      }
    }
  } catch (err) {
    console.error('Error in admin status check:', err)
  }
}

onMounted(async () => {
  // Check admin status first
  await checkAdminStatus()
  
  // Handle query parameters for navigation
  const tabParam = route.query.tab as string
  const editParam = route.query.edit as string
  
  if (tabParam && ['blog', 'tutorials', 'tools', 'users'].includes(tabParam)) {
    activeTab.value = tabParam
    
    // If edit parameter is provided, open the edit modal after data is loaded
    if (editParam) {
      // Wait for data to load, then open edit modal
      if (tabParam === 'blog') {
        await fetchBlogs()
        // Find and edit the blog
        const blogToEdit = blogs.value.find(b => b.id === editParam)
        if (blogToEdit) {
          editBlog(blogToEdit)
        }
      } else if (tabParam === 'tutorials') {
        await fetchPages()
        // Find and edit the page
        const pageToEdit = pages.value.find(p => p.id === editParam)
        if (pageToEdit) {
          editPage(pageToEdit)
        }
      }
    } else {
      // Just fetch data for the tab
      if (tabParam === 'blog') fetchBlogs()
      if (tabParam === 'tutorials') {
        fetchCategories()
        fetchPages()
      }
      if (tabParam === 'tools') fetchTools()
      if (tabParam === 'users') fetchUsers()
    }
  } else {
    // Default: fetch all data
    fetchBlogs()
    fetchBlogCategories()
    fetchCategories()
    fetchPages()
    fetchTools()
    fetchUsers()
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

<style>
/* Remove any progress bar or loading line animation at the top of the page */
#nprogress,
.nprogress-bar,
.nprogress-progress,
.nprogress-spinner,
[class*="nprogress"],
[class*="progress-bar"][style*="position: fixed"],
[class*="progress-bar"][style*="position:fixed"],
[style*="position: fixed"][style*="top: 0"][style*="height: 2px"],
[style*="position: fixed"][style*="top: 0"][style*="height: 3px"],
[style*="position: fixed"][style*="top: 0"][style*="height: 4px"],
[style*="position:fixed"][style*="top:0"][style*="height:2px"],
[style*="position:fixed"][style*="top:0"][style*="height:3px"],
[style*="position:fixed"][style*="top:0"][style*="height:4px"] {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  pointer-events: none !important;
}

/* Hide any pseudo-elements that might create a progress line */
body::before,
html::before {
  content: none !important;
}
</style>
