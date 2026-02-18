/**
 * Blog API functions
 */
import { apiClient } from './client'

export interface Blog {
  id: string
  title: string
  slug: string
  body: string
  author_name: string | null
  status: string
  is_promoted: boolean
  is_sticky: boolean
  created_at: string
  updated_at: string | null
  published_at: string | null
}

export interface BlogListResponse {
  blogs: Blog[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface BlogListParams {
  page?: number
  page_size?: number
  status?: string
  featured?: boolean
  search?: string
}

/**
 * Fetch all blogs with optional filters
 */
export async function getBlogs(params?: BlogListParams): Promise<BlogListResponse> {
  const response = await apiClient.get<BlogListResponse>('/api/v1/blogs', {
    params,
  })
  return response.data
}

/**
 * Fetch a single blog by ID
 */
export async function getBlogById(id: string): Promise<Blog> {
  const response = await apiClient.get<Blog>(`/api/v1/blogs/${id}`)
  return response.data
}

/**
 * Fetch a single blog by slug
 */
export async function getBlogBySlug(slug: string): Promise<Blog> {
  const response = await apiClient.get<Blog>(`/api/v1/blogs/slug/${slug}`)
  return response.data
}


/**
 * Fetch featured blogs
 */
export async function getFeaturedBlogs(limit: number = 5): Promise<Blog[]> {
  const response = await apiClient.get<Blog[]>('/api/v1/blogs/featured', {
    params: { limit },
  })
  return response.data
}

/**
 * Fetch recent blogs
 */
export async function getRecentBlogs(limit: number = 5): Promise<Blog[]> {
  const response = await apiClient.get<Blog[]>('/api/v1/blogs/recent', {
    params: { limit },
  })
  return response.data
}

export interface BlogCreateData {
  title: string
  slug?: string
  body?: string
  author_name?: string
  status?: 'published' | 'draft' | 'archived'
  is_promoted?: boolean
  is_sticky?: boolean
  published_at?: string
}

export type BlogUpdateData = Partial<BlogCreateData>

/**
 * Create a new blog post
 */
export async function createBlog(data: BlogCreateData): Promise<Blog> {
  const response = await apiClient.post<Blog>('/api/v1/admin/blogs', data)
  return response.data
}

/**
 * Update an existing blog post
 */
export async function updateBlog(blogId: string, data: BlogUpdateData): Promise<Blog> {
  const response = await apiClient.put<Blog>(`/api/v1/admin/blogs/${blogId}`, data)
  return response.data
}

/**
 * Delete a blog post by ID
 */
export async function deleteBlog(blogId: string): Promise<{ message: string; id: string }> {
  const response = await apiClient.delete<{ message: string; id: string }>(`/api/v1/admin/blogs/${blogId}`)
  return response.data
}

/**
 * Update a blog post's status
 */
export async function updateBlogStatus(
  blogId: string,
  newStatus: 'published' | 'draft' | 'archived'
): Promise<{ message: string; id: string }> {
  const response = await apiClient.patch<{ message: string; id: string }>(
    `/api/v1/admin/blogs/${blogId}/status?new_status=${newStatus}`
  )
  return response.data
}

