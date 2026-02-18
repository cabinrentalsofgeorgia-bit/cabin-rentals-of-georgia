import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCabinBySlug, Cabin } from '@/lib/api/cabins'
import { cleanHtmlContent, stripHtmlTags } from '@/lib/utils/html-utils'
import PageLoading from '@/components/ui/PageLoading'
import Image from 'next/image'
import Link from 'next/link'
import { amenityIcons } from '@/lib/constants/amenity-icons'
import CabinGallery from '@/components/cabin/CabinGallery'
import ProcessedHTML from '@/components/content/ProcessedHTML'
import YouTubeVideoEmbed from '@/components/cabin/YouTubeVideoEmbed'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'

interface PageProps {
  params: {
    slug: string[]  // Array of URL segments after /cabin
    // Examples:
    // /cabin/cherry-log/creekside-green -> slug = ['cherry-log', 'creekside-green']
    // /cabin/happy-ours-lodge -> slug = ['happy-ours-lodge']
  }
}

/**
 * Generate metadata for the cabin page
 * 
 * Handles URLs like:
 * - /cabin/cherry-log/creekside-green (sends 'cherry-log/creekside-green' to API)
 * - /cabin/happy-ours-lodge (sends 'happy-ours-lodge' to API)
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
  // Join slug segments with '/' to create the full slug path (everything after /cabin)
  const slugString = slug.join('/')

  try {
    const cabin = await getCabinBySlug(slugString)

    if (!cabin || cabin.status !== 'published') {
      return {
        title: 'Cabin Not Found | Cabin Rentals of Georgia',
        description: 'The cabin you are looking for could not be found.',
      }
    }

    const metaTitle = cabin.title
    const metaDescription = cabin.body
      ? stripHtmlTags(cabin.body).substring(0, 160)
      : `Book ${cabin.title} - Cabin Rentals of Georgia`

    return {
      title: `${metaTitle} | Cabin Rentals of Georgia`,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: 'website',
        ...(cabin.featured_image_url && {
          images: [{ url: cabin.featured_image_url }],
        }),
      },
    }
  } catch (error) {
    return {
      title: 'Cabin Not Found | Cabin Rentals of Georgia',
      description: 'The cabin you are looking for could not be found.',
    }
  }
}

// Create a component for the cabin body
const CabinBody = ({ cabin, className }: { cabin: Cabin, className: string }) => {
  return (
    cabin.body && (
      <ProcessedHTML
        html={cleanHtmlContent(cabin.body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
        className={className}
      />
    )
  )
}

// Create a component for the property features
const PropertyFeatures = ({ cabin, className }: { cabin: Cabin, className: string }) => {
  return (
    <div className={className}>
      <h3 className="text-[20px] text-[#533e27] font-normal my-[15px] leading-[15px] mt-[30px]">Property Features</h3>
      <ul className="!list-none space-y-2 text-[#533e27] !p-0">
        {cabin.features?.map((feature, index) => (
          <li key={index} className='pl-[30px] bg-[url("/images/bullet_star.png")] bg-[5px_4px] bg-no-repeat'>{feature}</li>
        ))}
      </ul>
    </div>
  )
}


const RatesContent = ({ cabin }: { cabin: Cabin }) => {
  return (
    <div className='flex flex-col p-[30px_15px_20px_15px] bg-[url("/images/cabin_separator.png")] bg-[center_top] bg-no-repeat'>
      <span className='text-[130%]'>Rates</span>
      <p className="text-[#533e27] text-[100%] max-[1010px]:text-[115%] leading-[100%]">
        {(() => {
          const text = cabin.rates_description;
          // Split by double newline or look for the pattern where second paragraph starts
          const parts = text?.split(/\n\n+/);
          if (parts?.length && parts?.length >= 2) {
            // If split by double newline, join with <br><br>
            return (
              <>
                {parts?.[0]}
                <br /><br />
                {parts?.slice(1).join('\n\n')}
              </>
            );
          }
          // Fallback: try to split by "Please contact us" pattern
          const contactIndex = text?.indexOf('Please contact us');
          if (contactIndex && contactIndex > 0) {
            return (
              <>
                {text?.substring(0, contactIndex).trim()}
                <br /><br />
                {text?.substring(contactIndex).trim()}
              </>
            );
          }
          // If no clear split, just render as is
          return text?.trim();
        })()}
      </p>
    </div>
  )
}
/**
 * Cabin content component
 * 
 * Fetches cabin data using the slug path (everything after /cabin)
 * Examples:
 * - /cabin/cherry-log/creekside-green -> fetches with slug 'cherry-log/creekside-green'
 * - /cabin/happy-ours-lodge -> fetches with slug 'happy-ours-lodge'
 */
