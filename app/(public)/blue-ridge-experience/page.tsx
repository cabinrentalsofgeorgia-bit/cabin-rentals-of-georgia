export const dynamic = 'force-dynamic'

import { Metadata } from 'next'
import { Suspense } from 'react'
import { getTermBySlug } from '@/lib/api/taxonomy'
import PageLoading from '@/components/ui/PageLoading'
import { getAllActivities } from '@/lib/api/activities'
import Image from 'next/image'
import Link from 'next/link'
import ProcessedHTML from '@/components/content/ProcessedHTML'

const slug = 'blue-ridge-experience'
async function BlueRidgeExperienceContent() {
  try {
    const term = await getTermBySlug(slug)
    // Use page title if available, otherwise use term name
    const title = term.page_title || term.name

    const activities = await getAllActivities()
    
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 className="text-4xl mb-8">{title}</h1>
        <ProcessedHTML
          html={term.description?.replaceAll("https://www.cabin-rentals-of-georgia.com", "") || 'No description available'}
          className="prose prose-lg mx-auto mb-8 "
        />
        <div className="grid grid-cols-1 max-[767px]:grid-cols-1 md:grid-cols-2 gap-6">
          {activities.map((activity) => (
            <Link
              key={activity.id}
              href={`/activity/${activity.activity_slug}`}
              className="block group"
            >
              <div className="relative w-full max-[767px]:max-w-[235px] max-[767px]:mx-auto overflow-hidden" style={{ boxShadow: '0px 0px 7px #333' }}>
                {activity.featured_image_url ? (
                  <>
                    <div className="relative">
                      <Image
                        src={activity.featured_image_url.replace("/sites/default/files/", "/images/styles/activities_listing/public/")}
                        alt={activity.title}
                        width={609}
                        height={390}
                        className="w-full h-auto bg-transparent p-[3px]"
                      />
                      {/* Text Overlay */}
                      <div className="absolute flex flex-col justify-end p-4 left-0 bottom-0">
                        <h3 className="text-white text-[120%] no-underline hover:underline m-0">
                          {activity.title}
                        </h3>
                        <span className="text-white italic text-[110%]">
                          {activity.activity_type}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full bg-gray-200 flex items-center justify-center p-8">
                    <p className="text-[#533e27] font-semibold text-center px-4">
                      {activity.title}
                    </p>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
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

export default async function BlueRidgeExperiencePage() {
  return (
    <Suspense fallback={<PageLoading message="Loading information about Blue Ridge Experience..." variant="cabin" />}>
      <BlueRidgeExperienceContent />
    </Suspense>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const term = await getTermBySlug(slug)
    if (!term) {
      return {
        title: 'Blue Ridge Experience | Cabin Rentals of Georgia',
        description: 'Browse our complete collection of luxury cabin rentals in Blue Ridge, GA. From cozy 2-bedrooms to spacious 5-bedroom lodges, find your perfect mountain getaway.',
      } as Metadata
    }
    return {
      title: `${term.name} Experience | Cabin Rentals of Georgia`,
      description: term.description,
    } as Metadata
  } catch (error) {
    console.error('Error fetching Blue Ridge Experience metadata:', error)
    return {
      title: 'Blue Ridge Experience | Cabin Rentals of Georgia',
      description: 'Browse our complete collection of luxury cabin rentals in Blue Ridge, GA. From cozy 2-bedrooms to spacious 5-bedroom lodges, find your perfect mountain getaway.',
    } as Metadata
  }
}
