import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Track the credentials used to create the current instance
// This ensures we only recreate when credentials actually change
let supabaseInstance: SupabaseClient | null = null
let currentSupabaseUrl: string | null = null
let currentSupabaseKey: string | null = null

// Initialize client immediately if env vars are available
// This ensures session can be restored from localStorage right away
function initializeClientIfNeeded() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Check for valid env vars (also check for empty strings)
  const hasValidEnv = !!(supabaseUrl && supabaseAnonKey && 
    typeof supabaseUrl === 'string' && 
    typeof supabaseAnonKey === 'string' &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key')

  if (hasValidEnv && !supabaseInstance) {
    // Create client immediately if we have valid env vars
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'supabase.auth.token',
        flowType: 'pkce',
        storageType: 'localStorage',
        debug: import.meta.env.DEV,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'x-client-info': 'tms2.0'
        },
        fetch: async (url, options = {}) => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 30000)
          
          // Track if this is a retry to avoid infinite loops
          const isRetry = (options as any)?._isRetry || false
          
          try {
            const response = await fetch(url, {
              ...options,
              signal: controller.signal
            })
            
            // Check for auth errors (401, 403) and handle session refresh
            if ((response.status === 401 || response.status === 403) && !isRetry) {
              clearTimeout(timeoutId)
              
              // Check if this is a Supabase API request (not auth endpoint itself)
              const urlStr = typeof url === 'string' ? url : url.toString()
              const isAuthEndpoint = urlStr.includes('/auth/v1/')
              
              // Only retry for non-auth endpoints to avoid infinite loops
              if (!isAuthEndpoint && supabaseInstance) {
                console.log('🔄 Session expired, attempting to refresh and retry request...')
                
                try {
                  // Attempt to refresh the session
                  const { data: { session }, error: refreshError } = await supabaseInstance.auth.refreshSession()
                  
                  if (!refreshError && session) {
                    console.log('✅ Session refreshed successfully, retrying original request...')
                    
                    // Retry the original request with refreshed session
                    const retryOptions = {
                      ...options,
                      _isRetry: true
                    }
                    
                    // Clone the request body if it exists (since it can only be read once)
                    let retryBody = options.body
                    if (options.body && typeof options.body === 'string') {
                      retryBody = options.body
                    } else if (options.body instanceof FormData) {
                      retryBody = options.body
                    } else if (options.body) {
                      // For other body types, try to preserve them
                      retryBody = options.body
                    }
                    
                    const retryController = new AbortController()
                    const retryTimeoutId = setTimeout(() => retryController.abort(), 30000)
                    
                    try {
                      const retryResponse = await fetch(url, {
                        ...retryOptions,
                        body: retryBody,
                        signal: retryController.signal
                      })
                      clearTimeout(retryTimeoutId)
                      return retryResponse
                    } catch (retryErr: any) {
                      clearTimeout(retryTimeoutId)
                      if (retryErr.name === 'AbortError' || retryErr.name === 'TimeoutError') {
                        throw new Error('Request timeout - please check your connection')
                      }
                      throw retryErr
                    }
                  } else {
                    console.warn('⚠️ Session refresh failed:', refreshError)
                    // Return the original response if refresh failed
                    return response
                  }
                } catch (refreshErr) {
                  console.error('❌ Error during session refresh:', refreshErr)
                  // Return the original response if refresh errored
                  return response
                }
              }
            }
            
            return response
          } catch (err: any) {
            clearTimeout(timeoutId)
            if (err.name === 'AbortError' || err.name === 'TimeoutError') {
              throw new Error('Request timeout - please check your connection')
            }
            throw err
          }
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })
    currentSupabaseUrl = supabaseUrl
    currentSupabaseKey = supabaseAnonKey
  }
}

// Initialize immediately if env vars are available
if (typeof window !== 'undefined') {
  initializeClientIfNeeded()
}

