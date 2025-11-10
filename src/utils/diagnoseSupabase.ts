// Diagnostic tool to test Supabase connectivity
export async function diagnoseSupabase() {
  console.log('=== Supabase Diagnostic Tool ===\n')
  
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  // Test 1: Environment variables
  console.log('1. Environment Variables:')
  console.log('   URL:', url ? `${url.substring(0, 30)}...` : '❌ MISSING')
  console.log('   Key:', key ? `${key.substring(0, 20)}...` : '❌ MISSING')
  console.log('')
  
  if (!url || !key) {
    console.error('❌ Missing environment variables. Check your .env file.')
    return
  }
  
  // Test 2: URL format validation
  console.log('2. URL Format Check:')
  const urlPattern = /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/
  const isValidUrl = urlPattern.test(url)
  console.log('   Valid format:', isValidUrl ? '✅' : '❌')
  if (!isValidUrl) {
    console.error('   Expected format: https://xxx.supabase.co (no trailing slash)')
    console.error('   Your URL:', url)
  }
  console.log('')
  
  // Test 3: Direct fetch to REST API
  console.log('3. Direct Network Test (REST API):')
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'GET',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log('   Status:', response.status, response.statusText)
    console.log('   OK:', response.ok ? '✅' : '❌')
    console.log('   Headers:', Object.fromEntries(response.headers.entries()))
    
    if (response.ok) {
      console.log('   ✅ Network connectivity works!')
    } else {
      const text = await response.text()
      console.log('   Response:', text.substring(0, 200))
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('   ❌ Request timed out after 5 seconds')
      console.error('   This means requests are not reaching Supabase')
    } else {
      console.error('   ❌ Network error:', err.message)
    }
    console.error('   Possible causes:')
    console.error('   - Supabase project is paused (check dashboard)')
    console.error('   - Firewall/proxy blocking requests')
    console.error('   - Network connectivity issue')
  }
  console.log('')
  
  // Test 4: Direct fetch to Auth endpoint
  console.log('4. Direct Network Test (Auth API):')
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)
    
    const response = await fetch(`${url}/auth/v1/health`, {
      method: 'GET',
      headers: {
        'apikey': key
      },
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    console.log('   Status:', response.status, response.statusText)
    console.log('   OK:', response.ok ? '✅' : '❌')
    
    if (response.ok) {
      const data = await response.json()
      console.log('   Response:', data)
      console.log('   ✅ Auth endpoint is reachable!')
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('   ❌ Request timed out after 5 seconds')
    } else {
      console.error('   ❌ Network error:', err.message)
    }
  }
  console.log('')
  
  // Test 5: Check if URL is accessible in browser
  console.log('5. Manual Test:')
  console.log('   Open this URL in a new browser tab:')
  console.log(`   ${url}/rest/v1/`)
  console.log('   If you see a response (even an error), connectivity works')
  console.log('   If the page doesn\'t load, there\'s a network/firewall issue')
  console.log('')
  
  console.log('=== Diagnostic Complete ===')
}

