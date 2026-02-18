/**
 * API functions for activities
 */
import { apiClient } from './client'

export interface Activity {
  id: string
  title: string
  slug: string
  activity_slug: string | null
  body: string | null
  body_summary: string | null
  address: string | null
  activity_type: string | null
  activity_type_tid: number | null
  area: string | null
  area_tid: number | null
  people: string | null
  people_tid: number | null
  difficulty_level: string | null
  difficulty_level_tid: number | null
  season: string | null
  season_tid: number | null
  featured_image_url: string | null
  featured_image_alt: string | null
  featured_image_title: string | null
  video_urls: string[] | null
  latitude: number | null
  longitude: number | null
  status: string
  is_featured: boolean
  display_order: number
  drupal_nid: number | null
  drupal_vid: number | null
  created_at: string
  updated_at: string | null
  published_at: string | null
}

export interface ActivityListResponse {
  activities: Activity[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ActivityListParams {
  page?: number
  page_size?: number
  status?: string
  activity_type_tid?: number
  search?: string
}


/**
 * Fetch all activities without pagination and filtering
 */
export async function getAllActivities(): Promise<Activity[]> {
  const response = await apiClient.get<Activity[]>('/api/v1/activities/getAllActivities')
  return response.data
}

/**
 * Fetch all activities with optional filters (public endpoint - only shows published)
 */
export async function getActivities(params?: ActivityListParams): Promise<ActivityListResponse> {
  const response = await apiClient.get<ActivityListResponse>('/api/v1/activities', {
    params,
  })
  return response.data
}

/**
 * Fetch all activities for admin panel with optional filters (shows all statuses)
 */
export async function getAdminActivities(params?: ActivityListParams): Promise<ActivityListResponse> {
  const response = await apiClient.get<ActivityListResponse>('/api/v1/admin/activities', {
    params,
  })
  return response.data
}

/**
 * Fetch a single activity by slug
 */
export async function getActivityBySlug(slug: string): Promise<Activity> {
  const response = await apiClient.get<Activity>(`/api/v1/activities/slug/${slug}`)
  return response.data
}

/**
 * Fetch a single activity by activity_slug (full URL path from Drupal)
 * 
 * Handles multi-segment URLs:
 * - 'hiking/bell-mountain' (from /activity/hiking/bell-mountain)
 * - 'fishing/blue-ridge/captn-joes-lake-adventures' (from /activity/fishing/blue-ridge/captn-joes-lake-adventures)
 * - 'fishing/lake-chatuge' (from /activity/fishing/lake-chatuge)
 * 
 * @param activity_slug - The full slug path (e.g., 'hiking/bell-mountain')
 * @returns Activity data
 */
export async function getActivityByActivitySlug(activity_slug: string): Promise<Activity> {
  // URL encode the slug to handle special characters and slashes in path parameters
  const encodedSlug = encodeURIComponent(activity_slug)
  
  const response = await apiClient.get<Activity>(`/api/v1/activities/activity-slug/${encodedSlug}`)
  return response.data
}

/**
 * Fetch a single activity by ID (public - only published)
 */
export async function getActivityById(id: string): Promise<Activity> {
  const response = await apiClient.get<Activity>(`/api/v1/activities/${id}`)
  return response.data
}

/**
 * Fetch a single activity by ID (admin - all statuses)
 */
export async function getAdminActivityById(id: string): Promise<Activity> {
  const response = await apiClient.get<Activity>(`/api/v1/admin/activities/${id}`)
  return response.data
}

export interface ActivityCreateData {
  title: string
  slug?: string
  activity_slug?: string
  body?: string
  body_summary?: string
  address?: string
  activity_type?: string
  activity_type_tid?: number
  area?: string
  area_tid?: number
  people?: string
  people_tid?: number
  difficulty_level?: string
  difficulty_level_tid?: number
  season?: string
  season_tid?: number
  featured_image_url?: string
  featured_image_alt?: string
  featured_image_title?: string
  video_urls?: string[]
  latitude?: number
  longitude?: number
  status?: 'published' | 'draft' | 'archived'
  is_featured?: boolean
  display_order?: number
  published_at?: string
}

export type ActivityUpdateData = Partial<ActivityCreateData>

/**
 * Create a new activity
 */
export async function createActivity(data: ActivityCreateData): Promise<Activity> {
  const response = await apiClient.post<Activity>('/api/v1/admin/activities', data)
  return response.data
}

/**
 * Update an existing activity
 */
export async function updateActivity(activityId: string, data: ActivityUpdateData): Promise<Activity> {
  const response = await apiClient.put<Activity>(`/api/v1/admin/activities/${activityId}`, data)
  return response.data
}

/**
 * Delete an activity by ID
 */
export async function deleteActivity(activityId: string): Promise<{ message: string; id: string }> {
  const response = await apiClient.delete<{ message: string; id: string }>(`/api/v1/admin/activities/${activityId}`)
  return response.data
}

/**
 * Update an activity's status
 */
export async function updateActivityStatus(
  activityId: string,
  newStatus: 'published' | 'draft' | 'archived'
): Promise<{ message: string; id: string }> {
  const response = await apiClient.patch<{ message: string; id: string }>(
    `/api/v1/admin/activities/${activityId}/status`,
    { new_status: newStatus }
  )
  return response.data
}

