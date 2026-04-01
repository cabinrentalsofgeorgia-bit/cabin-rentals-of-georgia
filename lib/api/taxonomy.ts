/**
 * Taxonomy API functions
 */
import { apiClient } from './client'

export interface TaxonomyTerm {
  tid: number
  vid: number
  name: string
  description: string | null
  format: string | null
  weight: number
  page_title: string | null
  video_url: string | null
}

export interface TaxonomyTermListResponse {
  terms: TaxonomyTerm[]
  count: number
}

// Vocabulary IDs
export const VOCABULARY_IDS = {
  BEDROOMS: 2,
  PROPERTY_TYPE: 3,
  AMENITIES: 4,
  BATHROOMS: 5,
  LOCATIONS: 6,
} as const

/**
 * Get all taxonomy terms for a vocabulary by ID
 * 
 * @param vid - Vocabulary ID (2=Bedrooms, 3=Property Type, 4=Amenities, 5=Bathrooms, 6=Locations)
 */
export async function getTermsByVocabulary(vid: number): Promise<TaxonomyTerm[]> {
  const response = await apiClient.get<TaxonomyTermListResponse>(
    `/api/v1/taxonomy/terms/${vid}`
  )
  return response.data.terms
}

/**
 * Get bedroom options
 */
export async function getBedroomOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(VOCABULARY_IDS.BEDROOMS)
}

/**
 * Get property type options
 */
export async function getPropertyTypeOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(VOCABULARY_IDS.PROPERTY_TYPE)
}

/**
 * Get amenity options
 */
export async function getAmenityOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(VOCABULARY_IDS.AMENITIES)
}

/**
 * Get bathroom options
 */
export async function getBathroomOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(VOCABULARY_IDS.BATHROOMS)
}

/**
 * Get location options
 */
export async function getLocationOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(VOCABULARY_IDS.LOCATIONS)
}

/**
 * Get taxonomy term by category and slug
 * Mimics the Drupal routing logic
 */
export async function getTermByCategorySlug(
  category: string,
  slug: string
): Promise<TaxonomyTerm> {
  const response = await apiClient.get<TaxonomyTerm>(
    `/api/storefront/catalog/taxonomy`,
    {
      params: { slug, category },
    }
  )
  return response.data
}

export async function getTermBySlug(
  slug: string,
  vid?: number
): Promise<TaxonomyTerm> {
  const response = await apiClient.get<TaxonomyTerm>(
    `/api/storefront/catalog/taxonomy`,
    {
      params: { slug, ...(vid && { vid }) },
    }
  )
  return response.data
}

// Activity taxonomy vocabulary IDs (based on Drupal structure)
export const ACTIVITY_VOCABULARY_IDS = {
  ACTIVITY_TYPE: 10,
  AREAS: 12, // Assuming areas have their own vocabulary
  AGES: 11,
  PEOPLE: 9,
  DIFFICULTY_LEVEL: 7,
  SEASON: 8,
} as const

/**
 * Get activity type options
 */
export async function getActivityTypeOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(ACTIVITY_VOCABULARY_IDS.ACTIVITY_TYPE)
}

/**
 * Get area options (locations for activities)
 */
export async function getAreaOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(ACTIVITY_VOCABULARY_IDS.AREAS)
}

/**
 * Get age options
 */
export async function getAgeOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(ACTIVITY_VOCABULARY_IDS.AGES)
}

/**
 * Get people/group size options
 */
export async function getPeopleOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(ACTIVITY_VOCABULARY_IDS.PEOPLE)
}

/**
 * Get difficulty level options
 */
export async function getDifficultyLevelOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(ACTIVITY_VOCABULARY_IDS.DIFFICULTY_LEVEL)
}

/**
 * Get season options
 */
export async function getSeasonOptions(): Promise<TaxonomyTerm[]> {
  return getTermsByVocabulary(ACTIVITY_VOCABULARY_IDS.SEASON)
}