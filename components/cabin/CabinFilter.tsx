'use client'

import { useState, useEffect, useRef } from 'react'
import { Property } from '@/lib/types'
import CabinCard from './CabinCard'

interface CabinFilterProps {
  cabins: Property[]
}

export default function CabinFilter({ cabins }: CabinFilterProps) {
  const [selectedCabin, setSelectedCabin] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredCabins = selectedCabin
    ? cabins.filter((property) => property.title === selectedCabin)
    : cabins

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleSelect = (value: string) => {
    setSelectedCabin(value)
    setIsOpen(false)
  }

  const displayValue = selectedCabin || '- Any -'

  return (
    <>
      <div className="flex items-center justify-between bg-[url('/images/bg_featured_cabins.png')] bg-no-repeat max-[1010px]:bg-[center_center] p-[35px] h-[82px] mt-[25px]  max-[767px]:w-[88%] max-[767px]:mx-auto max-[460px]:w-[100%]">
        <h2 className="text-center bg-center bg-no-repeat text-white text-[170%] italic">
          Featured Cabins
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="cabin-filter" className="text-white mr-1.5 h-6 leading-6 text-[0.9em] italic hidden min-[1010px]:block">
            See Only
          </label>
          <div className="relative w-[170px] max-[767px]:hidden" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="relative appearance-none bg-[url('/images/bg_advanced_select2.png')] bg-contain bg-transparent bg-[length:100%_100%] bg-no-repeat bg-center border-none rounded px-3 py-1.5 pr-8 w-full text-[#533e27] text-base cursor-pointer outline-none focus:outline-none text-left whitespace-nowrap overflow-hidden text-ellipsis"
            >
              <span className="block truncate">{displayValue}</span>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 9L1 4H11L6 9Z" fill="#22c55e" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 -mt-[3px] border z-50 max-h-60  bg-[#fbd98e] overflow-y-scroll">
                <button
                  type="button"
                  onClick={() => handleSelect('')}
                  className="w-full text-left px-3 py-2 text-[#533e27] hover:bg-[#f0d089] transition-colors whitespace-nowrap"
                >
                  - Any -
                </button>
                {cabins.map((property) => (
                  <button
                    key={property.id}
                    type="button"
                    onClick={() => handleSelect(property.title ?? '')}
                    className="w-full text-left px-3 py-2 text-[#533e27] hover:bg-[#f0d089] transition-colors first:rounded-t last:rounded-b whitespace-nowrap"
                  >
                    {property.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 pt-5 bg-[url('https://media.cabin-rentals-of-georgia.com/sites/all/themes/crog/images/cabin_separator.png')] bg-center bg-no-repeat bg-top">
        <div className="flex flex-col gap-8 mt-5">
          {filteredCabins.length > 0 && filteredCabins.map((property: Property) => (
            <CabinCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </>
  )
}

