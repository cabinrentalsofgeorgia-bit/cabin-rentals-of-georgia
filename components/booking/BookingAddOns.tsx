'use client'

import { useEffect, useState } from 'react'

export interface BookingAddOn {
  id: string
  name: string
  description: string
  price: number
  pricing_model: string
  scope: string
}

interface BookingAddOnsProps {
  propertyId: string
  selectedIds: string[]
  onSelectionChange: (ids: string[]) => void
}

export default function BookingAddOns({ propertyId, selectedIds, onSelectionChange }: BookingAddOnsProps) {
  const [addons, setAddons] = useState<BookingAddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAddons() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/proxy/api/v1/checkout/addons?property_id=${propertyId}`)
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: 'Failed to load add-ons' }))
          throw new Error(err.detail || `HTTP ${res.status}`)
        }
        const data = await res.json()
        if (!cancelled) {
          setAddons(data)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    if (propertyId) fetchAddons()
    return () => { cancelled = true }
  }, [propertyId])

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item != id))
    } else {
      onSelectionChange([...selectedIds, id])
    }
  }

  if (loading) {
    return <p className="text-[#533e27] italic text-sm">Loading optional add-ons...</p>
  }

  if (error) {
    return <p className="text-red-600 italic text-sm">{error}</p>
  }

  if (!addons.length) {
    return null
  }

  return (
    <div className="space-y-2">
      {addons.map((addon) => {
        const checked = selectedIds.includes(addon.id)
        return (
          <label
            key={addon.id}
            className="grid grid-cols-[22px_1fr_auto] gap-3 items-start py-2 border-b border-[#d4c4a8]/70 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(addon.id)}
              className="mt-1 h-4 w-4 rounded border-[#7c2c00] text-[#7c2c00] focus:ring-[#7c2c00]"
            />
            <div>
              <div className="text-[#533e27] text-[15px] leading-[110%]">{addon.name}</div>
              {addon.description ? (
                <div className="text-[#7c2c00] italic text-[13px] leading-[120%] mt-0.5">{addon.description}</div>
              ) : null}
            </div>
            <div className="text-[#533e27] text-[15px] italic whitespace-nowrap">(${addon.price.toFixed(2)})</div>
          </label>
        )
      })}
    </div>
  )
}
