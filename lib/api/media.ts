/**
 * Media/Image upload API functions
 */
import { apiClient } from './client'

export interface ImageUploadResponse {
  url: string
  original_url: string
  width: number
  height: number
  size: number
  thumbnail_url?: string
  thumbnail_width?: number
  thumbnail_height?: number
}

export interface ImageUploadOptions {
  image_type?: 'featured' | 'gallery' | 'testimonial' | 'activity' | 'blog'
  create_thumbnail?: boolean
  onUploadProgress?: (progress: number) => void
}

/**
 * Upload an image - automatically creates original and listing versions
 */
export async function uploadImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)
  
  if (options.image_type) {
    formData.append('image_type', options.image_type)
  }
  
  if (options.create_thumbnail) {
    formData.append('create_thumbnail', 'true')
  }

  const response = await apiClient.post<ImageUploadResponse>(
    '/api/v1/admin/media/upload-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && options.onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          options.onUploadProgress(percentCompleted)
        }
      },
    }
  )
  
  return response.data
}

export interface ImageDeleteResponse {
  message: string
  deleted_count: number
  failed_paths?: string[] | null
}

/**
 * Delete an image and all its variants from R2 storage
 */
export async function deleteImage(url: string): Promise<ImageDeleteResponse> {
  const response = await apiClient.post<ImageDeleteResponse>(
    '/api/v1/admin/media/delete-image',
    { url }
  )
  
  return response.data
}

