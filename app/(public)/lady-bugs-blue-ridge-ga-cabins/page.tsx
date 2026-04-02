export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/pages'
import PageLoading from '@/components/ui/PageLoading'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'lady-bugs-blue-ridge-ga-cabins'

async function LadyBugsContent() {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Ladybugs in Blue Ridge GA Cabins'
    const body = page.body_value || ''

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>{title}</em>
        </h1>
        {body ? (
          <ProcessedHTML
            html={cleanHtmlContent(body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
            className="prose prose-legacy max-w-none text-[#533e27] mb-8"
          />
        ) : (
          <div className="text-[#533e27] text-lg py-6">
            <p className="mb-4">
              If you've ever stayed in a mountain cabin during the cooler months, you may have noticed
              ladybugs making themselves at home. This is a completely natural occurrence in the Blue Ridge
              Mountains and is common across all cabin rental companies in the area.
            </p>
            <p>
              Learn more about why ladybugs visit our mountain cabins and what we do to ensure your
              stay remains comfortable and enjoyable.
            </p>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching ladybugs page:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>Ladybugs in Blue Ridge GA Cabins</em>
        </h1>
        <div className="text-[#533e27] text-lg py-6">
          <p className="mb-4">
            If you've ever stayed in a mountain cabin during the cooler months, you may have noticed
            ladybugs making themselves at home. This is a completely natural occurrence in the Blue Ridge
            Mountains and is common across all cabin rental companies in the area.
          </p>
        </div>
      </div>
    )
  }
}

export default async function LadyBugsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading page content..." variant="cabin" />}>
      <LadyBugsContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Ladybugs in Blue Ridge GA Cabins'
    const description = page.body_summary
      ? page.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
      : page.body_value
      ? page.body_value.replace(/<[^>]*>/g, '').substring(0, 160)
      : 'Learn about ladybugs in Blue Ridge Georgia cabins — a natural mountain phenomenon. Tips for a comfortable cabin stay in the North Georgia mountains.'

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description,
    } as Metadata
  } catch {
    return {
      title: 'Ladybugs in Blue Ridge GA Cabins | Cabin Rentals of Georgia',
      description: 'Learn about ladybugs in Blue Ridge Georgia cabins — a natural mountain phenomenon. Tips for a comfortable cabin stay in the North Georgia mountains.',
    } as Metadata
  }
}
