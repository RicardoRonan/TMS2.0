/**
 * Exercise Runner Utility
 * Handles code execution and validation in a sandboxed environment
 */

export interface TestCase {
  input: any
  expectedOutput: any
  description?: string
}

export interface TestResult {
  passed: boolean
  input: any
  expected: any
  actual: any
  error?: string
  description?: string
}

export interface ExerciseResult {
  passed: boolean
  testResults: TestResult[]
  error?: string
  output?: any
}

/**
 * Execute JavaScript code in a sandboxed environment
 * Note: This is a client-side implementation. For production, consider
 * using a backend service or Web Workers for better security.
 */
export async function runJavaScriptCode(
  code: string,
  testCases: TestCase[]
): Promise<ExerciseResult> {
  const testResults: TestResult[] = []
  let hasError = false
  let globalError: string | undefined

  try {
    // Create a sandboxed execution context
    // In a production environment, this should use Web Workers or backend execution
    const wrappedCode = `
      (function() {
        try {
          ${code}
          
          // If the code exports a function, make it available
          if (typeof module !== 'undefined' && module.exports) {
            return module.exports;
          }
          
          // If code defines a function, try to find it
          const funcNames = Object.keys(this).filter(key => 
            typeof this[key] === 'function' && 
            !['console', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'].includes(key)
          );
          
          if (funcNames.length > 0) {
            return this[funcNames[0]];
          }
          
          return null;
        } catch (e) {
          throw e;
        }
      })();
    `

    // Execute the code
    const func = new Function('return ' + wrappedCode)()
    
    // Run test cases
    for (const testCase of testCases) {
      try {
        let actual: any
        
        if (typeof func === 'function') {
          // If we got a function, call it with the test input
          actual = func(testCase.input)
        } else {
          // Otherwise, try to evaluate the result
          const resultCode = code.replace(/\breturn\b/g, '')
          const evalCode = `(function() { ${resultCode}; return ${JSON.stringify(testCase.input)}; })()`
          actual = new Function('return ' + evalCode)()
        }

        const passed = deepEqual(actual, testCase.expectedOutput)
        
        testResults.push({
          passed,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual,
          description: testCase.description
        })
      } catch (error: any) {
        testResults.push({
          passed: false,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: undefined,
          error: error.message,
          description: testCase.description
        })
        hasError = true
      }
    }
  } catch (error: any) {
    globalError = error.message
    hasError = true
  }

  return {
    passed: !hasError && testResults.every(r => r.passed),
    testResults,
    error: globalError
  }
}

/**
 * Validate code syntax without executing
 */
export function validateCodeSyntax(code: string, language: string = 'javascript'): {
  valid: boolean
  error?: string
} {
  if (language !== 'javascript' && language !== 'typescript') {
    return { valid: true } // Skip validation for other languages
  }

  try {
    // Basic syntax validation using Function constructor
    new Function(code)
    return { valid: true }
  } catch (error: any) {
    return {
      valid: false,
      error: error.message
    }
  }
}

/**
 * Deep equality check for test results
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  
  if (a == null || b == null) return false
  
  if (typeof a !== typeof b) return false
  
  if (typeof a !== 'object') return false
  
  if (Array.isArray(a) !== Array.isArray(b)) return false
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }
  
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  
  if (keysA.length !== keysB.length) return false
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  
  return true
}

/**
 * Format test results for display
 */
export function formatTestResults(results: TestResult[]): string {
  if (results.length === 0) return 'No test cases to run'
  
  const passed = results.filter(r => r.passed).length
  const total = results.length
  
  return `${passed}/${total} test cases passed`
}

/**
 * Extract function name from code (helper for better error messages)
 */
export function extractFunctionName(code: string): string | null {
  const functionMatch = code.match(/(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)\s*=>|function))/)
  return functionMatch ? (functionMatch[1] || functionMatch[2]) : null
}

