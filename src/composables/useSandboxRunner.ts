import { ref, onUnmounted, type Ref } from 'vue'

export interface OutputLine {
  text: string
  type: 'stdout' | 'error'
}

export interface SandboxRunner {
  iframeRef: Readonly<Ref<HTMLIFrameElement | null>>
  outputLines: Readonly<Ref<OutputLine[]>>
  isRunning: Readonly<Ref<boolean>>
  errorCount: Readonly<Ref<number>>
  run: (code: string | { html?: string; css?: string; js?: string }) => Promise<void>
  reset: () => void
  clearOutput: () => void
}

// Expected origin for postMessage validation
const EXPECTED_ORIGIN = window.location.origin

// Message schema validation
interface PostMessage {
  type: 'console' | 'error' | 'dom-snapshot' | 'ready'
  data?: any
  text?: string
  selector?: string
  snapshot?: any
}

function isValidMessage(message: any): message is PostMessage {
  if (!message || typeof message !== 'object') return false
  if (!['console', 'error', 'dom-snapshot', 'ready'].includes(message.type)) return false
  return true
}

/**
 * Creates a sandboxed iframe runner for executing user code safely
 */
export function useSandboxRunner(): SandboxRunner {
  const iframeRef = ref<HTMLIFrameElement | null>(null)
  const outputLines = ref<OutputLine[]>([])
  const isRunning = ref(false)
  const errorCount = ref(0)
  let timeoutId: number | null = null
  const iframeWindow: Window | null = null

  // Create sandboxed iframe
  const createIframe = (): HTMLIFrameElement => {
    const iframe = document.createElement('iframe')
    
    // Strict sandbox attributes - no allow-same-origin to prevent main window access
    // We only allow scripts and forms for code execution
    iframe.setAttribute('sandbox', 'allow-scripts allow-forms')
    iframe.setAttribute('srcdoc', '')
    iframe.style.width = '100%'
    iframe.style.height = '400px'
    iframe.style.border = '1px solid var(--color-border-primary)'
    iframe.style.borderRadius = 'var(--radius-md)'
    iframe.style.background = '#ffffff'
    
    return iframe
  }

  // PostMessage handler with strict validation
  const handleMessage = (event: MessageEvent) => {
    // Strict origin check
    if (event.origin !== EXPECTED_ORIGIN) {
      console.warn('Rejected postMessage from unexpected origin:', event.origin)
      return
    }

    // Schema validation
    if (!isValidMessage(event.data)) {
      console.warn('Rejected postMessage with invalid schema:', event.data)
      return
    }

    const message = event.data as PostMessage

    switch (message.type) {
      case 'console':
        if (message.text !== undefined) {
          outputLines.value.push({
            text: message.text,
            type: 'stdout'
          })
        }
        break

      case 'error':
        errorCount.value++
        if (message.text !== undefined) {
          outputLines.value.push({
            text: message.text,
            type: 'error'
          })
        }
        break

      case 'dom-snapshot':
        // Handle DOM snapshot requests (for check engine)
        // This will be used by the check engine
        break

      case 'ready':
        // Iframe is ready
        break
    }
  }

  // Inject code into iframe
  const injectCode = (code: string | { html?: string; css?: string; js?: string }): string => {
    if (typeof code === 'string') {
      // Single string - assume it's HTML with embedded script/style
      return code
    }

    // Multi-file format
    const { html = '', css = '', js = '' } = code
    
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Override console methods to capture output
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    function sendMessage(type, text) {
      if (window.parent) {
        window.parent.postMessage({ type, text }, '${EXPECTED_ORIGIN}');
      }
    }

    console.log = function(...args) {
      originalLog.apply(console, args);
      sendMessage('console', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.error = function(...args) {
      originalError.apply(console, args);
      sendMessage('error', args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.warn = function(...args) {
      originalWarn.apply(console, args);
      sendMessage('console', 'WARN: ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.info = function(...args) {
      originalInfo.apply(console, args);
      sendMessage('console', 'INFO: ' + args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    // Capture uncaught errors
    window.addEventListener('error', function(event) {
      sendMessage('error', event.message + ' at ' + (event.filename || 'unknown') + ':' + (event.lineno || '?'));
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
      sendMessage('error', 'Unhandled promise rejection: ' + (event.reason?.message || event.reason || 'Unknown error'));
    });

    // Notify parent that iframe is ready
    sendMessage('ready');

    // User code
    try {
      ${js}
    } catch (error) {
      sendMessage('error', error.message + ' at ' + (error.stack || 'unknown'));
    }
  </script>
</body>
</html>
    `.trim()
  }

  // Run code in sandbox
  const run = async (code: string | { html?: string; css?: string; js?: string }): Promise<void> => {
    if (!iframeRef.value) {
      throw new Error('Iframe not initialized')
    }

    isRunning.value = true
    errorCount.value = 0
    clearOutput()

    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    try {
      // Inject code into iframe
      const htmlContent = injectCode(code)
      iframeRef.value.srcdoc = htmlContent

      // Set execution timeout (10 seconds)
      timeoutId = window.setTimeout(() => {
        outputLines.value.push({
          text: 'Execution timeout: Code execution exceeded 10 seconds',
          type: 'error'
        })
        isRunning.value = false
        timeoutId = null
      }, 10000)

      // Wait a bit for iframe to load and execute
      await new Promise(resolve => setTimeout(resolve, 100))

      // Clear timeout if execution completed
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    } catch (error: any) {
      outputLines.value.push({
        text: `Error executing code: ${error.message || 'Unknown error'}`,
        type: 'error'
      })
      errorCount.value++
    } finally {
      isRunning.value = false
    }
  }

  // Reset iframe
  const reset = () => {
    if (iframeRef.value) {
      iframeRef.value.srcdoc = ''
    }
    clearOutput()
    errorCount.value = 0
    isRunning.value = false
    
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  // Clear output
  const clearOutput = () => {
    outputLines.value = []
  }

  // Initialize iframe
  const initIframe = () => {
    if (!iframeRef.value) {
      const iframe = createIframe()
      iframeRef.value = iframe
    }
    return iframeRef.value
  }

  // Set up message listener
  window.addEventListener('message', handleMessage)

  // Cleanup on unmount
  onUnmounted(() => {
    window.removeEventListener('message', handleMessage)
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    reset()
    if (iframeRef.value && iframeRef.value.parentNode) {
      iframeRef.value.parentNode.removeChild(iframeRef.value)
    }
  })

  // Initialize iframe immediately
  initIframe()

  return {
    iframeRef: iframeRef as Readonly<Ref<HTMLIFrameElement | null>>,
    outputLines: outputLines as Readonly<Ref<OutputLine[]>>,
    isRunning: isRunning as Readonly<Ref<boolean>>,
    errorCount: errorCount as Readonly<Ref<number>>,
    run,
    reset,
    clearOutput
  }
}
