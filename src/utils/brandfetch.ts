/**
 * Brandfetch Logo API utility
 * 
 * Generates logo URLs using Brandfetch's CDN API
 * Documentation: https://docs.brandfetch.com/docs/logo-api
 */

const BRANDFETCH_CLIENT_ID = '1id3wA510J5w3dLiN0H'
const BRANDFETCH_CDN_BASE = 'https://cdn.brandfetch.io'

/**
 * Extracts domain from a URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace('www.', '')
  } catch {
    // If URL parsing fails, return the original string
    return url
  }
}

/**
 * Normalizes tool name to a domain-like format for Brandfetch
 * Handles special cases like "VS Code" -> "visualstudio" or "code.visualstudio.com"
 */
function normalizeToolName(name: string, url?: string): string {
  // Map common tool names to their Brandfetch identifiers
  const nameMap: Record<string, string> = {
    'VS Code': 'code.visualstudio.com',
    'Vue.js': 'vuejs.org',
    'Tailwind CSS': 'tailwindcss.com',
    'TypeScript': 'typescriptlang.org',
    'ESLint': 'eslint.org',
    'Prettier': 'prettier.io',
    'GitHub': 'github.com',
    'Figma': 'figma.com',
    'Postman': 'postman.com',
    'Docker': 'docker.com',
    'Firebase': 'firebase.google.com',
    'Vite': 'vitejs.dev'
  }

  // Check if we have a direct mapping first
  if (nameMap[name]) {
    return nameMap[name]
  }

  // If we have a URL, prefer extracting domain from it
  if (url) {
    const domain = extractDomain(url)
    // Use the full domain (Brandfetch supports full domains)
    return domain
  }

  // Otherwise, convert to lowercase and remove special characters
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Gets the Brandfetch logo URL for a tool
 * 
 * @param toolName - The name of the tool
 * @param toolUrl - Optional URL of the tool (preferred for domain extraction)
 * @param options - Optional parameters for logo customization
 * @returns The Brandfetch CDN URL for the logo
 */
export function getBrandfetchLogoUrl(
  toolName: string,
  toolUrl?: string,
  options?: {
    theme?: 'light' | 'dark'
    size?: number
  }
): string {
  const domain = normalizeToolName(toolName, toolUrl)
  const params = new URLSearchParams({
    c: BRANDFETCH_CLIENT_ID
  })

  if (options?.theme) {
    params.append('theme', options.theme)
  }

  if (options?.size) {
    params.append('size', options.size.toString())
  }

  return `${BRANDFETCH_CDN_BASE}/${domain}?${params.toString()}`
}

/**
 * Gets the Brandfetch logo URL using domain directly
 * 
 * @param domain - The domain name (e.g., 'github.com' or 'github')
 * @param options - Optional parameters for logo customization
 * @returns The Brandfetch CDN URL for the logo
 */
export function getBrandfetchLogoByDomain(
  domain: string,
  options?: {
    theme?: 'light' | 'dark'
    size?: number
  }
): string {
  // Remove protocol, www, and extract main domain
  const cleanDomain = domain
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
    .split('.')[0] // Get just the main domain part

  const params = new URLSearchParams({
    c: BRANDFETCH_CLIENT_ID
  })

  if (options?.theme) {
    params.append('theme', options.theme)
  }

  if (options?.size) {
    params.append('size', options.size.toString())
  }

  return `${BRANDFETCH_CDN_BASE}/${cleanDomain}?${params.toString()}`
}

