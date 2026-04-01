import { notFound } from 'next/navigation'
import { getCabinById, Cabin } from '@/lib/api/cabins'
import Image from 'next/image'
import { amenityIcons } from '@/lib/constants/amenity-icons'
import AvailabilityCalendar from '@/components/cabin/AvailabilityCalendar'
import BookingForm from '@/components/booking/BookingForm'
import StreamlineBookingFrame from '@/components/booking/StreamlineBookingFrame'

interface PageProps {
    params: {
        cabinId: string
    }
}

export async function generateMetadata({ params }: PageProps) {
    try {
        const cabin = await getCabinById(params.cabinId)
        return {
            title: `Book ${cabin.title} | Cabin Rentals of Georgia`,
            description: `Book your getaway at ${cabin.title} - ${cabin.bedrooms}, ${cabin.bathrooms}, Sleeps ${cabin.sleeps}`,
        }
    } catch {
        return {
            title: 'Book Your Getaway | Cabin Rentals of Georgia',
        }
    }
}

export default async function BookingPage({ params }: PageProps) {
    let cabin: Cabin

    try {
        cabin = await getCabinById(params.cabinId)
    } catch (error) {
        console.error('Error fetching cabin:', error)
        notFound()
    }

    return (
        <div className="py-5 px-5 flex flex-col">
            {/* Page Title */}
            <h1 className="text-[180%] text-[#7c2c00] italic mb-4">
                Book Your Getaway - {cabin.title}
            </h1>

            {/* Cabin Summary Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-8 pb-6 border-b border-[#d4c4a8]">
                {/* Left - Cabin Info */}
                <div className="flex-1">
                    {/* Cabin Name */}
                    <h2 className="text-[24px] text-[#7c2c00] italic mb-1">
                        {cabin.title}
                    </h2>

                    {/* Location */}
                    {cabin.address && (cabin.address.city || cabin.address.state) && (
                        <p className="text-[#7c2c00] italic text-[16px] mb-2">
                            {cabin.address.city}
                            {cabin.address.city && cabin.address.state && ', '}
                            {cabin.address.state}
                        </p>
                    )}

                    {/* Property Type */}
                    {cabin.property_type && cabin.property_type.length > 0 && (
                        <p className="text-[#533e27] italic text-[15px] mb-1">
                            {cabin.property_type.map((pt: any) => pt.name).join(', ')}
                        </p>
                    )}

                    {/* Bedrooms, Bathrooms, Sleeps */}
                    <p className="text-[#533e27] italic text-[15px] mb-3">
                        {cabin.bedrooms && <span>{cabin.bedrooms}, </span>}
                        {cabin.bathrooms && <span>{cabin.bathrooms}</span>}
                        {cabin.sleeps && <span> ~ Sleeps {cabin.sleeps}</span>}
                    </p>

                    {/* Amenity Icons */}
                    {cabin.amenities && cabin.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-[5px] items-center">
                            {cabin.amenities.map((amenity: any) => (
                                <Image
                                    key={amenity.name}
                                    src={amenityIcons[amenity.name] || '/images/icons/icon_internet_0.png'}
                                    alt={amenity.name}
                                    title={amenity.name}
                                    width={24}
                                    height={24}
                                    className="cursor-pointer"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right - Featured Image */}
                {cabin.featured_image_url && (
                    <div className="w-full md:w-[280px] flex-shrink-0">
                        <Image
                            src={cabin.featured_image_url.replace("/sites/default/files/", "/images/styles/cabins_listing_large2/public/")}
                            alt={cabin.featured_image_alt || cabin.title}
                            width={280}
                            height={180}
                            className="w-full h-auto rounded shadow-md object-cover"
                            style={{ boxShadow: '0 0 10px #333' }}
                        />
                    </div>
                )}
            </div>


            <div className="flex-1">
                <AvailabilityCalendar
                    cabinId={cabin.id}
                    months={12}
                    showRates={false}
                    visibleMonths={3}
                />
            </div>

            {cabin.streamline_id ? (
                <div className="w-full mt-8">
                    <StreamlineBookingFrame propertyId={cabin.streamline_id} />
                </div>
            ) : (
                <div className="w-full lg:w-[280px] flex-shrink-0">
                    <BookingForm
                        cabinId={cabin.id}
                        maxOccupancy={cabin.sleeps || 16}
                        petFriendly={cabin.amenities?.some((a: any) =>
                            a.name.toLowerCase().includes('pet')
                        ) ?? false}
                    />
                </div>
            )}
        </div>
    )
}
