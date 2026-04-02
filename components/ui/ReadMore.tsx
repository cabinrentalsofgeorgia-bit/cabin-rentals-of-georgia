'use client'

import { useState, useRef, useEffect } from 'react'

interface ReadMoreProps {
  children: React.ReactNode
  collapsedHeight?: number
  className?: string
}

export default function ReadMore({ children, collapsedHeight = 280, className = '' }: ReadMoreProps) {
  const [expanded, setExpanded] = useState(false)
  const [needsToggle, setNeedsToggle] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setNeedsToggle(contentRef.current.scrollHeight > collapsedHeight + 40)
    }
  }, [collapsedHeight, children])

  return (
    <div className={className}>
      <div
        ref={contentRef}
        className="relative overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: expanded || !needsToggle ? 'none' : `${collapsedHeight}px` }}
      >
        {children}
        {!expanded && needsToggle && (
          <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-white to-transparent pointer-events-none" />
        )}
      </div>
      {needsToggle && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[#7c2c00] hover:text-[#b7714b] text-[14px] font-medium mt-2 cursor-pointer underline"
        >
          {expanded ? 'Show Less' : '+ Read More'}
        </button>
      )}
    </div>
  )
}
