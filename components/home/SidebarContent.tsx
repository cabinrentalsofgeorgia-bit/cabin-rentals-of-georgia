'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import RandomMemories from '@/components/shared/RandomMemories'
import { apiClient } from '@/lib/api/client'

interface SidebarReview {
  cabin: string
  cabinHref: string
  body: string
  customerImage: string
}

const callToActions = [
  {
    title: 'Specials!',
    href: '/specials-discounts',
    image: '/images/Specials.png',
    alt: 'Check out Special Offers on Blue Ridge Luxury Cabin Rentals',
    titleAttr: 'Special Offers on Blue Ridge Luxury Cabin Rentals',
  },
  {
    title: 'Planning Your Large Group Event in Blue Ridge, GA',
    href: '/large-groups-family-reunions',
    image: '/images/LG-call-to-action.jpg',
    alt: 'a small fly fishing corporate retreat on Wilscot Creek in North Georgia',
    titleAttr: 'A small corporate retreat fly fishing on private waters owned by Cabin Rentals Of Georgia',
  },
  {
    title: 'Blue Ridge, Georgia Activities',
    href: '/blue-ridge-georgia-activities',
    image: '/images/DSC_6283.jpg',
    alt: '',
    titleAttr: '',
  },
]

export default function SidebarContent() {
  const [allReviews, setAllReviews] = useState<SidebarReview[]>([])

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await apiClient.get<{ properties: any[] }>('/api/storefront/catalog/cabins')
        const cabins = res.data.properties || []
        const reviews: SidebarReview[] = []
        for (const cabin of cabins) {
          const cabinReviews = cabin.reviews || []
          const slug = cabin.cabin_slug || cabin.slug || ''
          for (const r of cabinReviews) {
            reviews.push({
              cabin: cabin.title,
              cabinHref: `/cabin/${slug}`,
              body: r.body || '',
              customerImage: '/images/testimonial_default.jpg',
            })
          }
        }
        setAllReviews(reviews)
      } catch {
        // Silently fall back to empty — no memories shown
      }
    }
    fetchReviews()
  }, [])

  return (
    <div className="py-5 px-5">
      {/* Favorites Block */}
      <div className="mb-6">
        <Link href="/compare">
          <Image
            src="/images/btn_view_favorites.png"
            alt="View and compare favorites"
            width={200}
            height={50}
            className="w-full h-auto max-w-[200px] mx-auto"
          />
        </Link>
      </div>

      {/* The Memories — randomly rotates 2 reviews per page load */}
      <RandomMemories allReviews={allReviews} count={2} />

      {/* Cross-sell Blocks — legacy order: Specials, Large Groups, Activities */}
      <div>
        {callToActions.map((cta, index) => (
          <div
            key={index}
            className="m-0 pt-2.5 pb-0 px-0"
          >
            <h2 className="text-center pb-[25px] mt-[20px] mb-[10px] bg-[url('/images/bg_block_header.png')] bg-[50%_100%] bg-no-repeat bg-bottom text-[#533e27] text-[170%] leading-[100%] font-normal italic">
              <Link
                href={cta.href}
                className="text-[#533e27] no-underline"
              >
                {cta.title}
              </Link>
            </h2>
            <div className="mx-auto my-0">
              <Link href={cta.href}>
                <Image
                  src={cta.image}
                  alt={cta.alt}
                  title={cta.titleAttr}
                  width={255}
                  height={155}
                  className="w-full h-auto max-w-[255px] mx-auto"
                />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
