import {
  Wifi,
  Flame,
  Waves,
  Gamepad2,
  Fish,
  TreePine,
  Droplets,
  Bike,
  CircleDot,
  type LucideIcon,
} from 'lucide-react'

interface AmenityStripProps {
  amenities: Array<{ name: string }>
}

const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  'Wi-Fi':              Wifi,
  'Hot Tub':            Waves,
  'Outdoor Fireplace':  Flame,
  'Indoor Fireplace':   Flame,
  'Fireplace':          Flame,
  'Pool Table':         CircleDot,
  'Games':              Gamepad2,
  'Game Room':          Gamepad2,
  'Foosball Table':     Gamepad2,
  'Shuffleboard':       Gamepad2,
  'River Access':       Droplets,
  'Lake Access':        Droplets,
  'Fly Fishing':        Fish,
  'Fishing':            Fish,
  'Hiking Trails':      TreePine,
  'Waterfall Hike':     TreePine,
  'Cycling':            Bike,
  'Pet-Friendly':       Waves,
  'Non-Smoking':        CircleDot,
  'Gas Grill':          Flame,
  'BBQ Grill':          Flame,
  'Coffee Maker':       CircleDot,
}

export default function AmenityStrip({ amenities }: AmenityStripProps) {
  if (!amenities || amenities.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mt-[5px] items-center max-[767px]:justify-center">
      {amenities.map((amenity) => {
        const Icon = AMENITY_ICON_MAP[amenity.name] || CircleDot
        return (
          <span
            key={amenity.name}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium bg-[#f5efe8] text-[#7c2c00] border border-[#e0d5c5]"
            title={amenity.name}
          >
            <Icon size={14} strokeWidth={2} />
            {amenity.name}
          </span>
        )
      })}
    </div>
  )
}