function getSupabaseClient(): SupabaseClient {
  // Always check environment variables fresh (not cached)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Check if we have valid environment variables
  // Also check for empty strings (which can happen if env vars are set but empty)
  const hasValidEnv = !!(supabaseUrl && supabaseAnonKey && 
    typeof supabaseUrl === 'string' && 
    typeof supabaseAnonKey === 'string' &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '' &&
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key')

  // Check if credentials have changed from what we used to create the current instance
  const credentialsChanged = 
    currentSupabaseUrl !== supabaseUrl || 
    currentSupabaseKey !== supabaseAnonKey

  // Recreate client if:
  // 1. No client exists yet
  // 2. Credentials have changed (env vars updated)
  // 3. We have valid env vars but current client was created with invalid ones
  // 4. We don't have valid env vars but current client was created with valid ones
  const needsRecreation = 
    !supabaseInstance || 
    credentialsChanged ||
    (hasValidEnv && (!currentSupabaseUrl || currentSupabaseUrl === 'https://placeholder.supabase.co')) ||
    (!hasValidEnv && currentSupabaseUrl && currentSupabaseUrl !== 'https://placeholder.supabase.co')

  if (needsRecreation) {
    if (!hasValidEnv) {
      const missing = []
      if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
      if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
      
      console.error('❌ Missing Supabase environment variables:', missing.join(', '))
      console.error('💡 The app will load but Supabase features will not work')
      console.error('💡 Set these in Netlify: Site configuration → Environment variables')
      
      // Create a dummy client with placeholder values to prevent app crash
      supabaseInstance = createClient(
        'https://placeholder.supabase.co',
        'placeholder-key',
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          }
        }
      )
      currentSupabaseUrl = 'https://placeholder.supabase.co'
      currentSupabaseKey = 'placeholder-key'
    } else {
      // Create a real supabase client with valid credentials
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'supabase.auth.token',
          flowType: 'pkce',
          // Ensure session persists across page reloads
          storageType: 'localStorage',
          // Add retry logic for network issues
          debug: import.meta.env.DEV,
        },
        db: {
          schema: 'public'
        },
        global: {
          headers: {
            'x-client-info': 'tms2.0'
          },
          // Add fetch with timeout for better reliability and automatic session refresh
          fetch: async (url, options = {}) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
            
            // Track if this is a retry to avoid infinite loops
            const isRetry = (options as any)?._isRetry || false
            
            try {
              const response = await fetch(url, {
                ...options,
                signal: controller.signal
              })
              
              // Check for auth errors (401, 403) and handle session refresh
              if ((response.status === 401 || response.status === 403) && !isRetry) {
                clearTimeout(timeoutId)
                
                // Check if this is a Supabase API request (not auth endpoint itself)
                const urlStr = typeof url === 'string' ? url : url.toString()
                const isAuthEndpoint = urlStr.includes('/auth/v1/')
                
                // Only retry for non-auth endpoints to avoid infinite loops
                if (!isAuthEndpoint && supabaseInstance) {
                  console.log('🔄 Session expired, attempting to refresh and retry request...')
                  
                  try {
                    // Attempt to refresh the session
                    const { data: { session }, error: refreshError } = await supabaseInstance.auth.refreshSession()
                    
                    if (!refreshError && session) {
                      console.log('✅ Session refreshed successfully, retrying original request...')
                      
                      // Retry the original request with refreshed session
                      const retryOptions = {
                        ...options,
                        _isRetry: true
                      }
                      
                      // Clone the request body if it exists (since it can only be read once)
                      let retryBody = options.body
                      if (options.body && typeof options.body === 'string') {
                        retryBody = options.body
                      } else if (options.body instanceof FormData) {
                        retryBody = options.body
                      } else if (options.body) {
                        // For other body types, try to preserve them
                        retryBody = options.body
                      }
                      
                      const retryController = new AbortController()
                      const retryTimeoutId = setTimeout(() => retryController.abort(), 30000)
                      
                      try {
                        const retryResponse = await fetch(url, {
                          ...retryOptions,
                          body: retryBody,
                          signal: retryController.signal
                        })
                        clearTimeout(retryTimeoutId)
                        return retryResponse
                      } catch (retryErr: any) {
                        clearTimeout(retryTimeoutId)
                        if (retryErr.name === 'AbortError' || retryErr.name === 'TimeoutError') {
                          throw new Error('Request timeout - please check your connection')
                        }
                        throw retryErr
                      }
                    } else {
                      console.warn('⚠️ Session refresh failed:', refreshError)
                      // Return the original response if refresh failed
                      return response
                    }
                  } catch (refreshErr) {
                    console.error('❌ Error during session refresh:', refreshErr)
                    // Return the original response if refresh errored
                    return response
                  }
                }
              }
              
              return response
            } catch (err: any) {
              clearTimeout(timeoutId)
              if (err.name === 'AbortError' || err.name === 'TimeoutError') {
                throw new Error('Request timeout - please check your connection')
              }
              throw err
            }
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
      // Track the credentials we used
      currentSupabaseUrl = supabaseUrl
      currentSupabaseKey = supabaseAnonKey
    }
  }
  
  return supabaseInstance
}

// Get the client instance (will create if needed)
// This ensures we always have a valid client, but keeps the instance stable
// Note: initializeClientIfNeeded() runs first (above), so if env vars are available,
// the client will already be created. Otherwise, getSupabaseClient() will handle it.
const supabase = getSupabaseClient()

// Debug: Log client status (both dev and production for debugging)
if (typeof window !== 'undefined') {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  const hasEnv = !!(url && key && 
    typeof url === 'string' && 
    typeof key === 'string' &&
    url.trim() !== '' &&
    key.trim() !== '')
  
  if (hasEnv) {
    console.log('✅ Supabase client initialized with valid credentials')
    console.log('📍 Supabase URL:', url.substring(0, 30) + '...')
  } else {
    console.warn('⚠️ Supabase client initialized with placeholder (env vars missing)')
    console.warn('💡 Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify environment variables')
  }
}

// Export the client directly (no Proxy)
// The getSupabaseClient function ensures the instance is stable and only created once
export { supabase }
export default supabase

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && 
    typeof url === 'string' && 
    typeof key === 'string' &&
    url.trim() !== '' &&
    key.trim() !== '' &&
    url !== 'https://placeholder.supabase.co' && 
    key !== 'placeholder-key')
}
