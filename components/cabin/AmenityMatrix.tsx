'use client'

import { useState } from 'react'
import {
  Sofa,
  UtensilsCrossed,
  TreePine,
  Gamepad2,
  Compass,
  ShieldCheck,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  type LucideIcon,
} from 'lucide-react'

interface AmenityMatrixProps {
  matrix: Record<string, string[]>
}

const DEFAULT_META = { icon: CheckCircle, accent: '#7c2c00' } as const

const CATEGORY_META: Record<string, { icon: LucideIcon; accent: string }> = {
  'Comfort & Convenience': { icon: Sofa,            accent: '#7c2c00' },
  'Kitchen & Dining':      { icon: UtensilsCrossed, accent: '#7c2c00' },
  'Outdoor & Nature':      { icon: TreePine,        accent: '#2D5F2D' },
  'Outdoor & Views':       { icon: TreePine,        accent: '#2D5F2D' },
  'Entertainment':         { icon: Gamepad2,        accent: '#5C3D6E' },
  'Activities & Nearby':   { icon: Compass,         accent: '#2E5A88' },
  'Safety & Access':       { icon: ShieldCheck,     accent: '#7c2c00' },
  'Safety':                { icon: ShieldCheck,     accent: '#7c2c00' },
}

const COLLAPSE_THRESHOLD = 8

function CategoryCard({ category, items }: { category: string; items: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[category] || DEFAULT_META
  const Icon = meta.icon
  const shouldCollapse = items.length > COLLAPSE_THRESHOLD
  const visible = shouldCollapse && !expanded ? items.slice(0, COLLAPSE_THRESHOLD) : items
  const hiddenCount = items.length - COLLAPSE_THRESHOLD

  return (
    <div className="border border-[#d4c4a8] rounded-lg bg-[#faf8f5] overflow-hidden shadow-sm">
      {/* Category Header */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 border-b border-[#d4c4a8]"
        style={{ backgroundColor: `${meta.accent}0D` }}
      >
        <Icon size={20} color={meta.accent} strokeWidth={1.8} />
        <h4
          className="text-[15px] font-semibold tracking-wide flex-1"
          style={{ color: meta.accent }}
        >
          {category}
        </h4>
        <span
          className="text-[11px] font-medium tabular-nums px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${meta.accent}15`, color: meta.accent }}
        >
          {items.length}
        </span>
      </div>

      {/* Amenity List */}
      <ul className="px-4 py-3 space-y-1.5">
        {visible.map((item) => (
          <li
            key={item}
            className="text-[13px] text-[#533e27] leading-snug pl-5 relative before:content-['✓'] before:absolute before:left-0 before:text-[#7c2c00] before:text-[11px] before:font-bold before:top-px"
          >
            {item}
          </li>
        ))}
      </ul>

      {/* Expand / Collapse */}
      {shouldCollapse && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2.5 text-[12px] font-medium border-t border-[#d4c4a8] transition-colors hover:bg-[#f3ede4] cursor-pointer"
          style={{ color: meta.accent }}
        >
          {expanded ? (
            <>Show less <ChevronUp size={14} /></>
          ) : (
            <>+{hiddenCount} more <ChevronDown size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}

export default function AmenityMatrix({ matrix }: AmenityMatrixProps) {
  const categories = Object.entries(matrix)
  if (categories.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {categories.map(([category, items]) => (
        <CategoryCard key={category} category={category} items={items} />
      ))}
    </div>
  )
}
