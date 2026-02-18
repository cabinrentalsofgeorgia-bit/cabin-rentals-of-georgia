/**
 * Calendar API functions
 */

// Remove trailing slash from API URL to prevent double slashes
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')

export interface CabinAvailabilityCheck {
  cabin_id: string
  is_available: boolean
  unavailable_dates: string[]
}

export interface AvailableCabinsResponse {
  arrival_date: string
  departure_date: string
  total_cabins_checked: number
  available_cabin_ids: string[]
  details: Record<string, CabinAvailabilityCheck>
}

export interface CalendarState {
  sid: number
  css_class: string
  label: string | null
  weight: number
  is_available: boolean
}

export interface CalendarAvailability {
  cid: number
  date: string
  sid: number
  state: CalendarState | null
}

export interface DailyRate {
  id: string
  cabin_id: string | null
  streamline_id: number
  date: string
  daily_rate: number
  created_at: string
  updated_at: string | null
}

export interface CalendarMonthResponse {
  year: number
  month: number
  availability: Record<string, CalendarAvailability>
  rates: Record<string, DailyRate>
  states: CalendarState[]
}

export interface CabinCalendarResponse {
  cabin_id: string
  calendar_id: number
  streamline_id: number | null
  months: CalendarMonthResponse[]
}

// Type aliases for backwards compatibility
export type CabinCalendar = CabinCalendarResponse
export type CalendarMonth = CalendarMonthResponse

/**
 * Get available cabins for a date range
 * This efficiently queries the database to find all cabins where
 * NO dates in the range are marked as unavailable (is_available=false)
 */
export async function getAvailableCabins(
  arrivalDate: string,
  departureDate: string
): Promise<AvailableCabinsResponse> {
  const response = await fetch(
    `${API_URL}/api/v1/calendar/available-cabins?arrival_date=${arrivalDate}&departure_date=${departureDate}`,
    {
      cache: 'no-store', // Don't cache availability data - it changes frequently
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `Failed to check availability: ${response.status}`)
  }

  return response.json()
}

/**
 * Get calendar data for a specific cabin
 */
export async function getCabinCalendar(
  cabinId: string,
  months: number = 3,
  startDate?: string,
  includeRates: boolean = true
): Promise<CabinCalendarResponse> {
  const params = new URLSearchParams({
    months: months.toString(),
    include_rates: includeRates.toString(),
  })

  if (startDate) {
    params.append('start_date', startDate)
  }

  const response = await fetch(
    `${API_URL}/api/v1/calendar/cabin/${cabinId}?${params}`,
    {
      cache: 'no-store',
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `Failed to fetch calendar: ${response.status}`)
  }

  return response.json()
}

/**
 * Get calendar states (available, booked, etc.)
 */
export async function getCalendarStates(): Promise<CalendarState[]> {
  const response = await fetch(`${API_URL}/api/v1/calendar/states`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error('Failed to fetch calendar states')
  }

  return response.json()
}

export interface CabinAvailabilityMatrixItem {
  cabin_id: string
  cabin_title: string
  cabin_slug: string
  calendar_id: number | null
  availability: Record<string, string> // date string -> css_class
}

export interface AvailabilityMatrixResponse {
  year: number
  month: number
  cabins: CabinAvailabilityMatrixItem[]
  states: CalendarState[]
}

/**
 * Get availability matrix for all cabins for a specific month
 */
export async function getAvailabilityMatrix(
  year: number,
  month: number
): Promise<AvailabilityMatrixResponse> {
  const response = await fetch(
    `${API_URL}/api/v1/calendar/availability-matrix/${year}/${month}`,
    {
      cache: 'no-store', // Don't cache availability data
    }
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `Failed to fetch availability matrix: ${response.status}`)
  }

  return response.json()
}