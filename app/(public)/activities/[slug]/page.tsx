import { Metadata } from 'next'
import { Suspense } from 'react'
import { getTermBySlug } from '@/lib/api/taxonomy'
import { getActivities } from '@/lib/api/activities'
import PageLoading from '@/components/ui/PageLoading'
import Image from 'next/image'
import Link from 'next/link'
import ProcessedHTML from '@/components/content/ProcessedHTML'

interface PageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params

  try {
    const term = await getTermBySlug(slug, 10) // vid = 10 for activities
    const title = term.page_title || term.name

    return {
      title: `${title} | Cabin Rentals of Georgia`,
      description: term.description
        ? term.description.replace(/<[^>]*>/g, '').substring(0, 160)
        : `Explore ${term.name} activities in Blue Ridge, GA.`,
    }
  } catch (error) {
    return {
      title: 'Activities | Cabin Rentals of Georgia',
      description: 'Explore activities in Blue Ridge, GA.',
    }
  }
}

async function ActivitiesContent({ slug }: { slug: string }) {
  try {
    // Fetch taxonomy term data from Supabase (vid = 10 for activities)
    const term = await getTermBySlug(slug, 10)

    // Use page title if available, otherwise use term name
    const title = term.page_title || term.name

    // Fetch activities filtered by activity type term ID
    const activitiesData = await getActivities({
      page: 1,
      page_size: 50,
      status: 'published',
      activity_type_tid: term.tid,
    })

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        <h1 >{title}</h1>
        <ProcessedHTML
          html={term.description?.replaceAll("https://www.cabin-rentals-of-georgia.com", "") || 'No description available'}
          className="prose prose-lg mx-auto mb-8"
        />

        {activitiesData.activities.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-[#533e27]">
              No activities found for this category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 max-[767px]:grid-cols-1 md:grid-cols-2 gap-6">
            {activitiesData.activities.map((activity) => (
              <Link
                key={activity.id}
                href={activity.activity_slug ? `/activity/${activity.activity_slug}` : `/activity/${activity.slug}`}
                className="block group"
                
              >
                <div className="relative w-full max-[767px]:max-w-[235px] max-[767px]:mx-auto overflow-hidden" style={{ boxShadow: '0px 0px 7px #333' }}>
                  {activity.featured_image_url ? (
                    <>
                      <div className="relative">
                        <Image
                          src={activity.featured_image_url}
                          alt={activity.featured_image_alt || activity.title}
                          width={609}
                          height={390}
                          className="w-full h-auto bg-transparent p-[3px] shadow-lg"
                        />
                        {/* Text Overlay */}
                        <div className="absolute flex flex-col justify-end p-4 left-0 bottom-0">
                          <h3 className="text-white text-[120%] no-underline hover:underline m-0">
                            {activity.title}
                          </h3>
                          <span className="text-white italic text-[110%]">
                            {term.name}
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
        )}
      </div>
    )
  } catch (error: any) {
    // If term not found or error, show fallback content
    console.error('Error fetching activities:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            <em>Activities</em>
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

export default async function ActivitiesPage({ params }: PageProps) {
  const { slug } = params

  return (
    <Suspense fallback={<PageLoading message="Loading activities..." variant="cabin" />}>
      <ActivitiesContent slug={slug} />
    </Suspense>
  )
}

