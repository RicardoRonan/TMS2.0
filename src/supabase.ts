import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy initialization: client is created when first accessed
// This ensures environment variables are always checked fresh
let supabaseInstance: SupabaseClient | null = null

function getSupabaseClient(): SupabaseClient {
  // Always check environment variables fresh (not cached)
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Check if we have valid environment variables
  const hasValidEnv = !!(supabaseUrl && supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' && 
    supabaseAnonKey !== 'placeholder-key')

  // Check if current instance is a dummy client
  const currentIsDummy = supabaseInstance && 
    (supabaseInstance as any).supabaseUrl === 'https://placeholder.supabase.co'

  // Recreate client if:
  // 1. No client exists yet
  // 2. We have valid env vars but current client is dummy
  // 3. We don't have valid env vars but current client is not dummy
  if (!supabaseInstance || (hasValidEnv && currentIsDummy) || (!hasValidEnv && !currentIsDummy)) {
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
          // Add fetch with timeout for better reliability
          fetch: (url, options = {}) => {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout
            
            return fetch(url, {
              ...options,
              signal: controller.signal
            }).catch(err => {
              // Handle network errors gracefully
              if (err.name === 'AbortError' || err.name === 'TimeoutError') {
                throw new Error('Request timeout - please check your connection')
              }
              throw err
            }).finally(() => {
              clearTimeout(timeoutId)
            })
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
    }
  }
  
  return supabaseInstance
}

// Export a Proxy that ensures we always get a valid client
// This intercepts all property access and ensures lazy initialization
export const supabase = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseClient()
    const value = (client as any)[prop]
    
    // If it's a function, bind it to the client to maintain 'this' context
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  }
})

export default supabase

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key')
}
