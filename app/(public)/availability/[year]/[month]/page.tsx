import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import PageLoading from '@/components/ui/PageLoading'
import AvailabilityMatrix from '@/components/availability/AvailabilityMatrix'

interface PageProps {
  params: {
    year: string
    month: string
  }
}

/**
 * Generate metadata for the availability page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { year, month } = params
  const yearNum = parseInt(year, 10)
  const monthNum = parseInt(month, 10)

  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    return {
      title: 'Availability | Cabin Rentals of Georgia',
    }
  }

  const monthName = new Date(yearNum, monthNum - 1, 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  })

  return {
    title: `${monthName} Availability | Cabin Rentals of Georgia`,
    description: `View availability for all Blue Ridge cabin rentals in ${monthName}. Check real-time availability and book your perfect mountain getaway.`,
  }
}

/**
 * Availability Matrix Page
 * 
 * Displays a calendar matrix showing all cabins and their availability for a specific month.
 * URL pattern: /availability/2026/06
 */
async function AvailabilityContent({ params }: PageProps) {
  const { year, month } = params
  const yearNum = parseInt(year, 10)
  const monthNum = parseInt(month, 10)

  // Validate year and month
  if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    notFound()
  }

  return <AvailabilityMatrix year={yearNum} month={monthNum} />
}

export default function AvailabilityPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PageLoading message="Loading availability calendar..." />}>
      <AvailabilityContent params={params} />
    </Suspense>
  )
}

