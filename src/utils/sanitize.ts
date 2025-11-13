import DOMPurify from 'dompurify'

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @param options - Optional DOMPurify configuration
 * @returns Sanitized HTML string
 */
export function sanitizeHTML(
  html: string,
  options?: {
    allowedTags?: string[]
    allowedAttributes?: string[]
  }
): string {
  if (!html) return ''

  const config: DOMPurify.Config = {
    ALLOWED_TAGS: options?.allowedTags || [
      'p', 'br', 'strong', 'em', 'u', 's', 'code', 'pre',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || [
      'href', 'title', 'alt', 'src', 'class', 'id',
      'target', 'rel', 'width', 'height'
    ],
    ALLOW_DATA_ATTR: false
  }

  return DOMPurify.sanitize(html, config)
}

/**
 * Safely sets innerHTML of an element
 * @param element - The DOM element to set innerHTML on
 * @param html - The HTML string to set (will be sanitized)
 */
export function setSafeInnerHTML(element: HTMLElement, html: string): void {
  if (!element) return
  const sanitized = sanitizeHTML(html)
  element.innerHTML = sanitized
}

