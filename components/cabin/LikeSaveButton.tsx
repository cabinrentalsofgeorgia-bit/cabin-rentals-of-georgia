'use client'

import { useState, useEffect } from 'react'

interface LikeSaveButtonProps {
  cabinId: string
  cabinTitle: string
  className?: string
}

const STORAGE_KEY = 'crog_saved_cabins'

function getSavedCabins(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function setSavedCabins(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export default function LikeSaveButton({ cabinId, cabinTitle, className = '' }: LikeSaveButtonProps) {
  const [saved, setSaved] = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    setSaved(getSavedCabins().includes(cabinId))
  }, [cabinId])

  const toggle = () => {
    const current = getSavedCabins()
    let next: string[]
    if (current.includes(cabinId)) {
      next = current.filter(id => id !== cabinId)
      setSaved(false)
    } else {
      next = [...current, cabinId]
      setSaved(true)
      setAnimating(true)
      setTimeout(() => setAnimating(false), 600)
    }
    setSavedCabins(next)
  }

  return (
    <button
      onClick={toggle}
      className={`group flex items-center gap-[6px] px-[12px] py-[6px] border border-[#c9b99a] rounded-[4px] bg-white hover:bg-[#faf6ef] transition-all duration-200 ${className}`}
      title={saved ? `Remove ${cabinTitle} from favorites` : `Save ${cabinTitle} to favorites`}
      aria-label={saved ? `Remove ${cabinTitle} from favorites` : `Save ${cabinTitle} to favorites`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={`w-[20px] h-[20px] transition-transform duration-300 ${animating ? 'scale-125' : 'scale-100'}`}
        fill={saved ? '#c0392b' : 'none'}
        stroke={saved ? '#c0392b' : '#7c2c00'}
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
      <span className="text-[13px] text-[#7c2c00] group-hover:text-[#b7714b] leading-none">
        {saved ? 'Saved' : 'Save'}
      </span>
    </button>
  )
}
