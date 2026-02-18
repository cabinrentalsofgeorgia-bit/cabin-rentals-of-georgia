import { Metadata } from 'next'
import { Suspense } from 'react'
import CabinMap from '@/components/cabin/CabinMap'
import { getAllCabins, getCabinById } from '@/lib/api/cabins'
import PageLoading from '@/components/ui/PageLoading'

interface PageProps {
  searchParams: {
    cabin?: string
  }
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { cabin } = searchParams

  if (cabin) {
    try {
      const cabinData = await getCabinById(cabin)
      return {
        title: `${cabinData.title} Cabin Map | Cabin Rentals of Georgia`,
        description: `View ${cabinData.title} and nearby cabins on an interactive map.`,
      }
    } catch (error) {
      // Fall through to default metadata
    }
  }

  return {
    title: 'North Georgia Cabin Map | Cabin Rentals of Georgia',
    description: 'Explore all our cabin rentals on an interactive map. Find the perfect location for your North Georgia vacation.',
  }
}

async function CabinMapContent({ cabinId }: { cabinId?: string }) {
  try {
    // Fetch all published cabins
    const cabins = await getAllCabins()

    // Filter cabins that have valid coordinates (API already filters by published)
    const cabinsWithCoords = cabins.filter(
      (cabin) => cabin.latitude && cabin.longitude
    )

    // If a specific cabin is requested, verify it exists
    let selectedCabin = null
    if (cabinId) {
      try {
        selectedCabin = await getCabinById(cabinId)
        // Verify it has coordinates
        if (!selectedCabin.latitude || !selectedCabin.longitude) {
          selectedCabin = null
        }
      } catch (error) {
        // Cabin not found or invalid, ignore
        selectedCabin = null
      }
    }

    return (
      <CabinMap
        cabins={cabinsWithCoords}
        selectedCabinId={selectedCabin?.id || null}
      />
    )
  } catch (error) {
    console.error('Error loading cabins for map:', error)
    return (
      <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
        <div className="mb-8">
          <h1 className="font-normal italic text-[220%] text-[#7c2c00] leading-[100%] my-[15px] mx-0">
            <em>Error Loading Map</em>
          </h1>
          <div className="text-center py-10">
            <p className="text-[#533e27] text-lg">
              Unable to load the cabin map. Please try again later.
            </p>
          </div>
        </div>
      </div>
    )
  }
}

export default async function CabinMapPage({ searchParams }: PageProps) {
  const { cabin } = searchParams

  return (
    <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
      <h1 className="font-normal italic text-[42px] max-[1010px]:text-[36px] text-[#7c2c00] leading-[100%] my-[15px] mx-0 pl-[20px]">
        North Georgia Cabin Map
      </h1>
      <div className="pl-[20px] pr-[20px]">
        <Suspense fallback={<PageLoading message="Loading cabin map..." variant="cabin" />}>
          <CabinMapContent cabinId={cabin} />
        </Suspense>
      </div>
    </div>
  )
}

