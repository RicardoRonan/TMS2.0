import { createClient } from '@supabase/supabase-js'

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
    detectSessionInUrl: true, // Note: With PKCE flow, code exchange must be handled manually in AuthCallback
    flowType: 'pkce' // Use PKCE flow for better security and CORS handling
      },
      global: {
        headers: {
      'x-client-info': 'supabase-js-vue'
    }
  }
})

export default supabase

// Helper to check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey && 
    typeof supabaseUrl === 'string' && 
    typeof supabaseAnonKey === 'string' &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey.trim() !== '')
}