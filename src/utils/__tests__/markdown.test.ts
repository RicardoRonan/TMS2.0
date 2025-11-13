import { describe, it, expect } from 'vitest'
import { renderMarkdown } from '../markdown'

describe('renderMarkdown', () => {
  it('should render basic markdown', () => {
    const markdown = '# Hello World\n\nThis is a test.'
    const result = renderMarkdown(markdown)
    expect(result).toContain('<h1>Hello World</h1>')
    expect(result).toContain('<p>This is a test.</p>')
  })

  it('should sanitize HTML to prevent XSS', () => {
    const malicious = '<script>alert("xss")</script># Safe Heading'
    const result = renderMarkdown(malicious)
    expect(result).not.toContain('<script>')
    expect(result).toContain('<h1>Safe Heading</h1>')
  })

  it('should handle empty strings', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown(null as any)).toBe('')
    expect(renderMarkdown(undefined as any)).toBe('')
  })

  it('should render code blocks', () => {
    const markdown = '```javascript\nconst x = 1;\n```'
    const result = renderMarkdown(markdown)
    expect(result).toContain('<pre>')
    expect(result).toContain('<code')
  })

  it('should render links', () => {
    const markdown = '[Link](https://example.com)'
    const result = renderMarkdown(markdown)
    expect(result).toContain('<a')
    expect(result).toContain('href="https://example.com"')
  })
})

