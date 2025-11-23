/**
 * Cache utility with localStorage persistence and TTL support
 * Provides a simple interface for caching data with expiration
 */

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
}

export type CacheType = 'blogs' | 'tutorials' | 'tools' | 'categories' | 'tutorialPages' | 'blogPosts' | 'tutorialGroups' | 'blogCategories'

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const CACHE_PREFIX = 'tms_cache_'

/**
 * Get cache key for a given type
 */
function getCacheKey(type: CacheType): string {
  return `${CACHE_PREFIX}${type}`
}

/**
 * Check if cache entry is still valid (not expired)
 */
export function isCacheValid<T>(entry: CacheEntry<T> | null): boolean {
  if (!entry) return false
  const now = Date.now()
  const age = now - entry.timestamp
  return age < entry.ttl
}

/**
 * Get cached data from localStorage
 */
export function getCachedData<T>(type: CacheType): T | null {
  try {
    const key = getCacheKey(type)
    const cached = localStorage.getItem(key)
    
    if (!cached) return null
    
    const entry: CacheEntry<T> = JSON.parse(cached)
    
    if (isCacheValid(entry)) {
      return entry.data
    } else {
      // Cache expired, remove it
      localStorage.removeItem(key)
      return null
    }
  } catch (err) {
    console.warn(`Failed to get cached data for ${type}:`, err)
    // Clear corrupted cache
    try {
      localStorage.removeItem(getCacheKey(type))
    } catch {
      // Ignore cleanup errors
    }
    return null
  }
}

/**
 * Set cached data in localStorage
 */
export function setCachedData<T>(type: CacheType, data: T, ttl: number = DEFAULT_TTL): void {
  try {
    const key = getCacheKey(type)
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (err) {
    console.warn(`Failed to set cached data for ${type}:`, err)
    // If storage is full, try to clear old caches
    if (err instanceof DOMException && err.code === 22) {
      clearOldCaches()
      // Retry once
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl
        }
        localStorage.setItem(getCacheKey(type), JSON.stringify(entry))
      } catch (retryErr) {
        console.error(`Failed to cache ${type} after cleanup:`, retryErr)
      }
    }
  }
}

/**
 * Clear cached data for a specific type or all caches
 */
export function clearCache(type?: CacheType): void {
  try {
    if (type) {
      localStorage.removeItem(getCacheKey(type))
    } else {
      // Clear all cache entries
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    }
  } catch (err) {
    console.warn('Failed to clear cache:', err)
  }
}

/**
 * Clear expired caches to free up space
 */
function clearOldCaches(): void {
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached)
            if (!isCacheValid(entry)) {
              localStorage.removeItem(key)
            }
          }
        } catch {
          // If we can't parse it, remove it
          localStorage.removeItem(key)
        }
      }
    })
  } catch (err) {
    console.warn('Failed to clear old caches:', err)
  }
}

/**
 * Get cache age in milliseconds
 */
export function getCacheAge(type: CacheType): number | null {
  try {
    const key = getCacheKey(type)
    const cached = localStorage.getItem(key)
    
    if (!cached) return null
    
    const entry: CacheEntry = JSON.parse(cached)
    return Date.now() - entry.timestamp
  } catch {
    return null
  }
}

/**
 * Check if cache exists and is valid
 */
export function hasValidCache(type: CacheType): boolean {
  const data = getCachedData(type)
  return data !== null
}

// Clean up expired caches on module load
if (typeof window !== 'undefined') {
  clearOldCaches()
}

