export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/pages'
import PageLoading from '@/components/ui/PageLoading'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'experience-north-georgia'

async function ExperienceNorthGeorgiaContent() {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Experience North Georgia'
    const body = page.body_value || ''

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>{title}</em>
        </h1>
        {body ? (
          <ProcessedHTML
            html={cleanHtmlContent(body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
            className="prose prose-lg max-w-none text-[#533e27] mb-8"
          />
        ) : (
          <div className="text-[#533e27] text-lg py-6">
            <p className="mb-4">
              Discover the magic of North Georgia — from the rolling Blue Ridge Mountains to crystal-clear
              rivers and charming small towns. Our region offers year-round adventure, relaxation, and
              unforgettable experiences.
            </p>
            <p>
              Browse our{' '}
              <a href="/blue-ridge-georgia-activities" className="text-blue-700 hover:underline">activities guide</a>
              {' '}or explore our{' '}
              <a href="/blue-ridge-cabins" className="text-blue-700 hover:underline">cabin collection</a>
              {' '}to start planning your getaway.
            </p>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching experience page:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>Experience North Georgia</em>
        </h1>
        <div className="text-[#533e27] text-lg py-6">
          <p className="mb-4">
            Discover the magic of North Georgia — from the rolling Blue Ridge Mountains to crystal-clear
            rivers and charming small towns. Our region offers year-round adventure, relaxation, and
            unforgettable experiences.
          </p>
        </div>
      </div>
    )
  }
}

export default async function ExperienceNorthGeorgiaPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading North Georgia experience..." variant="cabin" />}>
      <ExperienceNorthGeorgiaContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Experience North Georgia'
    const description = page.body_summary
      ? page.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
      : page.body_value
      ? page.body_value.replace(/<[^>]*>/g, '').substring(0, 160)
      : 'Experience the best of North Georgia — stunning mountain views, outdoor adventures, charming towns, and luxury cabin rentals in the Blue Ridge Mountains.'

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description,
    } as Metadata
  } catch {
    return {
      title: 'Experience North Georgia | Cabin Rentals of Georgia',
      description: 'Experience the best of North Georgia — stunning mountain views, outdoor adventures, charming towns, and luxury cabin rentals in the Blue Ridge Mountains.',
    } as Metadata
  }
}
