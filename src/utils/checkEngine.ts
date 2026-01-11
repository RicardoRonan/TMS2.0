/**
 * Check engine for validating interactive code blocks
 */

export type CheckType = 
  | 'stdout_includes'
  | 'stdout_regex'
  | 'dom_exists'
  | 'dom_text_includes'
  | 'no_runtime_errors'

export interface CheckDefinition {
  type: CheckType
  value: string // Substring, regex pattern, or CSS selector
  message?: string // Custom failure message
}

export interface CheckContext {
  outputLines: Array<{ text: string; type: 'stdout' | 'error' }>
  errorCount: number
  iframeDocument?: Document // Optional: iframe document for DOM checks
  domSnapshot?: Record<string, any> // Optional: minimal DOM snapshot
}

export interface CheckResult {
  pass: boolean
  messages: string[]
  details?: Record<string, any>
}

/**
 * Runs a single check against the context
 */
function runSingleCheck(check: CheckDefinition, context: CheckContext): CheckResult {
  const { type, value, message } = check
  const { outputLines, errorCount, iframeDocument, domSnapshot } = context

  switch (type) {
    case 'stdout_includes': {
      const allOutput = outputLines
        .filter(line => line.type === 'stdout')
        .map(line => line.text)
        .join('\n')
      
      const pass = allOutput.includes(value)
      return {
        pass,
        messages: pass 
          ? [] 
          : [message || `Output should include "${value}"`],
        details: { found: allOutput, expected: value }
      }
    }

    case 'stdout_regex': {
      const allOutput = outputLines
        .filter(line => line.type === 'stdout')
        .map(line => line.text)
        .join('\n')
      
      try {
        const regex = new RegExp(value, 'i')
        const pass = regex.test(allOutput)
        return {
          pass,
          messages: pass
            ? []
            : [message || `Output should match pattern "${value}"`],
          details: { found: allOutput, pattern: value }
        }
      } catch (error: any) {
        return {
          pass: false,
          messages: [`Invalid regex pattern: ${error.message}`],
          details: { error: error.message }
        }
      }
    }

    case 'dom_exists': {
      // Try to use iframe document if available
      if (iframeDocument) {
        try {
          const element = iframeDocument.querySelector(value)
          const pass = element !== null
          return {
            pass,
            messages: pass
              ? []
              : [message || `Element with selector "${value}" should exist`],
            details: { selector: value, found: !!element }
          }
        } catch (error: any) {
          return {
            pass: false,
            messages: [`Invalid selector: ${error.message}`],
            details: { error: error.message }
          }
        }
      }

      // Fallback: use DOM snapshot if available
      if (domSnapshot) {
        // Simple check: see if selector exists in snapshot
        // This is a simplified version - in production, you'd want a more robust snapshot format
        const pass = domSnapshot[value] !== undefined
        return {
          pass,
          messages: pass
            ? []
            : [message || `Element with selector "${value}" should exist`],
          details: { selector: value, found: pass }
        }
      }

      // No way to check DOM
      return {
        pass: false,
        messages: ['DOM checks require iframe document or snapshot'],
        details: { error: 'No DOM access available' }
      }
    }

    case 'dom_text_includes': {
      // Try to use iframe document if available
      if (iframeDocument) {
        try {
          const element = iframeDocument.querySelector(value.split('|')[0]) // Selector is first part, text is second
          const expectedText = value.split('|')[1] || value
          
          if (!element) {
            return {
              pass: false,
              messages: [message || `Element with selector "${value.split('|')[0]}" not found`],
              details: { selector: value.split('|')[0], found: false }
            }
          }

          const elementText = element.textContent || ''
          const pass = elementText.includes(expectedText)
          return {
            pass,
            messages: pass
              ? []
              : [message || `Element text should include "${expectedText}"`],
            details: { 
              selector: value.split('|')[0], 
              found: elementText, 
              expected: expectedText 
            }
          }
        } catch (error: any) {
          return {
            pass: false,
            messages: [`Error checking DOM: ${error.message}`],
            details: { error: error.message }
          }
        }
      }

      // Fallback: use DOM snapshot
      if (domSnapshot) {
        // Simplified check - would need proper snapshot format
        return {
          pass: false,
          messages: ['DOM text checks require iframe document'],
          details: { error: 'No DOM access available' }
        }
      }

      return {
        pass: false,
        messages: ['DOM checks require iframe document or snapshot'],
        details: { error: 'No DOM access available' }
      }
    }

    case 'no_runtime_errors': {
      const pass = errorCount === 0
      return {
        pass,
        messages: pass
          ? []
          : [message || `Expected no runtime errors, but found ${errorCount}`],
        details: { errorCount, expected: 0 }
      }
    }

    default:
      return {
        pass: false,
        messages: [`Unknown check type: ${type}`],
        details: { type }
      }
  }
}

/**
 * Runs all checks against the context
 * Returns overall result (all checks must pass)
 */
export function runChecks(
  checks: CheckDefinition[],
  context: CheckContext
): CheckResult {
  if (!checks || checks.length === 0) {
    return {
      pass: true,
      messages: [],
      details: { note: 'No checks defined' }
    }
  }

  const results = checks.map(check => runSingleCheck(check, context))
  const allPass = results.every(result => result.pass)
  const allMessages = results.flatMap(result => result.messages)

  return {
    pass: allPass,
    messages: allMessages,
    details: {
      totalChecks: checks.length,
      passedChecks: results.filter(r => r.pass).length,
      results: results.map((r, i) => ({
        check: checks[i],
        result: r
      }))
    }
  }
}

/**
 * Helper to request DOM snapshot from iframe via postMessage
 * This should be called from the parent window after code execution
 */
export function requestDomSnapshot(iframe: HTMLIFrameElement): Promise<Record<string, any>> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('DOM snapshot request timeout'))
    }, 5000)

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return
      
      if (event.data?.type === 'dom-snapshot') {
        clearTimeout(timeout)
        window.removeEventListener('message', handleMessage)
        resolve(event.data.snapshot || {})
      }
    }

    window.addEventListener('message', handleMessage)

    // Request snapshot from iframe
    iframe.contentWindow?.postMessage({ type: 'request-dom-snapshot' }, window.location.origin)
  })
}
