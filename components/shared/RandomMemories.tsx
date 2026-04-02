'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface MemoryReview {
  cabin: string
  cabinHref: string
  body: string
  customerImage: string
}

interface RandomMemoriesProps {
  allReviews: MemoryReview[]
  count?: number
}

function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

export default function RandomMemories({ allReviews, count = 2 }: RandomMemoriesProps) {
  const [selected, setSelected] = useState<MemoryReview[]>([])

  useEffect(() => {
    if (allReviews.length > 0) {
      setSelected(shuffleAndPick(allReviews, Math.min(count, allReviews.length)))
    }
  }, [allReviews, count])

  if (selected.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-center pb-[25px] mb-[25px] bg-[url('/images/bg_block_header.png')] bg-[50%_100%] bg-no-repeat bg-bottom text-[#533e27] text-[170%] leading-[100%] font-normal italic">
        The Memories
      </h2>
      <div>
        {selected.map((review, index) => (
          <div key={`${review.cabin}-${index}`} className="mb-[25px]">
            <div className="float-left my-0.5 mx-[15px] mb-2.5 ml-1.5 p-0.5 shadow-[0px_0px_8px_1px_#888]">
              <Image
                src={review.customerImage}
                alt=""
                width={48}
                height={48}
              />
            </div>
            <div className="flex flex-col">
              <div className="mb-1.5 leading-[120%] font-bold">
                <Link
                  href={review.cabinHref}
                  className="text-[#7c2c00] underline hover:text-[#b7714b] font-bold"
                >
                  {review.cabin}
                </Link>
              </div>
              <div className="italic text-[#533e27]">
                {review.body.length > 220 ? `${review.body.slice(0, 220)}...` : review.body}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
