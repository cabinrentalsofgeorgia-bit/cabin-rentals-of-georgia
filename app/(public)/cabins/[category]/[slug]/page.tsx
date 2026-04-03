import { Metadata } from 'next'
import { Suspense } from 'react'
import CabinListing from '@/components/cabin/CabinListing'
import { getTermByCategorySlug } from '@/lib/api/taxonomy'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import PageLoading from '@/components/ui/PageLoading'
import ProcessedHTML from '@/components/content/ProcessedHTML'
import YouTubeVideoEmbed from '@/components/cabin/YouTubeVideoEmbed'

interface PageProps {
  params: {
    category: string
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category, slug } = params

  try {
    const term = await getTermByCategorySlug(category, slug)
    const title = term.page_title || term.name

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description: term.description
        ? term.description.replace(/<[^>]*>/g, '').substring(0, 160)
        : `Browse our selection of ${term.name} cabins in Blue Ridge, GA.`,
    }
  } catch (error) {
    return {
      title: 'Cabin Rentals | Cabin Rentals of Georgia',
      description: 'Browse our selection of cabin rentals in Blue Ridge, GA.',
    }
  }
}

async function CabinCategoryContent({ category, slug }: { category: string; slug: string }) {
  try {
    // Fetch taxonomy term data from Supabase
    const term = await getTermByCategorySlug(category, slug)

    // Use page title if available, otherwise use term name
    const title = term.page_title || term.name

    // Determine filter parameters based on category and vid
    let categoryFilter: string | undefined
    let amenityFilter: string | undefined
    let bedroomsFilter: number | undefined

    if (category === 'amenities') {
      // For amenities, use the term name as amenity filter
      amenityFilter = term.name.toLowerCase().replace(/\s+/g, '-')
    } else if (category !== 'all') {
      // For bedroom categories, extract number
      const bedroomMatch = category.match(/(\d+)/)
      if (bedroomMatch) {
        bedroomsFilter = parseInt(bedroomMatch[1])
      }
    } else {
      // For property types (category='all'), use term name as category
      categoryFilter = term.name.toLowerCase().replace(/\s+/g, '-')
    }
    const descriptionHtml = term.description
      ? cleanHtmlContent(term.description.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))
      : null

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto align-top block p-[20px]">
        <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0">{title}</h1>
        {descriptionHtml && (
          <ProcessedHTML
            html={descriptionHtml}
            className="prose prose-legacy max-w-none mb-4"
          />
        )}

        {/* Video Section */}
        {term.video_url && (
          <div className="text-[130%] mb-2 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">
            <div className="px-[10px]">
              <YouTubeVideoEmbed
                url={term.video_url}
                title={""}
                width={560}
                height={315}
                className="mb-2"
              />
            </div>
          </div>
        )
        }
        <div className="text-[130%] mb-0 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[15px_0px_5px] text-[#533e27]">
        </div>
        <CabinListing
          category={categoryFilter}
          amenity={amenityFilter}
          bedrooms={bedroomsFilter}
          tid={term.tid}
        />
      </div>
    )
  } catch (error: any) {
    // If term not found or error, show fallback content
    console.error('Error fetching taxonomy term:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            <em>Cabin Rentals</em>
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

export default async function CabinCategoryPage({ params }: PageProps) {
  const { category, slug } = params

  return (
    <Suspense fallback={<PageLoading message="Loading cabin information..." variant="cabin" />}>
      <CabinCategoryContent category={category} slug={slug} />
    </Suspense>
  )
}

