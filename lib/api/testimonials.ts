/**
 * Testimonial API functions
 */
import { apiClient } from './client'

export interface CustomerImage {
  url: string
  title?: string
  width?: number
  height?: number
}

export interface Testimonial {
  id: string
  title: string
  body: string | null
  cabin_name: string | null
  cabin_slug: string | null
  customer_image: CustomerImage | null
  author_name: string | null
  status: string
  is_featured: boolean
  is_sticky: boolean
  display_order: number
  created_at: string
  updated_at: string | null
  published_at: string | null
}

export interface TestimonialListResponse {
  testimonials: Testimonial[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TestimonialListParams {
  page?: number
  page_size?: number
  status?: string
  featured?: boolean
  cabin_name?: string
  search?: string
}

/**
 * Fetch all testimonials with optional filters
 */
export async function getTestimonials(params?: TestimonialListParams): Promise<TestimonialListResponse> {
  const response = await apiClient.get<TestimonialListResponse>('/api/storefront/catalog/testimonials', {
    params,
  })
  return response.data
}

/**
 * Fetch all testimonials with optional filters (Admin endpoint - shows all statuses by default)
 */
export async function getAdminTestimonials(params?: TestimonialListParams): Promise<TestimonialListResponse> {
  const response = await apiClient.get<TestimonialListResponse>('/api/v1/admin/testimonials', {
    params,
  })
  return response.data
}

/**
 * Fetch a single testimonial by ID
 */
export async function getTestimonialById(id: string): Promise<Testimonial> {
  const response = await apiClient.get<Testimonial>(`/api/v1/testimonials/${id}`)
  return response.data
}


/**
 * Fetch featured testimonials
 */
export async function getFeaturedTestimonials(limit: number = 5): Promise<Testimonial[]> {
  const response = await apiClient.get<Testimonial[]>('/api/v1/testimonials/featured', {
    params: { limit },
  })
  return response.data
}

/**
 * Fetch recent testimonials
 */
export async function getRecentTestimonials(limit: number = 5): Promise<Testimonial[]> {
  const response = await apiClient.get<Testimonial[]>('/api/v1/testimonials/recent', {
    params: { limit },
  })
  return response.data
}

export interface TestimonialCreateData {
  title: string
  body?: string
  cabin_name?: string
  cabin_slug?: string
  customer_image?: CustomerImage
  author_name?: string
  status?: 'published' | 'draft' | 'archived'
  is_featured?: boolean
  is_sticky?: boolean
  display_order?: number
  published_at?: string
}

export type TestimonialUpdateData = Partial<TestimonialCreateData>

/**
 * Create a new testimonial
 */
export async function createTestimonial(data: TestimonialCreateData): Promise<Testimonial> {
  const response = await apiClient.post<Testimonial>('/api/v1/admin/testimonials', data)
  return response.data
}

/**
 * Update an existing testimonial
 */
export async function updateTestimonial(testimonialId: string, data: TestimonialUpdateData): Promise<Testimonial> {
  const response = await apiClient.put<Testimonial>(`/api/v1/admin/testimonials/${testimonialId}`, data)
  return response.data
}

/**
 * Delete a testimonial by ID
 */
export async function deleteTestimonial(testimonialId: string): Promise<{ message: string; id: string }> {
  const response = await apiClient.delete<{ message: string; id: string }>(`/api/v1/admin/testimonials/${testimonialId}`)
  return response.data
}

/**
 * Update a testimonial's status
 */
export async function updateTestimonialStatus(
  testimonialId: string,
  newStatus: 'published' | 'draft' | 'archived'
): Promise<{ message: string; id: string }> {
  const response = await apiClient.patch<{ message: string; id: string }>(
    `/api/v1/admin/testimonials/${testimonialId}/status?new_status=${newStatus}`
  )
  return response.data
}


