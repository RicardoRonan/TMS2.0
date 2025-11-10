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
 * Renders markdown content to safe HTML
 * @param markdown - The markdown string to render
 * @returns Sanitized HTML string
 */
export function renderMarkdown(markdown: string): string {
  if (!markdown) return ''
  
  // Parse markdown to HTML
  const html = marked.parse(markdown)
  
  // Sanitize HTML to prevent XSS attacks
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
      'target', 'rel', 'width', 'height'
    ],
    ALLOW_DATA_ATTR: false
  })
  
  return sanitized
}

