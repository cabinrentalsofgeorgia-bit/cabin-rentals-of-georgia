'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import GalleryModal from './GalleryModal'

interface GalleryImage {
  url: string
  alt?: string
  title?: string
}

interface GalleryContextValue {
  openGallery: (index: number) => void
}

const GalleryContext = createContext<GalleryContextValue>({
  openGallery: () => {},
})

export function useGallery() {
  return useContext(GalleryContext)
}

interface GalleryProviderProps {
  images: GalleryImage[]
  cabinTitle: string
  cabinInfo?: string
  children: ReactNode
}

export function GalleryProvider({ images, cabinTitle, cabinInfo, children }: GalleryProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setPortalTarget(document.body)
  }, [])

  const openGallery = (index: number) => {
    setSelectedIndex(index)
    setIsOpen(true)
  }

  return (
    <GalleryContext.Provider value={{ openGallery }}>
      {children}
      {portalTarget && createPortal(
        <GalleryModal
          images={images}
          initialIndex={selectedIndex}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          cabinTitle={cabinTitle}
          cabinInfo={cabinInfo}
        />,
        portalTarget,
      )}
    </GalleryContext.Provider>
  )
}
