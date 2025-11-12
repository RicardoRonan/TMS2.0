import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are missing
// Don't throw immediately - create a dummy client to prevent app crash
// This allows the app to load and show error messages
let supabase: ReturnType<typeof createClient>

if (!supabaseUrl || !supabaseAnonKey) {
  const missing = []
  if (!supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
  
  console.error('❌ Missing Supabase environment variables:', missing.join(', '))
  console.error('💡 The app will load but Supabase features will not work')
  console.error('💡 Set these in Netlify: Site configuration → Environment variables')
  
  // Create a dummy client with placeholder values to prevent app crash
  // This allows the app to mount and show error messages
  supabase = createClient(
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
  // Create a single supabase client for interacting with your database
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
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

// Export the supabase client
export { supabase }
export default supabase

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url !== 'https://placeholder.supabase.co' && key !== 'placeholder-key')
}
