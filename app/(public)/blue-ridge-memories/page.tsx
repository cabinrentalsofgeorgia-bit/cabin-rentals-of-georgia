export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getTermBySlug } from '@/lib/api/taxonomy'
import { getTestimonials, Testimonial } from '@/lib/api/testimonials'
import { cleanHtmlContent, stripHtmlTags } from '@/lib/utils/html-utils'
import PageLoading from '@/components/ui/PageLoading'
import Link from 'next/link'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'blue-ridge-memories'

async function fetchTestimonials(): Promise<Testimonial[]> {
  try {
    const data = await getTestimonials({
      page: 1,
      page_size: 100, // Fetch a large number to show all testimonials
      status: 'published',
    })
    return data.testimonials
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}

async function BlueRidgeMemoriesContent() {
  try {
    const [term, testimonials] = await Promise.all([
      getTermBySlug(slug),
      fetchTestimonials(),
    ])

    // Use page title if available, otherwise use term name
    const title = term.page_title || term.name

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 className="font-normal italic text-[#7c2c00] my-[15px] mx-0">
          <em>{title}</em>
        </h1>
        <ProcessedHTML
          html={term.description?.replaceAll("https://www.cabin-rentals-of-georgia.com", "") || 'No description available'}
          className="prose prose-legacy mx-auto mb-8 "
        />
        <div className="flex flex-col">
          {testimonials.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <p className="text-gray-700">No testimonials available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="flex gap-4 mb-[25px]">
                  {/* Customer Image - Floated Left */}
                  {testimonial.customer_image?.url ? (
                    <div className="flex-shrink-0">
                      <div className="customer-image shadow-[0px_0px_8px_1px_#888] p-0.5">
                        <img
                          src={testimonial.customer_image.url}
                          alt={testimonial.customer_image.title || testimonial.title || ''}
                          title={testimonial.customer_image.title || undefined}
                          width={testimonial.customer_image.width || 48}
                          height={testimonial.customer_image.height || 48}
                          className="block"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-shrink-0">
                      <div className="customer-image shadow-[0px_0px_8px_1px_#888] p-0.5">
                        <img
                          src="/images/testimonial_default.jpg"
                          alt=""
                          width={48}
                          height={48}
                          className="block"
                        />
                      </div>
                    </div>
                  )}

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col block">
                    {/* Testimonial Title */}
                    {testimonial.title && (
                      <span className="text-[#533e27] text-[130%] leading-[120%]">
                        {testimonial.title}
                      </span>
                    )}

                    {/* Cabin Name / Source */}
                    {testimonial.cabin_name && (
                      <div>
                        <span className="">This review is from: </span>
                        <Link
                          href={`/${testimonial.cabin_slug}`}
                          className="text-[#7c2c00] underline hover:text-[#b7714b]"
                        >
                          {testimonial.cabin_name}
                        </Link>
                      </div>
                    )}

                    {/* Testimonial Body */}
                    {testimonial.body && (
                      <ProcessedHTML
                        html={cleanHtmlContent(testimonial.body)}
                        className="text-[#533e27] italic memories-content"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error: any) {
    // If term not found or error, show fallback content
    console.error('Error fetching taxonomy term:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[#7c2c00] my-[15px] mx-0">
            <em>Blue Ridge Memories</em>
          </h1>
          <div className="text-center py-10">
            <p className="text-[#533e27]">
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

export default async function BlueRidgeMemoriesPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading cabin listings..." variant="cabin" />}>
      <BlueRidgeMemoriesContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const term = await getTermBySlug(slug)
    if (!term) {
      return {
        title: 'Blue Ridge Memories | Blue Ridge Memories',
        description: 'Browse our complete collection of luxury cabin rentals in Blue Ridge, GA. From cozy 2-bedrooms to spacious 5-bedroom lodges, find your perfect mountain getaway.',
      } as Metadata
    }
    return {
      title: `${term.name} | Blue Ridge Memories`,
      description: term.description,
    } as Metadata
  } catch (error) {
    console.error('Error fetching Blue Ridge Memories metadata:', error)
    return {
      title: 'Blue Ridge Memories | Blue Ridge Memories',
      description: 'Browse our complete collection of luxury cabin rentals in Blue Ridge, GA. From cozy 2-bedrooms to spacious 5-bedroom lodges, find your perfect mountain getaway.',
    } as Metadata
  }
}
