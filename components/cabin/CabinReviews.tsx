'use client'

import { useState, useEffect } from 'react'

interface Review {
  title: string
  body: string
}

interface CabinReviewsProps {
  reviews: Review[]
  cabinTitle: string
}

function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, n)
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const needsToggle = review.body.length > 250

  return (
    <div className="bg-[#faf6ef] border border-[#e8dcc8] rounded-[6px] p-[20px]">
      <h4 className="text-[#7c2c00] text-[18px] font-semibold mb-[10px] italic">
        {review.title}
      </h4>
      <p className="text-[#533e27] text-[14px] leading-[160%]">
        {expanded || !needsToggle
          ? review.body
          : `${review.body.slice(0, 250)}...`}
      </p>
      {needsToggle && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#7c2c00] hover:text-[#b7714b] text-[13px] mt-[8px] cursor-pointer underline"
        >
          {expanded ? 'Show Less' : 'Read More'}
        </button>
      )}
    </div>
  )
}

export default function CabinReviews({ reviews, cabinTitle }: CabinReviewsProps) {
  const [selected, setSelected] = useState<Review[]>([])

  useEffect(() => {
    if (reviews && reviews.length > 0) {
      setSelected(shuffleAndPick(reviews, Math.min(2, reviews.length)))
    }
  }, [reviews])

  if (selected.length === 0) return null

  return (
    <div className="mb-8">
      <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">
        The Memories from<br />
        <span className="text-[#7c2c00] italic">{cabinTitle}</span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-[10px]">
        {selected.map((review, index) => (
          <ReviewCard key={index} review={review} />
        ))}
      </div>
    </div>
  )
}
