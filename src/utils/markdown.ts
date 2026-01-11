import { marked } from 'marked'
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'

// Configure marked to use highlight.js for code blocks
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.warn('Error highlighting code:', err)
      }
    }
    // Fallback: try to auto-detect language
    try {
      return hljs.highlightAuto(code).value
    } catch (err) {
      console.warn('Error auto-highlighting code:', err)
      return code
    }
  },
  breaks: true, // Convert line breaks to <br>
  gfm: true // GitHub Flavored Markdown
})

/**
 * Interactive block token extracted from markdown
 */
export interface InteractiveBlockToken {
  id: string
  mode?: string
  startIndex: number
  endIndex: number
  type: 'shortcode' | 'html'
  originalText: string
}

/**
 * Parses interactive block tokens from markdown content
 * Supports two formats:
 * 1. Shortcode: [interactive id="js-variables-01" mode="web"]
 * 2. HTML placeholder: <div data-interactive="true" data-id="js-variables-01"></div>
 * 
 * @param markdown - The markdown string to parse
 * @returns Array of interactive block tokens found in the content
 */
export function parseInteractiveBlockTokens(markdown: string): InteractiveBlockToken[] {
  if (!markdown) return []
  
  const tokens: InteractiveBlockToken[] = []
  
  // Parse shortcode format: [interactive id="..." mode="..."]
  const shortcodeRegex = /\[interactive\s+id=["']([^"']+)["'](?:\s+mode=["']([^"']+)["'])?\s*\]/gi
  let match: RegExpExecArray | null
  
  while ((match = shortcodeRegex.exec(markdown)) !== null) {
    tokens.push({
      id: match[1],
      mode: match[2] || undefined,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      type: 'shortcode',
      originalText: match[0]
    })
  }
  
  // Parse HTML placeholder format: <div data-interactive="true" data-id="..."></div>
  const htmlRegex = /<div\s+data-interactive=["']true["']\s+data-id=["']([^"']+)["'](?:\s+data-mode=["']([^"']+)["'])?(?:\s*\/>|>[\s\S]*?<\/div>)/gi
  
  while ((match = htmlRegex.exec(markdown)) !== null) {
    tokens.push({
      id: match[1],
      mode: match[2] || undefined,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      type: 'html',
      originalText: match[0]
    })
  }
  
  // Sort by position in document
  tokens.sort((a, b) => a.startIndex - b.startIndex)
  
  return tokens
}

/**
 * Renders markdown content to safe HTML
 * Note: Interactive block tokens are NOT replaced here - they should be handled
 * by the component that uses this function (e.g., TutorialPage.vue)
 * 
 * @param markdown - The markdown string to render
 * @returns Sanitized HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''
  
  // Parse markdown to HTML
  const html = marked.parse(markdown)
  
  // Sanitize HTML to prevent XSS attacks
  // Note: We allow data-interactive and data-id attributes for HTML placeholders
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id',
      'target', 'rel', 'width', 'height',
      'data-interactive', 'data-id', 'data-mode'
    ],
    ALLOW_DATA_ATTR: true
  })
  
  return sanitized
}

