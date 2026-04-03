'use client'

import { useEffect, useState } from 'react'

interface DemandSignals {
  viewers_last_hour: number
  high_demand: boolean
  last_available_weekend: boolean
  category_available: number
}

interface DemandBadgeProps {
  propertySlug: string
  className?: string
}

export default function DemandBadge({ propertySlug, className = '' }: DemandBadgeProps) {
  const [signals, setSignals] = useState<DemandSignals | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch(`/api/proxy/api/storefront/demand/signals/${propertySlug}`)
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setSignals(data)
      } catch {
        // fail silently — badge is enhancement, not critical path
      }
    }
    load()
    const interval = setInterval(load, 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [propertySlug])

  if (!signals) return null

  const showViewers = signals.high_demand && signals.viewers_last_hour >= 3
  const showLastAvailable = signals.last_available_weekend

  if (!showViewers && !showLastAvailable) return null

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {showViewers && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7c2c00]/10 text-[#7c2c00] text-[13px] font-medium border border-[#7c2c00]/20 animate-pulse">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          {signals.viewers_last_hour} {signals.viewers_last_hour === 1 ? 'guest is' : 'guests are'} viewing this cabin
        </span>
      )}
      {showLastAvailable && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-[13px] font-medium border border-amber-200">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Last available this weekend
        </span>
      )}
    </div>
  )
}
