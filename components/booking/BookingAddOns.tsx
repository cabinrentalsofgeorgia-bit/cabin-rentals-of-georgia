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

function formatAddonTitle(name: string): string {
  return name
    .replace(/\s*\(\$[\d,.]+\)\s*$/, '')
    .replace(/\s*Fee\s*$/i, '')
    .trim()
}

function formatPricingLabel(addon: BookingAddOn): string {
  if (addon.pricing_model === 'per_night') return '/night'
  if (addon.pricing_model === 'per_guest') return '/guest'
  if (addon.pricing_model === 'per_guest_per_night') return '/guest/night'
  if (addon.pricing_model === 'per_pet') return '/pet'
  if (addon.pricing_model === 'per_pet_per_night') return '/pet/night'
  return ''
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
    return <p className="text-[#533e27] italic text-sm">No add-ons available for this property.</p>
  }

  return (
    <div className="space-y-1">
      {addons.map((addon) => {
        const checked = selectedIds.includes(addon.id)
        const title = formatAddonTitle(addon.name)
        const pricingLabel = formatPricingLabel(addon)

        return (
          <label
            key={addon.id}
            className={`grid grid-cols-[24px_1fr_auto] gap-3 items-start py-3 px-2 border-b border-[#d4c4a8]/50 cursor-pointer rounded-md transition-colors ${
              checked ? 'bg-[#f0e8d8]' : 'hover:bg-[#faf6ee]/60'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(addon.id)}
              className="mt-0.5 h-[18px] w-[18px] rounded border-[#7c2c00] text-[#7c2c00] focus:ring-[#7c2c00] cursor-pointer"
            />
            <div>
              <div className="text-[#533e27] text-[15px] leading-[120%] font-medium">{title}</div>
              {addon.description ? (
                <div className="text-[#7c2c00]/70 italic text-[13px] leading-[130%] mt-0.5">
                  {addon.description}
                </div>
              ) : null}
            </div>
            <div className="text-[#7c2c00] text-[15px] font-semibold whitespace-nowrap text-right">
              ${addon.price.toFixed(2)}
              {pricingLabel ? (
                <span className="text-[11px] font-normal text-[#533e27]/60 ml-0.5">{pricingLabel}</span>
              ) : null}
            </div>
          </label>
        )
      })}
    </div>
  )
}
