// Initialize authentication state on app startup
// This ensures users stay logged in after page reload
import { supabase } from '../supabase'
import type { User } from '@supabase/supabase-js'

export async function initializeAuth(store: any): Promise<void> {
  try {
    // Check for existing session (with timeout to prevent hanging)
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ data: { session: null } }), 5000)
    )
    
    const result = await Promise.race([sessionPromise, timeoutPromise]) as any
    const { data: { session }, error } = result || { data: { session: null }, error: null }
    
    if (error) {
      return
    }
    
    if (session?.user) {
      await loadUserData(session.user, store)
    } else {
      store.dispatch('setUser', null)
    }
  } catch (err: any) {
    // Don't throw - allow app to continue loading
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

