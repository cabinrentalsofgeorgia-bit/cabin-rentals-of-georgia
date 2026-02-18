import { Metadata } from 'next'
import { Suspense } from 'react'
import { headers } from 'next/headers'
import { getActivityByActivitySlug } from '@/lib/api/activities'
import PageLoading from '@/components/ui/PageLoading'
import Image from 'next/image'
import Link from 'next/link'
import { cleanHtmlContent } from '@/lib/utils/html-utils'
import ProcessedHTML from '@/components/content/ProcessedHTML'
import SocialShare from '@/components/ui/SocialShare'

interface PageProps {
  params: {
    slug: string[] // This will capture all segments after /activity/
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
  const slugString = slug.join('/') // Joins ['hiking', 'bell-mountain'] into 'hiking/bell-mountain'

  try {
    const activity = await getActivityByActivitySlug(slugString)

    return {
      title: `${activity.title} | Activities | Cabin Rentals of Georgia`,
      description: activity.body_summary
        ? activity.body_summary.replace(/<[^>]*>/g, '').substring(0, 160)
        : `Learn more about ${activity.title} in Blue Ridge, GA.`,
    }
  } catch (error) {
    return {
      title: 'Activity | Cabin Rentals of Georgia',
      description: 'Explore activities in Blue Ridge, GA.',
    }
  }
}

async function ActivityContent({ slug }: { slug: string[] }) {
  const slugString = slug.join('/') // Joins ['hiking', 'bell-mountain'] into 'hiking/bell-mountain'

  // Get the current URL for social sharing
  const headersList = await headers()
  const host = headersList.get('host') || 'www.cabin-rentals-of-georgia.com'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const currentUrl = `${protocol}://${host}/activity/${slugString}`

  try {
    const activity = await getActivityByActivitySlug(slugString)

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
          {/* Title - Cursive brown font */}
          <h1 className="italic text-[#7c2c00] !mb-[2px]">
            {activity.title}
          </h1>

          {/* Family Fun and Location Text */}
          <div className="flex flex-col italic text-[110%] leading-[120%]">
            <span className="text-[#533e27]">Family Fun</span>
            <span className="text-[#533e27]">Located in Blue Ridge</span>
          </div>

          {/* Social Media Buttons */}
          <SocialShare
            url={currentUrl}
            title={activity.title}
            description={activity.body_summary ? activity.body_summary.replace(/<[^>]*>/g, '').substring(0, 160) : undefined}
            image={activity.featured_image_url || undefined}
          />
        </div>

        {/* <Link
          href="/blue-ridge-experience"
          className="text-[#7c2c00] underline hover:text-[#b7714b] mb-4 block"
        >
          View map of all activities
        </Link> */}
        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[62%_38%] gap-8 mb-8">
          {/* Left Column - Description */}
          <div>
            {activity.body && (
              <ProcessedHTML
                html={cleanHtmlContent(activity.body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
                className="prose prose-lg max-w-none text-[#533e27]"
              />
            )}
          </div>

          <div className="space-y-3 text-[#533e27]">
            {activity.address && (
              <ProcessedHTML
                html={cleanHtmlContent(activity.address)}
                className="prose prose-lg mx-auto mb-8 block"
              />
            )}
          </div>
        </div>

        {/* Location Map (if coordinates available) */}
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

