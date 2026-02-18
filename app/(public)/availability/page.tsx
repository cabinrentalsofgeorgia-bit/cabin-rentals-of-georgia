import { redirect } from 'next/navigation'

/**
 * Availability page redirect
 * 
 * Redirects /availability to /availability/{current_year}/{current_month}
 */
export default function AvailabilityRedirect() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  
  redirect(`/availability/${year}/${month}`)
}

