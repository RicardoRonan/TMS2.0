import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { supabase, isSupabaseConfigured } from '../supabase'
import type { User, AuthError } from '@supabase/supabase-js'

// Singleton pattern to ensure only one auth listener exists
let authListener: { data: { subscription: any } } | null = null
let isListenerInitialized = false
let lastTokenRefreshTime = 0
const TOKEN_REFRESH_DEBOUNCE_MS = 60000 // Only reload user data once per minute for token refreshes

// Helper function to extract display name from user metadata
// Handles different OAuth providers (Google uses full_name, email signup uses display_name)
function getDisplayNameFromMetadata(userMetadata: Record<string, any> | undefined, email?: string): string {
  if (!userMetadata) {
    // If no metadata, try to extract a name from email
    return extractNameFromEmail(email)
  }
  
  // Check various possible name fields (in order of preference)
  const name = userMetadata.display_name || // Email signup
               userMetadata.full_name ||    // Google OAuth
               userMetadata.name ||          // Other OAuth providers
               ''
  
  if (name && name.trim()) {
    return name.trim()
  }
  
  // Fallback: extract name from email
  return extractNameFromEmail(email)
}

// Extract a display name from email (e.g., "john.doe@gmail.com" -> "John Doe")
function extractNameFromEmail(email?: string): string {
  if (!email) return 'User'
  
  const localPart = email.split('@')[0]
  if (!localPart) return 'User'
  
  // Replace dots, underscores, and hyphens with spaces, then capitalize each word
  const name = localPart
    .replace(/[._-]/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return name || 'User'
}

// Initialize auth listener immediately (called from main.ts)
export async function initializeAuthListener(store: any) {
  // Always re-initialize on reload to ensure connection is fresh
  // Clean up existing listener if it exists
  if (authListener?.data?.subscription) {
    try {
      authListener.data.subscription.unsubscribe()
    } catch (err) {
      // Ignore errors during cleanup
    }
    authListener = null
  }
  
  // Reset initialization flag to allow re-initialization
  isListenerInitialized = false
  
  // Check if Supabase is configured before initializing listener
  if (!isSupabaseConfigured()) {
    return
  }

  isListenerInitialized = true

  // Set up the auth state change listener FIRST
  // This ensures INITIAL_SESSION event is captured immediately
  authListener = supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      switch (event) {
        case 'INITIAL_SESSION':
          // This is the primary way sessions are restored on page reload
          // With autoRefreshToken: true, Supabase automatically handles token refresh
          // We should trust the session provided by Supabase
          if (session?.user) {
            try {
              await loadUserDataForStore(session.user, store)
            } catch (err: any) {
              // If loading user data fails, still set basic auth data
              // This ensures the user stays logged in even if profile fetch fails
              store.dispatch('setUser', {
                uid: session.user.id,
                email: session.user.email,
                displayName: getDisplayNameFromMetadata(session.user.user_metadata, session.user.email),
                photoURL: session.user.user_metadata?.avatar_url,
                isAdmin: false,
                createdAt: session.user.created_at || new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              })
            }
          } else {
            // No session in INITIAL_SESSION event - clear user data
            store.dispatch('setUser', null)
          }
          break
        
        case 'SIGNED_IN':
          if (session?.user) {
            try {
              await loadUserDataForStore(session.user, store)
            } catch (err: any) {
              // Fallback to basic auth data if profile load fails
              store.dispatch('setUser', {
                uid: session.user.id,
                email: session.user.email,
                displayName: getDisplayNameFromMetadata(session.user.user_metadata, session.user.email),
                photoURL: session.user.user_metadata?.avatar_url,
                isAdmin: false,
                createdAt: session.user.created_at || new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              })
            }
          }
          break
      
      case 'TOKEN_REFRESHED':
        // Debounce token refresh events to prevent excessive reloads
        const now = Date.now()
        if (now - lastTokenRefreshTime > TOKEN_REFRESH_DEBOUNCE_MS) {
          lastTokenRefreshTime = now
          // Only reload if user data might have changed (skip if same user)
          const currentUser = store.getters.currentUser
          if (!currentUser || currentUser.uid !== session?.user?.id) {
            if (session?.user) {
              await loadUserDataForStore(session.user, store)
            }
          }
        }
        break
      
      case 'SIGNED_OUT':
        // Clear store and localStorage when signed out
        // User signed out - clearing user data
        store.dispatch('setUser', null)
        break
      
      case 'USER_UPDATED':
        if (session?.user) {
          await loadUserDataForStore(session.user, store)
        }
        break
      
      default:
        // For other events, check if we have a session
        if (session?.user) {
          try {
            await loadUserDataForStore(session.user, store)
          } catch (err: any) {
            // Fallback to basic auth data
            store.dispatch('setUser', {
              uid: session.user.id,
              email: session.user.email,
              displayName: getDisplayNameFromMetadata(session.user.user_metadata, session.user.email),
              photoURL: session.user.user_metadata?.avatar_url,
              isAdmin: false,
              createdAt: session.user.created_at || new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            })
          }
        } else {
          store.dispatch('setUser', null)
        }
      }
    } catch (err: any) {
      // If any error occurs in auth state change handler, log it but don't break
      // This ensures the app continues to work even if session restoration fails
      // If we have a session but error occurred, try to set basic user data
      if (session?.user) {
        try {
          store.dispatch('setUser', {
            uid: session.user.id,
            email: session.user.email,
            displayName: getDisplayNameFromMetadata(session.user.user_metadata, session.user.email),
            photoURL: session.user.user_metadata?.avatar_url,
            isAdmin: false,
            createdAt: session.user.created_at || new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          })
        } catch (storeErr) {
          // If even setting basic data fails, clear the store
          store.dispatch('setUser', null)
        }
      } else {
        // No session - ensure store is cleared
        store.dispatch('setUser', null)
      }
    }
  })

  // The INITIAL_SESSION event from the auth listener handles session restoration
  // No need for redundant backup checks - Supabase client automatically restores from localStorage
}

