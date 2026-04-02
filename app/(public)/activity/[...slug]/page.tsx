import { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { getActivityByActivitySlug } from '@/lib/api/activities'
import PageLoading from '@/components/ui/PageLoading'
import Image from 'next/image'
import Link from 'next/link'
import { stripLegacyHtml, stripHtmlTags } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'
import SocialShare from '@/components/ui/SocialShare'
import LikeSaveButton from '@/components/cabin/LikeSaveButton'

interface PageProps {
  params: {
    slug: string[]
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
  const slugString = slug.join('/')

  try {
    const activity = await getActivityByActivitySlug(slugString)
    const plainBody = stripHtmlTags(stripLegacyHtml(activity.body || ''))

    return {
      title: `${activity.title} | Activities | Cabin Rentals of Georgia`,
      description: plainBody.substring(0, 160) || `Learn more about ${activity.title} in Blue Ridge, GA.`,
    }
  } catch (error) {
    return {
      title: 'Activity | Cabin Rentals of Georgia',
      description: 'Explore activities in Blue Ridge, GA.',
    }
  }
}

async function ActivityContent({ slug }: { slug: string[] }) {
  const slugString = slug.join('/')

  const headersList = await headers()
  const host = headersList.get('host') || 'www.cabin-rentals-of-georgia.com'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const currentUrl = `${protocol}://${host}/activity/${slugString}`

  try {
    const activity = await getActivityByActivitySlug(slugString)
    const cleanBody = stripLegacyHtml(activity.body || '')

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">

        {/* Featured Image */}
        {activity.featured_image_url && (
          <div className="relative w-full h-96 mb-8 overflow-hidden" style={{ boxShadow: '0px 0px 7px #333' }}>
            <Image
              src={activity.featured_image_url}
              alt={activity.featured_image_alt || activity.title}
              fill
              className="object-cover bg-transparent p-[3px]"
              priority
            />
          </div>
        )}

        {/* Header Section */}
        <div className="mb-1 bg-[url('/images/cabin_separator.png')] bg-[center_bottom] bg-no-repeat pb-[5px]">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="italic text-[#7c2c00] !mb-[2px]">
                {activity.title}
              </h1>
              <div className="flex flex-col italic text-[110%] leading-[120%]">
                {activity.activity_type && (
                  <span className="text-[#533e27]">{activity.activity_type}</span>
                )}
                <span className="text-[#533e27]">Located in Blue Ridge</span>
              </div>
            </div>
            <LikeSaveButton cabinId={activity.id} cabinTitle={activity.title} className="mt-[10px] max-[767px]:hidden" />
          </div>

          <SocialShare
            url={currentUrl}
            title={activity.title}
            description={stripHtmlTags(cleanBody).substring(0, 160) || undefined}
            image={activity.featured_image_url || undefined}
          />
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[62%_38%] gap-8 mb-8">
          {/* Left Column - Article Content */}
          <div>
            {cleanBody && (
              <ProcessedHTML
                html={cleanBody}
                className="prose prose-legacy max-w-none"
              />
            )}
          </div>

          {/* Right Column - Address/Info */}
          <div className="space-y-3 text-[#533e27]">
            {activity.address && (
              <ProcessedHTML
                html={stripLegacyHtml(activity.address)}
                className="prose prose-legacy mx-auto mb-8 block"
              />
            )}
          </div>
        </div>

        {/* Location Map */}
        {activity.latitude && activity.longitude && (
          <div className="mt-8">
            <h2 className="font-semibold text-[#7c2c00] mb-4">Location</h2>
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
              <div className="w-full h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${activity.latitude},${activity.longitude}`}
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <a
                  href={`https://www.google.com/maps?q=${activity.latitude},${activity.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#7c2c00] hover:underline font-semibold"
                >
                  View on Google Maps
                </a>
              </div>
            )}
          </div>
        )}

        {/* Cross-sell — legacy order: Specials, Large Groups, Activities */}
        <div className="mb-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-[10px]">
            <Link
              href="/specials-discounts"
              className="block border border-[#e8dcc8] rounded-[6px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-[15px] bg-[#faf6ef]">
                <h4 className="text-[#7c2c00] text-[16px] font-semibold mb-1">Specials!</h4>
                <p className="text-[#533e27] text-[13px]">Check out Special Offers on Blue Ridge Luxury Cabin Rentals</p>
              </div>
            </Link>
            <Link
              href="/large-groups-family-reunions"
              className="block border border-[#e8dcc8] rounded-[6px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-[15px] bg-[#faf6ef]">
                <h4 className="text-[#7c2c00] text-[16px] font-semibold mb-1">Planning Your Large Group Event</h4>
                <p className="text-[#533e27] text-[13px]">Family reunions, corporate retreats, and group getaways in Blue Ridge, GA</p>
              </div>
            </Link>
            <Link
              href="/blue-ridge-georgia-activities"
              className="block border border-[#e8dcc8] rounded-[6px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-[15px] bg-[#faf6ef]">
                <h4 className="text-[#7c2c00] text-[16px] font-semibold mb-1">Blue Ridge, Georgia Activities</h4>
                <p className="text-[#533e27] text-[13px]">Discover outdoor adventures, dining, and family fun in the North Georgia mountains</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching activity:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            <em>Activity Not Found</em>
          </h1>
          <div className="text-center py-10">
            <p className="text-[#533e27] ">
              {error?.response?.status === 404
                ? 'The activity you are looking for could not be found. Please check the URL and try again.'
                : 'Unable to load activity content. Please try again later.'}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default async function ActivityPage({ params }: PageProps) {
  const { slug } = params

  return (
    <Suspense fallback={<PageLoading message="Loading activity..." variant="cabin" />}>
      <ActivityContent slug={slug} />
    </Suspense>
  )
}
