/**
 * ImgBB API utility for uploading images
 * API Documentation: https://api.imgbb.com/
 */

const IMGBB_API_KEY = '13fe6f454789b2df72aff0aa243f5169'
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

export interface ImgBBResponse {
  data: {
    id: string
    title: string
    url_viewer: string
    url: string
    display_url: string
    width: string
    height: string
    size: string
    time: string
    expiration: string
    image: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    thumb: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    medium: {
      filename: string
      name: string
      mime: string
      extension: string
      url: string
    }
    delete_url: string
  }
  success: boolean
  status: number
}

/**
 * Converts a File to base64 string
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data:image/...;base64, prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads an image file to ImgBB
 * @param file - The image file to upload
 * @param expiration - Optional expiration time in seconds (60-15552000)
 * @returns The ImgBB response with image URLs
 */
export async function uploadImageToImgBB(
  file: File,
  expiration?: number
): Promise<ImgBBResponse> {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (32 MB limit)
    const maxSize = 32 * 1024 * 1024 // 32 MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size must be less than 32 MB')
    }

    // Convert file to base64
    const base64Image = await fileToBase64(file)

    // Build query string with API key
    const params = new URLSearchParams()
    params.append('key', IMGBB_API_KEY)
    if (expiration && expiration >= 60 && expiration <= 15552000) {
      params.append('expiration', expiration.toString())
    }

    // Prepare form data - ImgBB expects base64 string in the 'image' field
    const formData = new FormData()
    formData.append('image', base64Image)
    if (file.name) {
      formData.append('name', file.name)
    }

    // Upload to ImgBB - key goes in query string, image in form data
    const response = await fetch(`${IMGBB_API_URL}?${params.toString()}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ImgBB API error: ${response.status} - ${errorText}`)
    }

    const data: ImgBBResponse = await response.json()

    if (!data.success) {
      throw new Error('Image upload failed')
    }

    return data
  } catch (error: any) {
    console.error('Error uploading image to ImgBB:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

/**
 * Uploads an image from a URL to ImgBB
 * @param imageUrl - The URL of the image to upload
 * @param expiration - Optional expiration time in seconds
 * @returns The ImgBB response with image URLs
 */
export async function uploadImageUrlToImgBB(
  imageUrl: string,
  expiration?: number
): Promise<ImgBBResponse> {
  try {
    // Build query string with API key
    const params = new URLSearchParams()
    params.append('key', IMGBB_API_KEY)
    if (expiration && expiration >= 60 && expiration <= 15552000) {
      params.append('expiration', expiration.toString())
    }

    // Prepare form data
    const formData = new FormData()
    formData.append('image', imageUrl)

    // Upload to ImgBB - key goes in query string, image in form data
    const response = await fetch(`${IMGBB_API_URL}?${params.toString()}`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ImgBB API error: ${response.status} - ${errorText}`)
    }

    const data: ImgBBResponse = await response.json()

    if (!data.success) {
      throw new Error('Image upload failed')
    }

    return data
  } catch (error: any) {
    console.error('Error uploading image URL to ImgBB:', error)
    throw new Error(error.message || 'Failed to upload image')
  }
}

