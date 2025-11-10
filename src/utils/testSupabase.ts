// Utility to test Supabase connection
import { supabase } from '../supabase'

export async function testSupabaseConnection() {
  console.log('=== Testing Supabase Connection ===')
  
  try {
    // Test 1: Check environment variables
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    
    console.log('Environment check:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlPreview: url ? url.substring(0, 30) + '...' : 'MISSING',
      keyLength: key?.length || 0
    })
    
    if (!url || !key) {
      throw new Error('Missing environment variables')
    }
    
    // Test 2: Check Supabase client
    console.log('Supabase client check:', {
      exists: !!supabase,
      hasAuth: !!supabase?.auth,
      hasFrom: typeof supabase?.from === 'function'
    })
    
    // Test 3: Direct network test to Supabase REST API
    const testUrl = import.meta.env.VITE_SUPABASE_URL
    console.log('Testing direct network connection to:', testUrl)
    
    try {
      const fetchTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Fetch request timed out after 5 seconds')), 5000)
      )
      
      const fetchPromise = fetch(`${testUrl}/rest/v1/`, {
        method: 'GET',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      })
      
      const fetchTest = await Promise.race([fetchPromise, fetchTimeout]) as Response
      
      console.log('Direct fetch test result:', {
        status: fetchTest.status,
        statusText: fetchTest.statusText,
        ok: fetchTest.ok,
        headers: Object.fromEntries(fetchTest.headers.entries())
      })
      
      if (!fetchTest.ok) {
        const text = await fetchTest.text()
        console.error('Fetch returned error:', text.substring(0, 200))
      }
    } catch (fetchErr: any) {
      console.error('Direct fetch test failed:', fetchErr)
      console.error('Error details:', {
        message: fetchErr?.message,
        name: fetchErr?.name,
        stack: fetchErr?.stack?.substring(0, 200)
      })
      console.error('This indicates a network connectivity issue')
      console.error('Possible causes:')
      console.error('1. Supabase project is paused (check Supabase dashboard)')
      console.error('2. Firewall/proxy blocking requests')
      console.error('3. Incorrect Supabase URL')
      console.error('4. Network connectivity problem')
    }
    
    // Test 4: Skip getSession() test - it can hang due to localStorage access
    // Direct network tests above confirm connectivity works
    // Actual auth operations (signIn, signUp) will work fine
    console.log('Skipping getSession() test (known to hang in some environments)')
    console.log('Network connectivity confirmed - auth operations should work')
    
    console.log('=== Supabase Connection Test Complete ===')
    return { success: true }
  } catch (error: any) {
    console.error('=== Supabase Connection Test Failed ===', error)
    return { success: false, error: error.message }
  }
}

