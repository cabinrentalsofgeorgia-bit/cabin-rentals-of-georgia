/**
 * Cabin API functions
 */
import { Property } from '../types'
import { apiClient } from './client'

// Internal interface for backend response
interface PropertyListResponse {
  properties: Property[]
}

export interface Cabin {
  id: string
  title: string
  cabin_slug: string | null
  body: string | null
  bedrooms: string | null
  bathrooms: string | null
  sleeps: number | null
  property_type: any[] | null
  amenities: any[] | null
  features: string[] | null
  featured_image_url: string | null
  featured_image_alt: string | null
  featured_image_title: string | null
  gallery_images: any[] | null
  latitude: number | null
  longitude: number | null
  streamline_id: number | null
  phone: string | null
  keys_for_rent_id: number | null
  flipkey_id: number | null
  matterport_url: string | null
  tagline: string | null
  location: number | null
  rates_description: string | null
  analytics_code: string | null
  video: Array<{
    video_url?: string
    thumbnail_path?: string
    embed_code?: string
    description?: string
  }> | null
  address: {
    country?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip_code?: string
  } | null
  author_name: string | null
  status: string
  created_at: string
  updated_at: string | null
  published_at: string | null
  today_rate: number | null
}

// Admin API types
export interface AdminCabinListParams {
  page?: number
  page_size?: number
  status?: string
  search?: string
  bedrooms?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface AdminCabinListResponse {
  cabins: Cabin[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/**
 * Fetch cabins for admin panel with pagination and filtering
 */
export async function getAdminCabins(params?: AdminCabinListParams): Promise<AdminCabinListResponse> {
  const response = await apiClient.get<AdminCabinListResponse>('/api/v1/admin/cabins', {
    params,
  })
  return response.data
}

/**
 * Delete a cabin by ID
 */
export async function deleteCabin(cabinId: string): Promise<{ message: string; id: string }> {
  const response = await apiClient.delete<{ message: string; id: string }>(`/api/v1/admin/cabins/${cabinId}`)
  return response.data
}

/**
 * Update a cabin's status
 */
export async function updateCabinStatus(
  cabinId: string,
  newStatus: 'published' | 'draft' | 'archived'
): Promise<{ message: string; id: string }> {
  const response = await apiClient.patch<{ message: string; id: string }>(
    `/api/v1/admin/cabins/${cabinId}/status`,
    null,
    { params: { new_status: newStatus } }
  )
  return response.data
}

/**
 * Fetch a single cabin by slug (tries both slug and cabin_slug)
 * 
 * Handles both URL patterns:
 * - Single-segment: 'happy-ours-lodge' (from /cabin/happy-ours-lodge)
 * - Multi-segment: 'cherry-log/creekside-green' (from /cabin/cherry-log/creekside-green)
 * 
 * The slug parameter should be everything after '/cabin' in the URL.
 * 
 * @param slug - The slug path (e.g., 'happy-ours-lodge' or 'cherry-log/creekside-green')
 * @returns Cabin data
 */
export async function getCabinBySlug(slug: string): Promise<Cabin> {
  const response = await apiClient.get<Cabin>(`/api/storefront/catalog/cabins/${slug}`)
  return response.data
}

/**
 * Fetch a single cabin by ID (or slug)
 */
export async function getCabinById(id: string): Promise<Cabin> {
  const response = await apiClient.get<Cabin>(`/api/storefront/catalog/cabins/${encodeURIComponent(id)}`)
  return response.data
}



export interface PropertyListParams {
  category?: string
  amenity?: string
  bedrooms?: number
  search?: string
  status?: string
  tid?: number
}

export async function getAllCabins(): Promise<Property[]> {
  const response = await apiClient.get<PropertyListResponse>('/api/storefront/catalog/cabins')
  return response.data.properties
}

// Cabin create/update types
export interface CabinCreateData {
  title: string
  cabin_slug?: string
  body?: string
  tagline?: string
  bedrooms?: string
  bathrooms?: string
  sleeps?: number
  property_type?: Array<{ tid: number; name: string }>
  amenities?: Array<{ tid: number; name: string }>
  features?: string[]
  featured_image_url?: string
  featured_image_alt?: string
  featured_image_title?: string
  gallery_images?: any[]
  latitude?: number
  longitude?: number
  streamline_id?: number
  phone?: string
  matterport_url?: string
  location?: string | number
  rates_description?: string
  video?: Array<{ video_url?: string; thumbnail_path?: string; embed_code?: string; description?: string }>
  address?: {
    country?: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip_code?: string
  }
  status?: 'published' | 'draft' | 'archived'
}

export type CabinUpdateData = Partial<CabinCreateData>

/**
 * Create a new cabin
 */
export async function createCabin(data: CabinCreateData): Promise<Cabin> {
  const response = await apiClient.post<Cabin>('/api/v1/admin/cabins', data)
  return response.data
}

/**
 * Update an existing cabin
 */
export async function updateCabin(cabinId: string, data: CabinUpdateData): Promise<Cabin> {
  const response = await apiClient.put<Cabin>(`/api/v1/admin/cabins/${cabinId}`, data)
  return response.data
}

/**
 * Get a single cabin by ID for admin (includes all statuses)
 */
export async function getAdminCabinById(cabinId: string): Promise<Cabin> {
  const response = await apiClient.get<Cabin>(`/api/v1/admin/cabins/${cabinId}`)
  return response.data
}
