export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/pages'
import PageLoading from '@/components/ui/PageLoading'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'north-georgia-cabin-rentals'

async function NorthGeorgiaCabinRentalsContent() {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'North Georgia Cabin Rentals'
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
              Welcome to the premier collection of cabin rentals in North Georgia. From rustic mountain
              hideaways to modern luxury lodges, our properties offer the perfect escape in the
              heart of the Blue Ridge Mountains.
            </p>
            <p>
              <a href="/blue-ridge-cabins" className="text-blue-700 hover:underline">Browse all cabins</a>
              {' '}or call us at{' '}
              <a href="tel:8006095170" className="text-blue-700 hover:underline">(800) 609-5170</a>
              {' '}to find your perfect getaway.
            </p>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching North Georgia cabin rentals page:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>North Georgia Cabin Rentals</em>
        </h1>
        <div className="text-[#533e27] text-lg py-6">
          <p className="mb-4">
            Welcome to the premier collection of cabin rentals in North Georgia. From rustic mountain
            hideaways to modern luxury lodges, our properties offer the perfect escape in the
            heart of the Blue Ridge Mountains.
          </p>
          <p>
            <a href="/blue-ridge-cabins" className="text-blue-700 hover:underline">Browse all cabins</a>
            {' '}or call us at{' '}
            <a href="tel:8006095170" className="text-blue-700 hover:underline">(800) 609-5170</a>
            {' '}to find your perfect getaway.
          </p>
        </div>
      </div>
    )
  }
}

export default async function NorthGeorgiaCabinRentalsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading North Georgia cabin rentals..." variant="cabin" />}>
      <NorthGeorgiaCabinRentalsContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'North Georgia Cabin Rentals'
    const description = page.body_summary
      ? page.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
      : page.body_value
      ? page.body_value.replace(/<[^>]*>/g, '').substring(0, 160)
      : 'Discover North Georgia cabin rentals in the Blue Ridge Mountains. Luxury lodges, pet-friendly cabins, mountain views, river frontage, and more.'

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description,
    } as Metadata
  } catch {
    return {
      title: 'North Georgia Cabin Rentals | Cabin Rentals of Georgia',
      description: 'Discover North Georgia cabin rentals in the Blue Ridge Mountains. Luxury lodges, pet-friendly cabins, mountain views, river frontage, and more.',
    } as Metadata
  }
}
