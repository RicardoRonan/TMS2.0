<template>
  <nav class="mobile-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary border-t border-border-primary">
    <div class="flex items-center justify-around h-16 px-2">
      <router-link
        v-for="item in navItems"
        :key="item.name"
        :to="item.href"
        class="flex flex-col items-center justify-center flex-1 min-w-0 px-2 py-1 transition-colors relative pt-2"
        :class="bottomNavLinkClasses(item.href)"
      >
        <Icon
          :name="item.icon"
          :size="22"
        />
        <span class="text-xs mt-0.5 font-medium">{{ item.name }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import Icon from './Icon.vue'

const route = useRoute()

const navItems = [
  { name: 'Home', href: '/', icon: 'home' },
  { name: 'Blog', href: '/blog', icon: 'blog' },
  { name: 'Tools', href: '/tools', icon: 'tool' },
  { name: 'Contact', href: '/contact', icon: 'phone' }
]

const bottomNavLinkClasses = (href: string) => {
  const isActive = route.path === href || 
    (href !== '/' && route.path.startsWith(href))
  
  return {
    'text-primary-500': isActive,
    'text-text-secondary hover:text-text-primary': !isActive
  }
}
</script>

<style scoped>
/* WhatsApp-style bottom navigation */
.mobile-bottom-nav {
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  background-color: var(--color-bg-secondary);
}

/* Active state indicator */
.router-link-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50%;
  height: 3px;
  background-color: var(--color-primary-500);
  border-radius: 0 0 3px 3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>

