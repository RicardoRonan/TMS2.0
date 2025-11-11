import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Log environment variable status (helpful for debugging)
if (typeof window !== 'undefined') {
  console.log('Supabase Environment Check:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
    keyLength: supabaseAnonKey?.length || 0,
    mode: import.meta.env.MODE,
    dev: import.meta.env.DEV,
    prod: import.meta.env.PROD
  })
}

// Check if environment variables are missing
const missingEnvVars = !supabaseUrl || !supabaseAnonKey

if (missingEnvVars) {
  const errorMsg = `Missing Supabase environment variables. 
  URL: ${supabaseUrl ? 'OK' : 'MISSING'}
  Key: ${supabaseAnonKey ? 'OK' : 'MISSING'}
  
  For local development: Check your .env file exists in the project root and contains:
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  
  For production: Set these as environment variables in your hosting platform:
  - Vercel: Add them in Project Settings > Environment Variables
  - Netlify: Add them in Site Settings > Environment Variables
  - Other platforms: Check their documentation for setting environment variables
  
  After setting environment variables, rebuild and redeploy your application.`
  
  console.error(errorMsg)
  
  // In production, create a dummy client to prevent app crash
  // This allows the app to load and show error messages
  if (import.meta.env.PROD) {
    console.warn('⚠️ Creating dummy Supabase client - features will not work until environment variables are set')
  } else {
    // In development, throw to alert developer immediately
    throw new Error(errorMsg)
  }
}

// Create a single supabase client for interacting with your database
// Configuration follows Supabase best practices
// Use placeholder values if env vars are missing (production only)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    // Add flow type to help with token refresh
    flowType: 'pkce',
    // Ensure session persists - localStorage is already set above, this is just for clarity
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

export default supabase

