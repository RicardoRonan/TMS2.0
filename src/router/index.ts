import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from 'vuex'

// Lazy-loaded views
const Home = () => import('../views/Home.vue')
const About = () => import('../views/About.vue')
const Blog = () => import('../views/Blog.vue')
const BlogPost = () => import('../views/BlogPost.vue')
const Tools = () => import('../views/Tools.vue')
const Tutorials = () => import('../views/Tutorials.vue')
const TutorialPage = () => import('../views/TutorialPage.vue')
// const Projects = () => import('../views/Projects.vue')
const Contact = () => import('../views/Contact.vue')
const Admin = () => import('../views/Admin.vue')
const Profile = () => import('../views/Profile.vue')
const Settings = () => import('../views/Settings.vue')
const AuthCallback = () => import('../views/AuthCallback.vue')
const NotFound = () => import('../views/NotFound.vue')
const ComingSoon = () => import('../views/ComingSoon.vue')
const PrivacyPolicy = () => import('../views/PrivacyPolicy.vue')
const TermsOfService = () => import('../views/TermsOfService.vue')
const CookiePolicy = () => import('../views/CookiePolicy.vue')
const DMCA = () => import('../views/DMCA.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: 'MetaStack - Developer Community Platform' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: 'About - MetaStack' }
  },
  {
    path: '/blog',
    name: 'Blog',
    component: Blog,
    meta: { title: 'Blog - MetaStack' }
  },
  {
    path: '/blog/:slug',
    name: 'BlogPost',
    component: BlogPost,
    meta: { title: 'Blog Post - MetaStack' }
  },
  {
    path: '/tools',
    name: 'Tools',
    component: Tools,
    meta: { title: 'Tools - MetaStack' }
  },
  {
    path: '/tutorials',
    name: 'Tutorials',
    component: Tutorials,
    meta: { title: 'Tutorials - MetaStack' }
  },
  {
    path: '/tutorials/:categorySlug/:pageSlug',
    name: 'TutorialPage',
    component: TutorialPage,
    meta: { title: 'Tutorial Page - MetaStack' }
  },
  // {
  //   path: '/projects',
  //   name: 'Projects',
  //   component: Projects,
  //   meta: { title: 'Projects - MetaStack' }
  // },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact,
    meta: { title: 'Contact - MetaStack' }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin,
    meta: { 
      title: 'Admin - MetaStack',
      requiresAuth: true,
      requiresAdmin: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { 
      title: 'Profile - MetaStack',
      requiresAuth: true
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { 
      title: 'Settings - MetaStack',
      requiresAuth: true
    }
  },
  {
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback,
    meta: { title: 'Signing in...' }
  },
  {
    path: '/coming-soon',
    name: 'ComingSoon',
    component: ComingSoon,
    meta: { title: 'Coming Soon - MetaStack' }
  },
  {
    path: '/legal/privacy-policy',
    name: 'PrivacyPolicy',
    component: PrivacyPolicy,
    meta: { title: 'Privacy Policy - MetaStack' }
  },
  {
    path: '/legal/terms-of-service',
    name: 'TermsOfService',
    component: TermsOfService,
    meta: { title: 'Terms of Service - MetaStack' }
  },
  {
    path: '/legal/cookie-policy',
    name: 'CookiePolicy',
    component: CookiePolicy,
    meta: { title: 'Cookie Policy - MetaStack' }
  },
  {
    path: '/legal/dmca',
    name: 'DMCA',
    component: DMCA,
    meta: { title: 'DMCA Policy - MetaStack' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { title: 'Page Not Found - MetaStack' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const store = useStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // Supabase session is automatically managed by the auth listener in useAuth
  // No need to call getSession() here - it's unnecessary and can cause delays
  
  // Check authentication
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    next({ name: 'Home' })
    return
  }
  
  // Check admin access
  if (to.meta.requiresAdmin && !store.getters.currentUser?.isAdmin) {
    next({ name: 'Home' })
    return
  }
  
  next()
})

export default router

