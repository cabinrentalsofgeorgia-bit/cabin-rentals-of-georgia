"use client"

import { useMemo, useState } from "react"

interface StreamlineBookingFrameProps {
  propertyId: number | string
  streamlineBaseUrl?: string
}

export default function StreamlineBookingFrame({
  propertyId,
  streamlineBaseUrl = "https://secure.streamlinevrs.com/components/booking",
}: StreamlineBookingFrameProps) {
  const [isLoading, setIsLoading] = useState(true)

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      property_id: String(propertyId),
      style: "modern",
    })

    return `${streamlineBaseUrl}?${params.toString()}`
  }, [propertyId, streamlineBaseUrl])

  return (
    <div className="space-y-3">
      <div className="rounded-[12px] border border-[#d4c4a8] bg-[#f7f1e7] p-4 text-[#533e27]">
        <h2 className="text-[150%] text-[#7c2c00] italic">Secure Online Booking</h2>
        <p className="mt-2 text-sm leading-relaxed">
          Complete your reservation through our secure Streamline booking bridge. If the embedded
          checkout does not load correctly, open it in a new tab.
        </p>
        <a
          href={iframeSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex text-sm italic text-[#7c2c00] underline hover:text-[#b7714b]"
        >
          Open secure booking in a new tab
        </a>
      </div>

      <div className="relative overflow-hidden rounded-[12px] border border-[#d4c4a8] bg-white shadow-[0_0_10px_#33333326]">
        {isLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#f7f1e7]/95">
            <div className="flex items-center gap-3 text-[#533e27]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#d4c4a8] border-t-[#7c2c00]" />
              <span className="text-sm italic">Loading secure checkout...</span>
            </div>
          </div>
        ) : null}

        <iframe
          src={iframeSrc}
          title="Cabin Rentals of Georgia secure booking"
          className="h-[1350px] w-full border-0"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  )
}
