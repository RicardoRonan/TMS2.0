/**
 * SEO utility functions for managing meta tags
 */

interface SEOConfig {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
  twitterCard?: 'summary' | 'summary_large_image'
}

/**
 * Updates the page title
 */
export function setPageTitle(title: string): void {
  if (typeof document !== 'undefined') {
    document.title = title
  }
}

/**
 * Updates or creates a meta tag
 */
function setMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  if (typeof document === 'undefined') return

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

/**
 * Updates Open Graph meta tags
 */
function setOpenGraphTags(config: SEOConfig): void {
  if (config.title) {
    setMetaTag('og:title', config.title, 'property')
  }
  if (config.description) {
    setMetaTag('og:description', config.description, 'property')
  }
  if (config.image) {
    setMetaTag('og:image', config.image, 'property')
  }
  if (config.url) {
    setMetaTag('og:url', config.url, 'property')
  }
  if (config.type) {
    setMetaTag('og:type', config.type, 'property')
  }
  if (config.siteName) {
    setMetaTag('og:site_name', config.siteName, 'property')
  }
}

/**
 * Updates Twitter Card meta tags
 */
function setTwitterCardTags(config: SEOConfig): void {
  const cardType = config.twitterCard || 'summary'
  setMetaTag('twitter:card', cardType, 'name')
  
  if (config.title) {
    setMetaTag('twitter:title', config.title, 'name')
  }
  if (config.description) {
    setMetaTag('twitter:description', config.description, 'name')
  }
  if (config.image) {
    setMetaTag('twitter:image', config.image, 'name')
  }
}

/**
 * Sets comprehensive SEO meta tags for a page
 */
export function setSEO(config: SEOConfig): void {
  // Set page title
  if (config.title) {
    setPageTitle(config.title)
  }

  // Set description
  if (config.description) {
    setMetaTag('description', config.description)
  }

  // Set Open Graph tags
  setOpenGraphTags(config)

  // Set Twitter Card tags
  setTwitterCardTags(config)
}

/**
 * Gets the current page URL
 */
export function getCurrentURL(): string {
  if (typeof window === 'undefined') return ''
  return window.location.href
}

/**
 * Gets the site base URL
 */
export function getBaseURL(): string {
  if (typeof window === 'undefined') return ''
  return `${window.location.protocol}//${window.location.host}`
}

