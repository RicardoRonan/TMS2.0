// Cookie utility functions

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  functional: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'cookie_consent'
const COOKIE_PREFERENCES_KEY = 'cookie_preferences'
const COOKIE_CONSENT_EXPIRY_DAYS = 365

// Get cookie value by name
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

// Set cookie
export function setCookie(
  name: string,
  value: string,
  days: number = COOKIE_CONSENT_EXPIRY_DAYS,
  path: string = '/'
): void {
  if (typeof document === 'undefined') return
  
  const date = new Date()
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
  const expires = `expires=${date.toUTCString()}`
  
  document.cookie = `${name}=${value}; ${expires}; path=${path}; SameSite=Lax`
}

// Delete cookie
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') return
  
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; SameSite=Lax`
}

// Check if user has given consent
export function hasCookieConsent(): boolean {
  return getCookie(COOKIE_CONSENT_KEY) === 'true'
}

// Set cookie consent
export function setCookieConsent(consent: boolean): void {
  setCookie(COOKIE_CONSENT_KEY, consent.toString(), COOKIE_CONSENT_EXPIRY_DAYS)
  
  // Also store in localStorage for quick access
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COOKIE_CONSENT_KEY, consent.toString())
    localStorage.setItem(`${COOKIE_CONSENT_KEY}_date`, new Date().toISOString())
  }
}

// Get cookie preferences
export function getCookiePreferences(): CookiePreferences {
  const stored = typeof localStorage !== 'undefined' 
    ? localStorage.getItem(COOKIE_PREFERENCES_KEY) 
    : null
  
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Error parsing cookie preferences:', e)
    }
  }
  
  // Default preferences (essential is always true)
  return {
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  }
}

// Set cookie preferences
export function setCookiePreferences(preferences: CookiePreferences): void {
  // Essential cookies are always enabled
  const prefs = {
    ...preferences,
    essential: true
  }
  
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
  }
  
  // Apply preferences (enable/disable analytics, etc.)
  applyCookiePreferences(prefs)
}

// Apply cookie preferences
export function applyCookiePreferences(preferences: CookiePreferences): void {
  // Essential cookies are always enabled
  // This is where you would enable/disable analytics, marketing tools, etc.
  
  if (preferences.analytics) {
    // Enable analytics cookies (e.g., Google Analytics)
    // Example: gtag('consent', 'update', { analytics_storage: 'granted' })
  } else {
    // Disable analytics cookies
    // Example: gtag('consent', 'update', { analytics_storage: 'denied' })
  }
  
  if (preferences.functional) {
    // Enable functional cookies
  } else {
    // Disable functional cookies
  }
  
  if (preferences.marketing) {
    // Enable marketing cookies
  } else {
    // Disable marketing cookies
  }
}

// Accept all cookies
export function acceptAllCookies(): void {
  setCookieConsent(true)
  const preferences: CookiePreferences = {
    essential: true,
    analytics: true,
    functional: true,
    marketing: true
  }
  setCookiePreferences(preferences)
}

// Reject all non-essential cookies
export function rejectAllCookies(): void {
  setCookieConsent(true)
  const preferences: CookiePreferences = {
    essential: true,
    analytics: false,
    functional: false,
    marketing: false
  }
  setCookiePreferences(preferences)
}

// Clear all cookies (except essential)
export function clearNonEssentialCookies(): void {
  const preferences = getCookiePreferences()
  
  if (!preferences.analytics) {
    // Clear analytics cookies
    deleteCookie('_ga')
    deleteCookie('_gid')
    deleteCookie('_gat')
  }
  
  if (!preferences.functional) {
    // Clear functional cookies
  }
  
  if (!preferences.marketing) {
    // Clear marketing cookies
  }
}

