export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { getAllCabins } from '@/lib/api/cabins'
import CabinFilter from '@/components/cabin/CabinFilter'


export default async function Home() {
  const cabins = await getAllCabins()
  return (
    <div className="mb-[-1px] min-h-full mt-0 relative h-auto pb-[30px] align-top py-5 px-5">
      <div className="mb-8">
        <h1 className="font-normal italic text-[#7c2c00] my-[15px] mx-0 text-[220%] leading-[100%] max-[1010px]:text-[210%]">
          <em>Luxury Cabins in Blue Ridge, GA</em>
        </h1>
        <p className="text-[120%] leading-[120%] max-[1010px]:text-[115%]">
          As a family owned and operated Blue Ridge, GA vacation rental provider for over 20 years,
          Cabin Rentals of Georgia offers a boutique collection of luxury vacation rentals. Just 90
          miles north of Atlanta, GA, escape the city and spend a weekend (or longer) in the best
          cabins in Georgia.&nbsp;
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <strong>
            <Link href="/cabins/all/family-reunion" className="text-[#7c2c00] underline hover:text-[#b7714b]">
              Family Reunion&nbsp;
            </Link>
          </strong>
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <strong>
            <Link href="/amenities/hot-tub" className="text-[#7c2c00] underline hover:text-[#b7714b]">
              Cabins With Hot Tubs
            </Link>
          </strong>
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <strong>
            <Link href="/cabins/all/mountain-view" className="text-[#7c2c00] underline hover:text-[#b7714b]">
              Mountain View Cabins
            </Link>
          </strong>
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <strong>
            <Link href="/cabins/all/river-front" className="text-[#7c2c00] underline hover:text-[#b7714b]">
              Creek + Riverfront Cabins
            </Link>
          </strong>
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <strong>
            <Link href="/cabins/all/lake-view" className="text-[#7c2c00] underline hover:text-[#b7714b]">
              Lake View Cabins
            </Link>
          </strong>
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <Link href="/cabins/all/cabin-in-the-woods" className="text-[#7c2c00] underline hover:text-[#b7714b]">
            <strong>Cabins in the Woods</strong>
          </Link>
        </p>
        <p className="text-[120%] leading-[120%] m-[10px_0px_15px] max-[1010px]:text-[115%]">
          <strong>
            <Link href="/cabins/all/pet-friendly" className="text-[#7c2c00] underline hover:text-[#b7714b]">
              Pet Friendly Cabins
            </Link>
          </strong>
        </p>
        <h2 className="font-normal italic text-[#7c2c00] text-[170%] leading-[100%]">
          <em>North Georgia Cabin Rentals</em>
        </h2>
        <p className="text-[120%] leading-[120%] max-[1010px]:text-[115%]">
          Cabin Rentals of Georgia offers you a variety of hand-picked North Georgia cabin rentals
          ranging from cozy 2-bedrooms to magnificent 5-bedroom mountain lodges. Our properties offer
          deluxe hot tubs, fun game rooms with billiards, shuffleboard, arcade machines, along with
          fire pits, Toccoa River access, and other exciting amenities you expect from your private
          cabin rental.&nbsp;
        </p>
      </div>
      <CabinFilter cabins={cabins} />
    </div>
  )
}

