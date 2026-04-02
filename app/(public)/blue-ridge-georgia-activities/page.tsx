export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/pages'
import PageLoading from '@/components/ui/PageLoading'
import { stripLegacyHtml } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'blue-ridge-georgia-activities'

async function BlueRidgeGeorgiaActivitiesContent() {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Blue Ridge, Georgia Activities'
    const body = page.body_value || 'No content available'
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>{title}</em>
        </h1>
        <ProcessedHTML
          html={stripLegacyHtml(body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
          className="prose prose-legacy max-w-none text-[#533e27] mb-8"
        />
      </div>
    )
  } catch (error: any) {
    // If page not found or error, show fallback content
    console.error('Error fetching page content:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            <em>Blue Ridge, Georgia Activities</em>
          </h1>
          <div className="text-center py-10">
            <p className="text-[#533e27] text-lg">
              {error?.response?.status === 404
                ? 'Page not found. Please check the URL and try again.'
                : 'Unable to load page content. Please try again later.'}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default async function BlueRidgeGeorgiaActivitiesPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading activities information..." variant="cabin" />}>
      <BlueRidgeGeorgiaActivitiesContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Blue Ridge, Georgia Activities'
    const description = page.body_summary
      ? page.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
      : page.body_value
        ? page.body_value.replace(/<[^>]*>/g, '').substring(0, 160)
        : 'Discover the best activities and attractions in Blue Ridge, Georgia. From outdoor adventures to local attractions, find everything you need for an unforgettable vacation.'

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description,
    } as Metadata
  } catch (error) {
    return {
      title: 'Blue Ridge, Georgia Activities | Cabin Rentals of Georgia',
      description: 'Discover the best activities and attractions in Blue Ridge, Georgia. From outdoor adventures to local attractions, find everything you need for an unforgettable vacation.',
    } as Metadata
  }
}

