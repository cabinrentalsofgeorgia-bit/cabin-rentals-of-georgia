export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/pages'
import PageLoading from '@/components/ui/PageLoading'
import { stripLegacyHtml } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'large-groups-family-reunions'

async function LargeGroupsContent() {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Planning Your Large Group Event in Blue Ridge, GA'
    const body = page.body_value || ''

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>{title}</em>
        </h1>
        {body ? (
          <ProcessedHTML
            html={stripLegacyHtml(body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
            className="prose prose-legacy max-w-none text-[#533e27] mb-8"
          />
        ) : (
          <div className="text-[#533e27] py-6">
            <p className="mb-4">
              Planning a large group event in Blue Ridge, Georgia? Whether it&apos;s a family reunion,
              corporate retreat, or group getaway, we have cabins perfect for your needs.
            </p>
            <p>
              Call us at{' '}
              <a href="tel:7064322140" className="text-[#7c2c00] hover:text-[#b7714b] underline">(706) 432-2140</a>
              {' '}to discuss your group event.
            </p>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching large groups page:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>Planning Your Large Group Event in Blue Ridge, GA</em>
        </h1>
        <div className="text-[#533e27] py-6">
          <p className="mb-4">
            Planning a large group event in Blue Ridge, Georgia? Whether it&apos;s a family reunion,
            corporate retreat, or group getaway, we have cabins perfect for your needs.
          </p>
          <p>
            Call us at{' '}
            <a href="tel:7064322140" className="text-[#7c2c00] hover:text-[#b7714b] underline">(706) 432-2140</a>
            {' '}to discuss your group event.
          </p>
        </div>
      </div>
    )
  }
}

export default async function LargeGroupsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading large group event info..." variant="cabin" />}>
      <LargeGroupsContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Planning Your Large Group Event in Blue Ridge, GA'
    const description = page.body_summary
      ? page.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
      : page.body_value
        ? page.body_value.replace(/<[^>]*>/g, '').substring(0, 160)
        : 'Plan your family reunion, corporate retreat, or large group event in Blue Ridge, GA with our luxury cabin rentals.'

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description,
    } as Metadata
  } catch {
    return {
      title: 'Large Group Events | Cabin Rentals of Georgia',
      description: 'Plan your family reunion, corporate retreat, or large group event in Blue Ridge, GA with our luxury cabin rentals.',
    } as Metadata
  }
}