// Helper function to load user data (used by both initializeAuthListener and useAuth)
// This function ensures Supabase session and store are always in sync
async function loadUserDataForStore(supabaseUser: User, store: any) {
  // With autoRefreshToken: true, Supabase automatically manages session validity
  // We can trust the session provided by onAuthStateChange

  try {
    // Try to get user profile from database
    // Use a timeout to prevent hanging
    const profilePromise = supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()
    
    const timeoutPromise = new Promise((resolve) => 
      setTimeout(() => resolve({ data: null, error: { code: 'TIMEOUT', message: 'Profile fetch timeout' } }), 5000)
    )
    
    const { data: userData, error: profileError } = await Promise.race([
      profilePromise,
      timeoutPromise
    ]) as any

    // PGRST116 is "not found" - user might not have profile yet (e.g., first OAuth sign-in)
    // In this case, create the profile with proper name from OAuth metadata
    if (profileError && profileError.code === 'PGRST116') {
      const displayName = getDisplayNameFromMetadata(supabaseUser.user_metadata, supabaseUser.email)
      
      try {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            display_name: displayName,
            photo_url: supabaseUser.user_metadata?.avatar_url,
            is_admin: false,
            created_at: new Date().toISOString(),
            last_login_at: new Date().toISOString()
          })

        if (!insertError) {
          // Fetch the newly created profile
          const { data: newUserData } = await supabase
            .from('users')
            .select('*')
            .eq('id', supabaseUser.id)
            .single()

          if (newUserData) {
            store.dispatch('setUser', {
              uid: supabaseUser.id,
              email: supabaseUser.email,
              displayName: newUserData.display_name || displayName,
              photoURL: newUserData.photo_url || supabaseUser.user_metadata?.avatar_url,
              isAdmin: newUserData.is_admin || false,
              createdAt: newUserData.created_at || supabaseUser.created_at || new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            })
            return
          }
        }
      } catch (insertErr) {
        // If insert fails, continue with auth data only
      }
      
      // Fallback: set store with auth metadata
      store.dispatch('setUser', {
        uid: supabaseUser.id,
        email: supabaseUser.email,
        displayName,
        photoURL: supabaseUser.user_metadata?.avatar_url,
        isAdmin: false,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      })
      return
    }

    // TIMEOUT means the query took too long - continue with auth data
    // Other errors are silently handled - we continue with auth data

    // Check if existing user has generic "User" name but we can get a better one from metadata
    let finalDisplayName = userData?.display_name
    if (userData && userData.display_name === 'User') {
      const betterName = getDisplayNameFromMetadata(supabaseUser.user_metadata, supabaseUser.email)
      if (betterName && betterName !== 'User') {
        // Update the database with the better name
        try {
          await supabase
            .from('users')
            .update({ display_name: betterName })
            .eq('id', supabaseUser.id)
          finalDisplayName = betterName
        } catch (updateErr) {
          // Non-critical, continue with existing name
        }
      }
    }
    if (!finalDisplayName) {
      finalDisplayName = getDisplayNameFromMetadata(supabaseUser.user_metadata, supabaseUser.email)
    }

    // Update store with complete user data
    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: finalDisplayName,
      photoURL: userData?.photo_url || supabaseUser.user_metadata?.avatar_url,
      isAdmin: userData?.is_admin || false,
      createdAt: userData?.created_at || supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: userData?.last_login_at || new Date().toISOString()
    })
  } catch (err: any) {
    // If anything fails, fallback to basic auth user data
    // This ensures the user stays logged in even if profile fetch fails
    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: getDisplayNameFromMetadata(supabaseUser.user_metadata, supabaseUser.email),
      photoURL: supabaseUser.user_metadata?.avatar_url,
      isAdmin: false,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    })
    
    // Re-throw so caller knows there was an error (but user is still logged in)
    throw err
  }
}

