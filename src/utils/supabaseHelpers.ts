import { supabase } from '../supabase'

/**
 * Wraps a Supabase query to automatically handle auth errors
 * and retry with a refreshed session if needed
 */
export async function withAuthRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries: number = 1
): Promise<{ data: T | null; error: any }> {
  let retryCount = 0
  
  const attemptQuery = async (): Promise<{ data: T | null; error: any }> => {
    try {
      const result = await queryFn()
      
      // Check if error is auth-related
      if (result.error) {
        const errorCode = result.error.code || result.error.message || ''
        const errorMessage = String(result.error.message || '').toLowerCase()
        const isAuthError = 
          errorCode === 'PGRST301' || // JWT expired
          errorCode === '401' ||
          errorCode === '403' ||
          errorMessage.includes('jwt') ||
          errorMessage.includes('token') ||
          errorMessage.includes('unauthorized') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('session') ||
          errorMessage.includes('authentication')
        
        if (isAuthError && retryCount < maxRetries) {
          try {
            // Try to refresh the session
            const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
            
            if (refreshError || !session) {
              // If refresh failed, check if we have a stored session to recover from
              const { data: { session: storedSession } } = await supabase.auth.getSession()
              
              if (!storedSession) {
                // No session available, user needs to sign in again
                return { data: null, error: { message: 'Session expired. Please sign in again.' } }
              }
              
              // We have a stored session, try one more time
              retryCount++
              return await attemptQuery()
            }
            
            // Session refreshed successfully
            retryCount++
            return await attemptQuery()
          } catch (refreshErr: any) {
            // If refresh errored but we haven't exceeded retries, try once more
            if (retryCount < maxRetries) {
              retryCount++
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500))
              return await attemptQuery()
            }
            
            return { data: null, error: { message: 'Session expired. Please sign in again.' } }
          }
        }
      }
      
      return result
    } catch (err: any) {
      // Check if the error itself is auth-related
      const errorMessage = String(err?.message || err || '').toLowerCase()
      const isAuthError = 
        errorMessage.includes('jwt') ||
        errorMessage.includes('token') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('expired') ||
        errorMessage.includes('session') ||
        errorMessage.includes('authentication') ||
        err?.code === '401' ||
        err?.code === '403'
      
      if (isAuthError && retryCount < maxRetries) {
        try {
          const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
          
          if (!refreshError && session) {
            retryCount++
            return await attemptQuery()
          }
        } catch (refreshErr) {
          // Silently fail and return error
        }
      }
      
      return { data: null, error: err }
    }
  }
  
  return await attemptQuery()
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