async function CabinContent({ slug }: { slug: string[] }) {
  // Join slug segments to create the full slug path to send to API
  // This removes the '/cabin' prefix and sends only the slug part
  const slugString = slug.join('/')

  try {
    // Fetch cabin data using the slug (tries cabin_slug first, then slug field)
    const cabin = await getCabinBySlug(slugString)

    if (!cabin || cabin.status !== 'published') {
      notFound()
    }

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        {/* Featured Image */}
        {cabin.featured_image_url && (
          <div className="mb-1 relative text-white leading-[23px]">
            <Image
              src={cabin.featured_image_url.replace("/sites/default/files/", "/images/styles/cabin_featured_main2/public/")}
              alt={cabin.featured_image_alt || cabin.title}
              title={cabin.featured_image_title || undefined}
              width={800}
              height={600}
              className="w-full h-auto p-[3px]"
              priority
              style={{ boxShadow: '0 0 10px #333' }}
            />
            <span className='absolute bottom-[10px] right-[20px] text-[140%]'>+<i>{cabin.gallery_images?.length}</i><br />Photos</span>
          </div>
        )}

        <div className='flex items-start justify-between pl-[20px] max-[767px]:justify-center'>
          {/* Cabin Title */}
          <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0 leading-[100%]">
            {cabin.title}
            <br />
            <span className='text-[80%]'>
              {cabin.address?.city}
              {cabin.address?.city && cabin.address?.state && ', '}
              {cabin.address?.state}
            </span>
          </h1>
          <button className="bg-[url('/images/icon_save_favorite5.png')] bg-center bg-no-repeat mt-[10px] w-[100px] h-[30px] text-white text-[110%] max-[767px]:hidden" />
        </div>

        <div className='flex flex-col gap-[5px] p-[0px_0px_20px_20px] bg-[url("/images/cabin_separator.png")] bg-[center_bottom] bg-no-repeat max-[1010px]:w-[53%] max-[767px]:w-[100%] max-[767px]:text-center'>
          {/* Property Listings */}
          <div className='text-[#5333e27] text-[21px] max-[1010px]:text-[17.28px] italic max-w-[360px]'>
            {cabin.property_type && cabin.property_type.length > 0 && Array.isArray(cabin.property_type) && (
              <>
                {cabin.property_type.map(item => item.name).join(', ')}
              </>
            )}
          </div>
          {/* Property Details */}
          <div className="text-[#533e27] text-[21px] max-[1010px]:text-[17.28px] italic leading-[100%]">
            {cabin.bedrooms && (
              <span>{cabin.bedrooms}, </span>
            )}
            {cabin.bathrooms && (
              <span>{cabin.bathrooms}</span>
            )}
            {cabin.sleeps && (
              <span> ~ Sleeps {cabin.sleeps}</span>
            )}
          </div>

          {/* Today's Rate */}
          <div className="text-[#533e27] text-[21px] max-[1010px]:text-[17.28px] italic leading-[100%]">
            {cabin.today_rate && (
              <span>from ${Math.round(cabin.today_rate)} (view daily rates)</span>
            )}
          </div>

          {/* Amenities */}
          {cabin.amenities && cabin.amenities.length > 0 && (
            <div className="flex flex-wrap gap-[5px] mt-[5px] items-center max-[767px]:justify-center">
              {cabin.amenities.map((amenity: any, index: number) => (
                <Image
                  key={amenity.name}
                  src={amenityIcons[amenity.name] || '/images/icon_internet_0.png'}
                  alt={amenity.name}
                  title={amenity.name}
                  width={24}
                  height={24}
                  className='cursor-pointer'
                />
              ))}
            </div>
          )}
        </div>

        <div className='flex items-start justify-between max-[1010px]:justify-end max-[767px]:justify-center'>
          <div className='flex flex-col w-[62%] hidden min-[1010px]:block pl-[20px]'>
            {/* Body Content */}
            <CabinBody
              cabin={cabin}
              className='min-[1010px]:pr-[15px]'
            />
            <PropertyFeatures
              cabin={cabin}
              className='block min-[1010px]:hidden'
            />
          </div>

          {/* Right Side Content */}
          <div className='flex flex-col w-[38%] flex-shrink-0 -mt-[140px] max-[1010px]:w-[50%] max-[1010px]:-mt-[170px] max-[767px]:mt-0'>
            <Link href={`/reservations/book/${cabin.id}`}>
              <Image
                src='/images/btn_instant_quote_small.png'
                alt='Instant Quote'
                width={196}
                height={196}
                className='cursor-pointer p-[3px] object-contain mx-auto'
              />
            </Link>
            <Link href={`/reservations/book/${cabin.id}`} className='text-[19px] text-center text-[#7c2c00] hover:text-[#b7714b] leading-[100%] cursor-pointer italic underline mt-[5px]'>Detailed Price</Link>
            <span className='text-[14px] mb-[10px] text-center'>Available to reserve online 24/7</span>
            <Image
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${cabin.latitude},${cabin.longitude}&zoom=15&size=190x190&maptype=roadmap&markers=size:small%7Ccolor:red%7C${cabin.latitude},${cabin.longitude}&scale=2&format=png32&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyD0ozy1aDQV-n8bQBm3gMaaiyw499-zsug'}`}
              alt='Cabin Map'
              width={196}
              height={196}
              className='cursor-pointer p-[3px] w-[196px] h-[196px] object-cover p-[3px] mx-auto  bg-white'
              style={{ boxShadow: '0 0 10px #333' }}
            />
            <Link href={`/cabin-map?cabin=${cabin.id}`} className='text-[14px] mb-[10px] text-center'>View larger map and nearby cabins</Link>

            {/* Features */}
            <PropertyFeatures
              cabin={cabin}
              className='max-[1010px]:hidden'
            />
          </div>
        </div>

        <div className='flex-col hidden max-[1010px]:flex'>
          <CabinBody
            cabin={cabin}
            className='block min-[1010px]:hidden'
          />

          <PropertyFeatures
            cabin={cabin}
            className='block min-[1010px]:hidden'
          />
        </div>

        {/* Availability Calendar */}
        <div className="mb-8">
          <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">
            Availability
          </h3>
          <AvailabilityCalendar
            cabinId={cabin.id}
            months={12}
            showRates={true}
          />
        </div>

        {/* Daily rate - removed minimum_rate field */}
        {cabin.rates_description && (
          <RatesContent cabin={cabin} />
        )}

        {/* Videos */}
        {cabin.video && cabin.video.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">Videos</h3>
            <div className="space-y-6 px-[10px]">
              {cabin.video.map((video: any, index: number) => {
                // Use video_url if available, otherwise try embed_code
                const videoUrl = video.video_url || video.embed_code || ''

                if (!videoUrl) {
                  return null
                }

                return (
                  <YouTubeVideoEmbed
                    key={index}
                    url={videoUrl}
                    title={video.title}
                    description={video.description}
                    width={560}
                    height={315}
                    className="mb-6"
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* Gallery Images */}
        {cabin.gallery_images && cabin.gallery_images.length > 0 && (
          <CabinGallery
            images={cabin.gallery_images}
            cabinTitle={cabin.title}
            cabinInfo={`${cabin.bedrooms || ''}, ${cabin.bathrooms || ''}${cabin.sleeps ? ` ~ Sleeps ${cabin.sleeps}` : ''}`}
          />
        )}
      </div>
    )
  } catch (error: any) {
    console.error('Error fetching cabin:', error)

    if (error?.response?.status === 404) {
      notFound()
    }

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            <em>Cabin Not Found</em>
          </h1>
          <div className="text-center py-10">
            <p className="text-[#533e27] text-lg">
              The cabin you are looking for could not be found. Please check the URL and try again.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default async function CabinPage({ params }: PageProps) {
  const { slug } = params

  return (
    <Suspense fallback={<PageLoading message="Loading cabin details..." variant="cabin" />}>
      <CabinContent slug={slug} />
    </Suspense>
  )
}