// Export cleanup function for app unmount
export function cleanupAuthListener() {
  if (authListener?.data?.subscription) {
    authListener.data.subscription.unsubscribe()
    authListener = null
    isListenerInitialized = false
  }
}

export function useAuth() {
  const store = useStore()
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const user = computed(() => store.getters.currentUser)
  const isAuthenticated = computed(() => store.getters.isAuthenticated)

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      loading.value = true
      error.value = null

      // Check if Supabase is configured before attempting sign-in
      const { isSupabaseConfigured } = await import('../supabase')
      if (!isSupabaseConfigured()) {
        const errorMsg = 'Supabase is not configured. Please check your environment variables (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).'
        throw new Error(errorMsg)
      }

      // Sign-in attempt initiated
      
      // Add timeout to prevent hanging
      // Use 35 seconds to match the fetch timeout (30s) plus a buffer
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          const errorMsg = 'Sign-in request timed out after 35 seconds. This usually means requests are not reaching Supabase. Check your network connection and Supabase project status.'
          reject(new Error(errorMsg))
        }, 35000)
      )
      
      const result = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any
      
      const { data, error: authError } = result || { data: null, error: null }

      if (authError) {
        throw authError
      }
      
      // Sign-in successful

      if (!data.user) {
        throw new Error('No user data returned from authentication')
      }

      if (data.user && data.session) {
        // Update store immediately with auth data (don't wait for profile)
        store.dispatch('setUser', {
          uid: data.user.id,
          email: data.user.email,
          displayName: getDisplayNameFromMetadata(data.user.user_metadata, data.user.email),
          photoURL: data.user.user_metadata?.avatar_url,
          isAdmin: false,
          createdAt: data.user.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        })

        // Try to get user profile from database (non-blocking)
        try {
          const { data: userData, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, try to create it
            try {
              const { error: insertError } = await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: data.user.email,
                  display_name: getDisplayNameFromMetadata(data.user.user_metadata, data.user.email),
                  photo_url: data.user.user_metadata?.avatar_url,
                  is_admin: false,
                  created_at: new Date().toISOString(),
                  last_login_at: new Date().toISOString()
                })

              if (!insertError) {
                // Fetch the newly created profile
                const { data: newUserData } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', data.user.id)
                  .single()

                if (newUserData) {
                  // Update store with complete profile data
                  store.dispatch('setUser', {
                    uid: data.user.id,
                    email: data.user.email,
                    displayName: newUserData.display_name || getDisplayNameFromMetadata(data.user.user_metadata, data.user.email),
                    photoURL: newUserData.photo_url || data.user.user_metadata?.avatar_url,
                    isAdmin: newUserData.is_admin || false,
                    createdAt: newUserData.created_at || data.user.created_at || new Date().toISOString(),
                    lastLoginAt: new Date().toISOString()
                  })
                }
              }
            } catch (insertErr) {
              // Continue with auth data only
            }
          } else if (!profileError && userData) {
            // Profile exists, update store with complete data
            store.dispatch('setUser', {
              uid: data.user.id,
              email: data.user.email,
              displayName: userData.display_name || getDisplayNameFromMetadata(data.user.user_metadata, data.user.email),
              photoURL: userData.photo_url || data.user.user_metadata?.avatar_url,
              isAdmin: userData.is_admin || false,
              createdAt: userData.created_at || data.user.created_at || new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            })

            // Update last login time
            try {
              await supabase
                .from('users')
                .update({ last_login_at: new Date().toISOString() })
                .eq('id', data.user.id)
            } catch (updateErr) {
              // Non-critical, continue
            }
          }
        } catch (profileErr) {
          // Continue with auth data only - user is still signed in
        }

        return data.user
      } else if (data.user) {
        // Session might be null if email confirmation is required
        // Still return user but they may need to confirm email
        throw new Error('Email confirmation required. Please check your email.')
      } else {
        throw new Error('Authentication failed - no user data returned')
      }
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      error.value = errorInfo.message
      // Attach field info to error object for LoginForm to use
      ;(err as any).field = errorInfo.field
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError

      if (data.user) {
        // User profile will be created automatically by the database trigger
        // The trigger uses SECURITY DEFINER so it bypasses RLS policies
        
        // Only try manual insert if we have a session (email confirmation disabled)
        // Otherwise, rely on the trigger which runs automatically
        if (data.session) {
          // Try to create profile manually as fallback (trigger should handle it, but just in case)
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: data.user.email,
              display_name: displayName,
              is_admin: false,
              created_at: new Date().toISOString(),
              last_login_at: new Date().toISOString()
            })

          // Ignore duplicate key errors (trigger might have already created it)
          if (profileError && profileError.code !== '23505') {
            // Don't throw - trigger should have created it
          }

          // Update store since we have a session
          store.dispatch('setUser', {
            uid: data.user.id,
            email: data.user.email,
            displayName,
            photoURL: data.user.user_metadata?.avatar_url,
            isAdmin: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          })
        } else {
          // Email confirmation required - user profile will be created by trigger
          // User will need to confirm email before they can sign in
          // The trigger will create the profile automatically when the user is inserted into auth.users
        }

        return data.user
      }
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      error.value = errorInfo.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) throw authError
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      error.value = errorInfo.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Sign out
  const logout = async () => {
    try {
      loading.value = true
      error.value = null

      // Check for pending changes in admin mode
      if (store.getters.isAdminMode && store.getters.hasPendingChanges) {
        const confirmed = window.confirm(
          'You have unsaved changes in admin mode. Are you sure you want to sign out? All unsaved changes will be lost.'
        )
        if (!confirmed) {
          loading.value = false
          return
        }
      }

      // Always clear local state first, even if signOut fails
      store.dispatch('setUser', null)

      // Try to sign out from Supabase (non-blocking)
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        // Log error but don't throw - user is already logged out locally
        // Sign out error - non-critical, continue with clearing store
      }
      
      // Ensure store is cleared regardless of Supabase response
      store.dispatch('setUser', null)
    } catch (err: any) {
      // Even if there's an error, user is already logged out locally
      const errorInfo = getErrorMessage(err)
      error.value = errorInfo.message
      // Ensure store is cleared
      store.dispatch('setUser', null)
      // Don't throw - logout should succeed locally even if server call fails
    } finally {
      loading.value = false
    }
  }

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      loading.value = true
      error.value = null

      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (authError) throw authError
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      error.value = errorInfo.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (data: { displayName?: string; photoURL?: string | null }) => {
    try {
      loading.value = true
      error.value = null

      if (!user.value) throw new Error('No user logged in')

      // Update user profile in database
      const updates: any = {}
      if (data.displayName !== undefined) {
        updates.display_name = data.displayName
      }
      if (data.photoURL !== undefined) {
        // Allow null to remove photo, or a URL to set/update photo
        updates.photo_url = data.photoURL
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.value.uid)

      if (updateError) throw updateError

      // Update store
      store.dispatch('setUser', {
        ...user.value,
        ...data
      })
    } catch (err: any) {
      const errorInfo = getErrorMessage(err)
      error.value = errorInfo.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Auth listener is now initialized at app startup in main.ts
  // No need to initialize here - it's already set up globally
  onMounted(() => {
    // Listener is already initialized, nothing to do here
  })

  onUnmounted(() => {
    // Don't unsubscribe here - the listener is global and should persist
    // It will be cleaned up when the app unmounts
  })

  // Helper function to get user-friendly error messages and determine which field has the error
  const getErrorMessage = (error: AuthError | Error | string): { message: string; field?: 'email' | 'password' } => {
    const errorObj = typeof error === 'string' 
      ? { message: error, code: '' }
      : error as any
    
    const errorMessage = errorObj?.message || errorObj?.code || ''
    const errorCode = errorObj?.code || ''

    // Email-specific errors
    const emailErrors: Record<string, string> = {
      'Email not confirmed': 'Please verify your email address before signing in.',
      'Invalid email': 'Please enter a valid email address.',
      'User not found': 'No account found with this email address.',
      'email_not_confirmed': 'Please verify your email address before signing in.',
      'invalid_email': 'Please enter a valid email address.',
      'user_not_found': 'No account found with this email address.',
      'signup_disabled': 'Sign up is currently disabled. Please contact support.',
      'email_rate_limit_exceeded': 'Too many requests. Please try again later.'
    }

    // Password-specific errors
    const passwordErrors: Record<string, string> = {
      'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
      'Invalid password': 'Incorrect password. Please try again.',
      'wrong_password': 'Incorrect password. Please try again.',
      'weak_password': 'Password is too weak. Please use a stronger password.'
    }

    // Generic errors that could be either, but we'll default to password for security
    const genericErrors: Record<string, string> = {
      'Invalid login credentials': 'Incorrect password. Please try again.',
      'invalid_credentials': 'Incorrect password. Please try again.',
      'invalid_grant': 'Incorrect password. Please try again.'
    }

    // Check for email-specific errors first
    for (const [key, value] of Object.entries(emailErrors)) {
      if (errorMessage.includes(key) || errorCode.includes(key)) {
        return { message: value, field: 'email' }
      }
    }

    // Check for password-specific errors
    for (const [key, value] of Object.entries(passwordErrors)) {
      if (errorMessage.includes(key) || errorCode.includes(key)) {
        return { message: value, field: 'password' }
      }
    }

    // Check for generic errors (default to password field for security)
    for (const [key, value] of Object.entries(genericErrors)) {
      if (errorMessage.includes(key) || errorCode.includes(key)) {
        return { message: value, field: 'password' }
      }
    }

    // Other errors
    const otherErrors: Record<string, string> = {
      'User already registered': 'An account with this email already exists.',
      'Email rate limit exceeded': 'Too many password reset requests. Please try again later.',
      'Network request failed': 'Network error. Please check your connection.',
      'Request timeout': 'Request timeout - please check your connection.',
      'timed out': 'The request took too long. Please check your network connection and try again.',
      'not configured': 'Supabase is not configured. Please contact support.',
      'not reaching Supabase': 'Unable to connect to Supabase. Please check your network connection and try again.'
    }

    for (const [key, value] of Object.entries(otherErrors)) {
      if (errorMessage.includes(key)) {
        return { message: value }
      }
    }

    return { message: 'An unexpected error occurred. Please try again.' }
  }

  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    user,
    isAuthenticated,

    // Methods
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    updateProfile
  }
}
