'use client'

import { useState, useEffect } from 'react'

interface LikeSaveButtonProps {
  cabinId: string
  cabinTitle: string
  className?: string
}

const SAVE_KEY = 'crog_saved_cabins'
const LIKE_KEY = 'crog_liked_cabins'

function getStored(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

function setStored(key: string, ids: string[]) {
  localStorage.setItem(key, JSON.stringify(ids))
}

export default function LikeSaveButton({ cabinId, cabinTitle, className = '' }: LikeSaveButtonProps) {
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const [likeAnim, setLikeAnim] = useState(false)
  const [saveAnim, setSaveAnim] = useState(false)

  useEffect(() => {
    setLiked(getStored(LIKE_KEY).includes(cabinId))
    setSaved(getStored(SAVE_KEY).includes(cabinId))
  }, [cabinId])

  const toggleLike = () => {
    const current = getStored(LIKE_KEY)
    if (current.includes(cabinId)) {
      setStored(LIKE_KEY, current.filter(id => id !== cabinId))
      setLiked(false)
    } else {
      setStored(LIKE_KEY, [...current, cabinId])
      setLiked(true)
      setLikeAnim(true)
      setTimeout(() => setLikeAnim(false), 600)
    }
  }

  const toggleSave = () => {
    const current = getStored(SAVE_KEY)
    if (current.includes(cabinId)) {
      setStored(SAVE_KEY, current.filter(id => id !== cabinId))
      setSaved(false)
    } else {
      setStored(SAVE_KEY, [...current, cabinId])
      setSaved(true)
      setSaveAnim(true)
      setTimeout(() => setSaveAnim(false), 600)
    }
  }

  return (
    <div className={`flex items-center gap-[8px] ${className}`}>
      {/* Like Button */}
      <button
        onClick={toggleLike}
        className="group flex items-center gap-[5px] px-[10px] py-[6px] border border-[#c9b99a] rounded-[4px] bg-white hover:bg-[#faf6ef] transition-all duration-200"
        title={liked ? `Unlike ${cabinTitle}` : `Like ${cabinTitle}`}
        aria-label={liked ? `Unlike ${cabinTitle}` : `Like ${cabinTitle}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-[18px] h-[18px] transition-transform duration-300 ${likeAnim ? 'scale-125' : 'scale-100'}`}
          fill={liked ? '#c0392b' : 'none'}
          stroke={liked ? '#c0392b' : '#7c2c00'}
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          />
        </svg>
        <span className="text-[13px] text-[#7c2c00] group-hover:text-[#b7714b] leading-none">
          {liked ? 'Liked' : 'Like'}
        </span>
      </button>

      {/* Save Button */}
      <button
        onClick={toggleSave}
        className="group flex items-center gap-[5px] px-[10px] py-[6px] border border-[#c9b99a] rounded-[4px] bg-white hover:bg-[#faf6ef] transition-all duration-200"
        title={saved ? `Remove ${cabinTitle} from saved` : `Save ${cabinTitle}`}
        aria-label={saved ? `Remove ${cabinTitle} from saved` : `Save ${cabinTitle}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className={`w-[18px] h-[18px] transition-transform duration-300 ${saveAnim ? 'scale-110' : 'scale-100'}`}
          fill={saved ? '#7c2c00' : 'none'}
          stroke="#7c2c00"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
          />
        </svg>
        <span className="text-[13px] text-[#7c2c00] group-hover:text-[#b7714b] leading-none">
          {saved ? 'Saved' : 'Save'}
        </span>
      </button>
    </div>
  )
}
