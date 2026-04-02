import { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getCabinBySlug, Cabin } from '@/lib/api/cabins'
import { cleanHtmlContent, stripHtmlTags } from '@/lib/utils/html-utils'
import PageLoading from '@/components/ui/PageLoading'
import Image from 'next/image'
import Link from 'next/link'
import AmenityStrip from '@/components/cabin/AmenityStrip'
import CabinGallery from '@/components/cabin/CabinGallery'
import HeroImage from '@/components/cabin/HeroImage'
import ProcessedHTML from '@/components/content/ProcessedHTML'
import YouTubeVideoEmbed from '@/components/cabin/YouTubeVideoEmbed'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'
import AmenityMatrix from '@/components/cabin/AmenityMatrix'
import LikeSaveButton from '@/components/cabin/LikeSaveButton'
import CabinReviews from '@/components/cabin/CabinReviews'
import ReadMore from '@/components/ui/ReadMore'

interface PageProps {
  params: {
    slug: string[]
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = params
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

const CabinBody = ({ cabin, className }: { cabin: Cabin, className: string }) => {
  return (
    cabin.body && (
      <ReadMore collapsedHeight={320}>
        <ProcessedHTML
          html={cleanHtmlContent(cabin.body.replaceAll("https://www.cabin-rentals-of-georgia.com", ""))}
          className={`prose prose-stone max-w-none prose-p:text-[#533e27] prose-headings:text-[#7c2c00] prose-headings:font-normal prose-a:text-[#7c2c00] prose-li:text-[#533e27] prose-strong:text-[#533e27] ${className}`}
        />
      </ReadMore>
    )
  )
}

const PropertyFeatures = ({ cabin, className }: { cabin: Cabin, className: string }) => {
  if (!cabin.features || cabin.features.length === 0) return null

  return (
    <div className={className}>
      <h3 className="text-[20px] text-[#533e27] font-normal my-[15px] leading-[15px] mt-[30px]">Property Features</h3>
      <ReadMore collapsedHeight={200}>
        <ul className="!list-none space-y-2 text-[#533e27] !p-0">
          {cabin.features.map((feature, index) => (
            <li key={index} className='pl-[30px] bg-[url("/images/bullet_star.png")] bg-[5px_4px] bg-no-repeat'>{feature}</li>
          ))}
        </ul>
      </ReadMore>
    </div>
  )
}


const RatesContent = ({ cabin }: { cabin: Cabin }) => {
  if (!cabin.rates_description) return null
  const html = cleanHtmlContent(cabin.rates_description)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(html)
  return (
    <div className='flex flex-col p-[30px_15px_20px_15px] bg-[url("/images/cabin_separator.png")] bg-[center_top] bg-no-repeat'>
      <span className='text-[130%]'>Rates</span>
      {hasHtmlTags ? (
        <ProcessedHTML
          html={html}
          className="prose prose-stone max-w-none prose-p:text-[#533e27] prose-a:text-[#7c2c00] text-[100%] max-[1010px]:text-[115%]"
        />
      ) : (
        <p className="text-[#533e27] text-[100%] max-[1010px]:text-[115%] leading-[140%] whitespace-pre-line">
          {cabin.rates_description.trim()}
        </p>
      )}
    </div>
  )
}

async function CabinContent({ slug }: { slug: string[] }) {
  const slugString = slug.join('/')

  try {
    const cabin = await getCabinBySlug(slugString)

    if (!cabin || cabin.status !== 'published') {
      notFound()
    }

    const galleryImages = cabin.gallery_images || []
    const cabinInfo = `${cabin.bedrooms || ''}, ${cabin.bathrooms || ''}${cabin.sleeps ? ` ~ Sleeps ${cabin.sleeps}` : ''}`

    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5 block">
        {/* Featured Image */}
        {cabin.featured_image_url && (
          <HeroImage
            src={cabin.featured_image_url}
            alt={cabin.featured_image_alt || cabin.title}
            title={cabin.featured_image_title || undefined}
            photoCount={galleryImages.length}
          />
        )}

        <div className='flex items-start justify-between pl-[20px] max-[767px]:justify-center'>
          {/* Cabin Title */}
          <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            {cabin.title}
            <br />
            <span className='text-[80%]'>
              {cabin.address?.city}
              {cabin.address?.city && cabin.address?.state && ', '}
              {cabin.address?.state}
            </span>
          </h1>
          <LikeSaveButton cabinId={cabin.id} cabinTitle={cabin.title} className="mt-[10px] max-[767px]:hidden" />
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
              <span>{cabin.bedrooms} Bedroom, </span>
            )}
            {cabin.bathrooms && (
              <span>{cabin.bathrooms} Bath</span>
            )}
            {cabin.sleeps && (
              <span> ~ Sleeps {cabin.sleeps}</span>
            )}
          </div>

          {/* Today's Rate */}
          <div className="text-[#533e27] text-[21px] max-[1010px]:text-[17.28px] italic leading-[100%]">
            {cabin.today_rate && (
              <span>from ${Math.round(cabin.today_rate)}/night (view daily rates)</span>
            )}
          </div>

          {/* Amenities */}
          {cabin.amenities && cabin.amenities.length > 0 && (
            <AmenityStrip amenities={cabin.amenities} />
          )}
        </div>

        <div className='flex items-start justify-between max-[1010px]:justify-end max-[767px]:justify-center'>
          <div className='flex flex-col w-[62%] hidden min-[1010px]:block pl-[20px]'>
            {/* Body Content with Read More */}
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
            <Link href={`/checkout/${cabin.id}?arrive=&depart=`}>
              <Image
                src='/images/btn_instant_quote_small.png'
                alt='Get an Instant Quote'
                width={196}
                height={196}
                className='cursor-pointer p-[3px] object-contain mx-auto'
              />
            </Link>
            <Link href={`/checkout/${cabin.id}?arrive=&depart=`} className='text-[19px] text-center text-[#7c2c00] hover:text-[#b7714b] leading-[100%] cursor-pointer italic underline mt-[5px]'>Detailed Price</Link>
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

            {/* Features on desktop sidebar */}
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

        {/* Amenity Matrix */}
        {cabin.amenity_matrix && Object.keys(cabin.amenity_matrix).length > 0 && (
          <div className="mb-8">
            <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">
              Amenities & Features
            </h3>
            <AmenityMatrix matrix={cabin.amenity_matrix} />
          </div>
        )}

        {/* Availability Calendar */}
        <div className="mb-8">
          <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">
            Availability
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <Link href={`/checkout/${cabin.id}?arrive=&depart=`}>
              <Image
                src='/images/btn_instant_quote_small.png'
                alt='Get an Instant Quote'
                width={120}
                height={120}
                className='cursor-pointer object-contain'
              />
            </Link>
            <div className="flex flex-col">
              <Link href={`/checkout/${cabin.id}?arrive=&depart=`} className='text-[16px] text-[#7c2c00] hover:text-[#b7714b] cursor-pointer italic underline'>Detailed Price</Link>
              <span className='text-[13px] text-[#533e27]'>Available to reserve online 24/7</span>
            </div>
          </div>
          <AvailabilityCalendar
            cabinId={cabin.id}
            months={12}
            showRates={true}
          />
        </div>

        {/* Rates */}
        {cabin.rates_description && (
          <RatesContent cabin={cabin} />
        )}

        {/* Videos */}
        {cabin.video && cabin.video.length > 0 && (
          <div className="mb-8">
            <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">Videos</h3>
            <div className="space-y-6 px-[10px]">
              {cabin.video.map((video: any, index: number) => {
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
        {galleryImages.length > 0 && (
          <CabinGallery
            images={galleryImages}
            cabinTitle={cabin.title}
            cabinInfo={cabinInfo}
          />
        )}

        {/* Guest Reviews / Memories */}
        {cabin.reviews && cabin.reviews.length > 0 && (
          <CabinReviews reviews={cabin.reviews} cabinTitle={cabin.title} />
        )}

        {/* Specials & Cross-sell */}
        <div className="mb-8 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-[10px]">
            <Link
              href="/specials"
              className="block border border-[#e8dcc8] rounded-[6px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-[15px] bg-[#faf6ef]">
                <h4 className="text-[#7c2c00] text-[16px] font-semibold mb-1">Specials!</h4>
                <p className="text-[#533e27] text-[13px]">Check out Special Offers on Blue Ridge Luxury Cabin Rentals</p>
              </div>
            </Link>
            <Link
              href="/blue-ridge-experience"
              className="block border border-[#e8dcc8] rounded-[6px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-[15px] bg-[#faf6ef]">
                <h4 className="text-[#7c2c00] text-[16px] font-semibold mb-1">The Blue Ridge Experience</h4>
                <p className="text-[#533e27] text-[13px]">Discover outdoor adventures, dining, and family fun in the North Georgia mountains</p>
              </div>
            </Link>
            <Link
              href="/blue-ridge-cabins?bedrooms=5"
              className="block border border-[#e8dcc8] rounded-[6px] overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-[15px] bg-[#faf6ef]">
                <h4 className="text-[#7c2c00] text-[16px] font-semibold mb-1">Planning a Large Group Event?</h4>
                <p className="text-[#533e27] text-[13px]">Family reunions, corporate retreats, and group getaways in Blue Ridge, GA</p>
              </div>
            </Link>
          </div>
        </div>
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
