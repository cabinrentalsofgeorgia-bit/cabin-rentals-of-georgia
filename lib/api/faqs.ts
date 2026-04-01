/**
 * FAQ API functions
 */
import { apiClient } from './client'

export interface FAQ {
  id: string
  question: string
  answer: string
  slug: string
  category: string | null
  tags: string[] | null
  display_order: number
  status: string
  is_featured: boolean
  created_at: string
  updated_at: string | null
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
}

export interface FAQListResponse {
  faqs: FAQ[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface FAQListParams {
  page?: number
  page_size?: number
  status?: string
  featured?: boolean
  category?: string
  search?: string
}

/**
 * Fetch all FAQs with optional filters
 */
export async function getFAQs(params?: FAQListParams): Promise<FAQListResponse> {
  const response = await apiClient.get<FAQListResponse>('/api/storefront/catalog/faqs', {
    params,
  })
  return response.data
}

/**
 * Fetch a single FAQ by ID
 */
export async function getFAQById(id: string): Promise<FAQ> {
  const response = await apiClient.get<FAQ>(`/api/v1/faqs/${id}`)
  return response.data
}

/**
 * Fetch a single FAQ by slug
 */
export async function getFAQBySlug(slug: string): Promise<FAQ> {
  const response = await apiClient.get<FAQ>(`/api/v1/faqs/slug/${slug}`)
  return response.data
}

/**
 * Fetch featured FAQs
 */
export async function getFeaturedFAQs(limit: number = 10): Promise<FAQ[]> {
  const response = await apiClient.get<FAQ[]>('/api/v1/faqs/featured', {
    params: { limit },
  })
  return response.data
}

/**
 * Fetch all FAQ categories
 */
export async function getFAQCategories(): Promise<string[]> {
  const response = await apiClient.get<string[]>('/api/v1/faqs/categories')
  return response.data
}

/**
 * Fetch FAQs by category
 */
export async function getFAQsByCategory(category: string): Promise<FAQ[]> {
  const response = await apiClient.get<FAQ[]>(`/api/v1/faqs/category/${category}`)
  return response.data
}

