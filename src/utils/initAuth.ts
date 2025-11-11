// Initialize authentication state on app startup
// This ensures users stay logged in after page reload
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

export async function initializeAuth(store: any): Promise<void> {
  try {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('⚠️ Cannot initialize auth: Supabase environment variables are missing')
      console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables')
      return
    }

    // Check for existing session (with longer timeout for better reliability)
    // This is a backup - the auth listener's INITIAL_SESSION event is the primary handler
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ data: { session: null } }), 10000)
    )
    
    const result = await Promise.race([sessionPromise, timeoutPromise]) as any
    const { data: { session }, error } = result || { data: { session: null }, error: null }
    
    if (error) {
      console.warn('Auth initialization error:', error)
      return
    }
    
    if (session?.user) {
      console.log('Session found during auth init, loading user data')
      await loadUserData(session.user, store)
    } else {
      console.log('No session found during auth init')
      store.dispatch('setUser', null)
    }
  } catch (err: any) {
    console.warn('Auth initialization failed:', err)
    // Don't throw - allow app to continue loading
    // The auth listener will handle session restoration
  }
}

async function loadUserData(supabaseUser: User, store: any) {
  try {
    // Try to get user profile from database
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "not found" - user might not have profile yet
    }

    // Update store with user data
    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: userData?.display_name || supabaseUser.user_metadata?.display_name || 'User',
      photoURL: userData?.photo_url || supabaseUser.user_metadata?.avatar_url,
      isAdmin: userData?.is_admin || false,
      createdAt: userData?.created_at || supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: userData?.last_login_at || new Date().toISOString()
    })
  } catch (err: any) {
    // Still set basic user data from auth
    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.display_name || 'User',
      photoURL: supabaseUser.user_metadata?.avatar_url,
      isAdmin: false,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    })
  }
}

