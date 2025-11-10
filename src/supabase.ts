import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug logging
console.log('Supabase Config Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  keyLength: supabaseAnonKey?.length || 0
})

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = `Missing Supabase environment variables. 
  URL: ${supabaseUrl ? 'OK' : 'MISSING'}
  Key: ${supabaseAnonKey ? 'OK' : 'MISSING'}
  
  Please check your .env file exists in the project root and contains:
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  
  After creating/updating .env, restart your dev server.`
  
  console.error(errorMsg)
  throw new Error(errorMsg)
}

// Create a single supabase client for interacting with your database
// Configuration follows Supabase best practices
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    // Add flow type to help with token refresh
    flowType: 'pkce'
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-client-info': 'tms2.0'
    }
  },
  // Real-time configuration
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Note: Connection test removed - getSession() can hang in some environments
// Network connectivity is confirmed via direct fetch tests in diagnoseSupabase
// The client will work fine for actual auth operations (signIn, signUp, etc.)
console.log('Supabase client created successfully')

export default supabase

