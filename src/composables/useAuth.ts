import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import { supabase } from '../supabase'
import type { User, AuthError } from '@supabase/supabase-js'

// Singleton pattern to ensure only one auth listener exists
let authListener: { data: { subscription: any } } | null = null
let isListenerInitialized = false
let lastTokenRefreshTime = 0
const TOKEN_REFRESH_DEBOUNCE_MS = 60000 // Only reload user data once per minute for token refreshes

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
  const { isSupabaseConfigured, supabase } = await import('../supabase')
  
  if (!isSupabaseConfigured()) {
    console.error('⚠️ Cannot initialize auth listener: Supabase environment variables are missing')
    console.error('💡 Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify environment variables')
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
          if (session?.user) {
            try {
              await loadUserDataForStore(session.user, store)
            } catch (err: any) {
              // If loading user data fails, still set basic auth data
              // This ensures the user stays logged in even if profile fetch fails
              store.dispatch('setUser', {
                uid: session.user.id,
                email: session.user.email,
                displayName: session.user.user_metadata?.display_name || 'User',
                photoURL: session.user.user_metadata?.avatar_url,
                isAdmin: false,
                createdAt: session.user.created_at || new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              })
            }
          } else {
            // No session - ensure store is cleared
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
                displayName: session.user.user_metadata?.display_name || 'User',
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
        // Clear store when signed out
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
              displayName: session.user.user_metadata?.display_name || 'User',
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
      console.error('Auth state change error:', err)
      
      // If we have a session but error occurred, try to set basic user data
      if (session?.user) {
        try {
          store.dispatch('setUser', {
            uid: session.user.id,
            email: session.user.email,
            displayName: session.user.user_metadata?.display_name || 'User',
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

  // Also check for existing session as a backup (with longer timeout for production)
  // This runs after the listener is set up, so INITIAL_SESSION should handle it first
  // This ensures Supabase session and store are always in sync
  // Use a longer timeout on reload to account for network delays
  const sessionPromise = supabase.auth.getSession()
  const timeoutPromise = new Promise((resolve) => 
    setTimeout(() => resolve({ data: { session: null } }), 10000)
  )
  
  Promise.race([sessionPromise, timeoutPromise]).then(async (result: any) => {
    try {
      const { data: { session }, error } = result || { data: { session: null }, error: null }
      const currentUser = store.getters.currentUser
      
      // Sync check: Ensure Supabase session matches store state
      if (!error && session?.user) {
        // We have a Supabase session - verify it's still valid
        try {
          // Verify session is still valid by checking token
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user && user.id === session.user.id) {
            // Session is valid - sync store
            if (!currentUser || currentUser.uid !== session.user.id) {
              // Store is out of sync - update it
              try {
                await loadUserDataForStore(session.user, store)
              } catch (loadErr) {
                // If loading fails, set basic auth data to keep user logged in
                store.dispatch('setUser', {
                  uid: session.user.id,
                  email: session.user.email,
                  displayName: session.user.user_metadata?.display_name || 'User',
                  photoURL: session.user.user_metadata?.avatar_url,
                  isAdmin: false,
                  createdAt: session.user.created_at || new Date().toISOString(),
                  lastLoginAt: new Date().toISOString()
                })
              }
            }
          } else {
            // Session is invalid - clear store
            store.dispatch('setUser', null)
          }
        } catch (verifyErr) {
          // If verification fails, still try to use the session we have
          if (!currentUser || currentUser.uid !== session.user.id) {
            store.dispatch('setUser', {
              uid: session.user.id,
              email: session.user.email,
              displayName: session.user.user_metadata?.display_name || 'User',
              photoURL: session.user.user_metadata?.avatar_url,
              isAdmin: false,
              createdAt: session.user.created_at || new Date().toISOString(),
              lastLoginAt: new Date().toISOString()
            })
          }
        }
      } else {
        // No Supabase session - clear store if it has a user
        if (currentUser) {
          store.dispatch('setUser', null)
        }
      }
    } catch (err) {
      // If session check fails completely, don't break the app
      // The auth listener will handle state changes
      console.warn('Session check failed (non-critical):', err)
    }
  }).catch((err) => {
    // If session check fails completely, don't break the app
    // The auth listener will handle state changes
    console.warn('Session check failed (non-critical):', err)
  })
}

// Helper function to load user data (used by both initializeAuthListener and useAuth)
// This function ensures Supabase session and store are always in sync
async function loadUserDataForStore(supabaseUser: User, store: any) {
  // First, verify we still have a valid Supabase session
  // This prevents stale data from being loaded
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session || session.user.id !== supabaseUser.id) {
      // Session is invalid or changed - clear store
      store.dispatch('setUser', null)
      return
    }
  } catch (sessionCheckErr) {
    // If we can't verify session, still try to load user data
    // But this is a warning sign
    console.warn('Could not verify session during user data load')
  }

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

    // PGRST116 is "not found" - user might not have profile yet, that's okay
    // TIMEOUT means the query took too long - continue with auth data
    if (profileError && profileError.code !== 'PGRST116' && profileError.code !== 'TIMEOUT') {
      // Other errors are logged but we continue with auth data
      console.warn('Profile fetch error (non-critical):', profileError.message)
    }

    // Update store with complete user data
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
    // If anything fails, fallback to basic auth user data
    // This ensures the user stays logged in even if profile fetch fails
    store.dispatch('setUser', {
      uid: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.display_name || 'User',
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

      // Add timeout to prevent hanging
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Sign-in request timed out after 15 seconds. This usually means requests are not reaching Supabase. Check your network connection and Supabase project status.')), 15000)
      )
      
      const { data, error: authError } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any

      if (authError) {
        throw authError
      }

      if (!data.user) {
        throw new Error('No user data returned from authentication')
      }

      if (data.user && data.session) {
        // Update store immediately with auth data (don't wait for profile)
        store.dispatch('setUser', {
          uid: data.user.id,
          email: data.user.email,
          displayName: data.user.user_metadata?.display_name || 'User',
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
                  display_name: data.user.user_metadata?.display_name || 'User',
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
                    displayName: newUserData.display_name || data.user.user_metadata?.display_name || 'User',
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
              displayName: userData.display_name || data.user.user_metadata?.display_name || 'User',
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
      error.value = getErrorMessage(err)
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
      error.value = getErrorMessage(err)
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
      error.value = getErrorMessage(err)
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

      // Always clear local state first, even if signOut fails
      store.dispatch('setUser', null)

      // Try to sign out from Supabase (non-blocking)
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        // Log error but don't throw - user is already logged out locally
        console.warn('Sign out error (non-critical):', signOutError)
      }
      
      // Ensure store is cleared regardless of Supabase response
      store.dispatch('setUser', null)
    } catch (err: any) {
      // Even if there's an error, user is already logged out locally
      error.value = getErrorMessage(err)
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
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  const updateProfile = async (data: { displayName?: string; photoURL?: string }) => {
    try {
      loading.value = true
      error.value = null

      if (!user.value) throw new Error('No user logged in')

      // Update user profile in database
      const updates: any = {}
      if (data.displayName) {
        updates.display_name = data.displayName
      }
      if (data.photoURL) {
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
      error.value = getErrorMessage(err)
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

  // Helper function to get user-friendly error messages
  const getErrorMessage = (error: AuthError | Error | string): string => {
    const errorMessage = typeof error === 'string' 
      ? error 
      : (error as any)?.message || (error as any)?.code || ''

    const errorMessages: Record<string, string> = {
      'Invalid login credentials': 'Incorrect email or password. Please try again.',
      'Email not confirmed': 'Please verify your email address before signing in.',
      'User already registered': 'An account with this email already exists.',
      'Password should be at least 6 characters': 'Password should be at least 6 characters long.',
      'Invalid email': 'Please enter a valid email address.',
      'User not found': 'No account found with this email address.',
      'Email rate limit exceeded': 'Too many password reset requests. Please try again later.',
      'Network request failed': 'Network error. Please check your connection.'
    }

    // Check for exact matches first
    if (errorMessages[errorMessage]) {
      return errorMessages[errorMessage]
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(errorMessages)) {
      if (errorMessage.includes(key)) {
        return value
      }
    }

    return 'An unexpected error occurred. Please try again.'
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
