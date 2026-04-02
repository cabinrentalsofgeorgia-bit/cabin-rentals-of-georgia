export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getPageBySlug } from '@/lib/api/pages'
import PageLoading from '@/components/ui/PageLoading'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'specials-discounts'

async function SpecialsDiscountsContent() {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Specials & Discounts'
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
              Check back often for our latest specials and discounts on cabin rentals in Blue Ridge, Georgia.
              We regularly offer seasonal promotions, last-minute deals, and extended-stay savings.
            </p>
            <p>
              Call us at{' '}
              <a href="tel:8006095170" className="text-blue-700 hover:underline">(800) 609-5170</a>
              {' '}to ask about current availability and special rates.
            </p>
          </div>
        )}
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching specials page:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
          <em>Specials & Discounts</em>
        </h1>
        <div className="text-[#533e27] text-lg py-6">
          <p className="mb-4">
            Check back often for our latest specials and discounts on cabin rentals in Blue Ridge, Georgia.
            We regularly offer seasonal promotions, last-minute deals, and extended-stay savings.
          </p>
          <p>
            Call us at{' '}
            <a href="tel:8006095170" className="text-blue-700 hover:underline">(800) 609-5170</a>
            {' '}to ask about current availability and special rates.
          </p>
        </div>
      </div>
    )
  }
}

export default async function SpecialsDiscountsPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading specials and discounts..." variant="cabin" />}>
      <SpecialsDiscountsContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const page = await getPageBySlug(slug)
    const title = page.title || 'Specials & Discounts'
    const description = page.body_summary
      ? page.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
      : page.body_value
      ? page.body_value.replace(/<[^>]*>/g, '').substring(0, 160)
      : 'Save on your next Blue Ridge cabin vacation with our specials and discounts. Seasonal deals, last-minute savings, and extended-stay promotions.'

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description,
    } as Metadata
  } catch {
    return {
      title: 'Specials & Discounts | Cabin Rentals of Georgia',
      description: 'Save on your next Blue Ridge cabin vacation with our specials and discounts. Seasonal deals, last-minute savings, and extended-stay promotions.',
    } as Metadata
  }
}
