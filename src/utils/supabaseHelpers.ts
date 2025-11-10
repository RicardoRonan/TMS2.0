import { supabase } from '../supabase'

/**
 * Wraps a Supabase query to automatically handle auth errors
 * and retry with a refreshed session if needed
 */
export async function withAuthRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  try {
    const result = await queryFn()
    
    // Check if error is auth-related
    if (result.error) {
      const errorCode = result.error.code || result.error.message || ''
      const isAuthError = 
        errorCode === 'PGRST301' || // JWT expired
        errorCode === '401' ||
        errorCode === 'PGRST301' ||
        result.error.message?.includes('JWT') ||
        result.error.message?.includes('token') ||
        result.error.message?.includes('unauthorized') ||
        result.error.message?.includes('expired')
      
      if (isAuthError) {
        console.log('Auth error detected, attempting to refresh session...')
        
        // Try to refresh the session
        const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
        
        if (refreshError || !session) {
          console.error('Failed to refresh session:', refreshError)
          // Session refresh failed, user needs to sign in again
          return { data: null, error: { message: 'Session expired. Please sign in again.' } }
        }
        
        // Retry the query once with the refreshed session
        console.log('Session refreshed, retrying query...')
        return await queryFn()
      }
    }
    
    return result
  } catch (err: any) {
    return { data: null, error: err }
  }
}

/**
 * Checks if an error is authentication-related
 */
export function isAuthError(error: any): boolean {
  if (!error) return false
  
  const errorCode = error.code || error.message || ''
  const errorMessage = String(error.message || error).toLowerCase()
  
  return (
    errorCode === 'PGRST301' ||
    errorCode === '401' ||
    errorMessage.includes('jwt') ||
    errorMessage.includes('token') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('session')
  )
}

