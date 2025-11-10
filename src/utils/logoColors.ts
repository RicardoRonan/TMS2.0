/**
 * Brand color utilities for tool logos
 * Provides brand colors for tools to use as container backgrounds
 */

/**
 * Extracts the background color from an image by sampling the edges and corners
 * This gives us the background color that surrounds the logo
 */
export function extractBackgroundColor(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'))
          return
        }
        
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        const width = canvas.width
        const height = canvas.height
        
        // Sample pixels from edges and corners to get background color
        const edgeSamples: number[] = []
        const sampleSize = Math.max(2, Math.floor(Math.min(width, height) * 0.1)) // Sample 10% of edges
        
        // Sample top edge
        for (let x = 0; x < width; x += sampleSize) {
          const idx = (0 * width + x) * 4
          edgeSamples.push(data[idx], data[idx + 1], data[idx + 2])
        }
        
        // Sample bottom edge
        for (let x = 0; x < width; x += sampleSize) {
          const idx = ((height - 1) * width + x) * 4
          edgeSamples.push(data[idx], data[idx + 1], data[idx + 2])
        }
        
        // Sample left edge
        for (let y = 0; y < height; y += sampleSize) {
          const idx = (y * width + 0) * 4
          edgeSamples.push(data[idx], data[idx + 1], data[idx + 2])
        }
        
        // Sample right edge
        for (let y = 0; y < height; y += sampleSize) {
          const idx = (y * width + (width - 1)) * 4
          edgeSamples.push(data[idx], data[idx + 1], data[idx + 2])
        }
        
        // Calculate average color from edge samples
        let r = 0, g = 0, b = 0, count = 0
        
        for (let i = 0; i < edgeSamples.length; i += 3) {
          r += edgeSamples[i]
          g += edgeSamples[i + 1]
          b += edgeSamples[i + 2]
          count++
        }
        
        r = Math.round(r / count)
        g = Math.round(g / count)
        b = Math.round(b / count)
        
        // Convert to hex
        const hex = `#${[r, g, b].map(x => {
          const hex = x.toString(16)
          return hex.length === 1 ? '0' + hex : hex
        }).join('')}`
        
        resolve(hex)
      } catch (error) {
        // CORS or other error - reject
        reject(error)
      }
    }
    
    img.onerror = (error) => {
      reject(new Error('Failed to load image for color extraction'))
    }
    
    img.src = imageUrl
  })
}

/**
 * Extracts the dominant color from an image
 * Note: May fail due to CORS restrictions on external images
 * @deprecated Use extractBackgroundColor instead for better blending
 */
export function extractDominantColor(imageUrl: string): Promise<string> {
  return extractBackgroundColor(imageUrl)
}

/**
 * Known background colors for tool logos
 * These are the background colors that appear in the logo images
 * If not specified, we'll extract from the image edges
 */
const logoBackgroundColors: Record<string, string> = {
  'Vite': '#FFFFFF',
  'Tailwind CSS': '#FFFFFF',
  'TypeScript': '#FFFFFF',
  'Firebase': '#FFFFFF',
  'Vue.js': '#FFFFFF',
  'VS Code': '#FFFFFF',
  'GitHub': '#FFFFFF',
  'Figma': '#FFFFFF',
  'Postman': '#FFFFFF',
  'Docker': '#FFFFFF',
  'ESLint': '#FFFFFF',
  'Prettier': '#FFFFFF'
}

/**
 * Gets the background color for a tool logo
 * Falls back to extracting from image if not in the map
 */
export function getLogoBackgroundColor(toolName: string): string | null {
  return logoBackgroundColors[toolName] || null
}

/**
 * Gets the brand color for a tool (for backward compatibility)
 * @deprecated Use getLogoBackgroundColor instead
 */
export function getBrandColor(toolName: string): string | null {
  return getLogoBackgroundColor(toolName)
}

/**
 * Gets a lighter version of a color for use as background
 * @deprecated For logo backgrounds, use the color directly without lightening
 */
export function lightenColor(hex: string, percent: number = 90): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + Math.round((255 - (num >> 16)) * percent / 100))
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round((255 - ((num >> 8) & 0x00FF)) * percent / 100))
  const b = Math.min(255, (num & 0x0000FF) + Math.round((255 - (num & 0x0000FF)) * percent / 100))
  
  return `#${[r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')}`
}

