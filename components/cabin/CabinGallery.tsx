'use client'

import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import GalleryModal from './GalleryModal'

interface GalleryImage {
  url: string
  alt?: string
  title?: string
}

interface CabinGalleryProps {
  images: GalleryImage[]
  cabinTitle: string
  cabinInfo?: string
}

export default function CabinGallery({ images, cabinTitle, cabinInfo }: CabinGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let el = document.getElementById('gallery-modal-root')
    if (!el) {
      el = document.createElement('div')
      el.id = 'gallery-modal-root'
      document.body.appendChild(el)
    }
    setPortalEl(el)
  }, [])

  const openModal = useCallback((index: number) => {
    setSelectedIndex(index)
    setIsModalOpen(true)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && typeof detail.index === 'number') {
        openModal(detail.index)
      }
    }
    window.addEventListener('cabin-gallery-open', handler)
    return () => window.removeEventListener('cabin-gallery-open', handler)
  }, [openModal])

  return (
    <>
      <div className="mb-8">
        <h3 className="text-[130%] mb-4 bg-[url('/images/cabin_separator.png')] bg-[center_top] bg-no-repeat mt-0 p-[35px_0px_5px] text-[#533e27]">Photos (click for larger image)</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {images.map((image: GalleryImage, index: number) => (
            <div key={index} className="flex flex-col w-auto">
              <button
                onClick={() => openModal(index)}
                className="relative w-[275px] h-[180px] max-[1010px]:w-[200px] max-[1010px]:h-[130px] max-[767px]:w-full max-[767px]:max-w-[420px] max-[767px]:h-auto overflow-hidden text-left cursor-pointer transition-opacity hover:opacity-90"
                style={{ boxShadow: '0 0 10px #333' }}
              >
                <Image
                  src={image.url || ''}
                  alt={image.alt || cabinTitle}
                  fill
                  className="object-cover max-[767px]:!static max-[767px]:!w-full max-[767px]:!h-auto p-[3px]"
                  sizes="(max-width: 767px) 420px, (max-width: 1010px) 200px, 275px"
                />
              </button>
              <h4
                onClick={() => openModal(index)}
                className="mt-[7px] text-[#7c2c00] hover:text-[#b7714b] cursor-pointer text-[16px] w-[275px] max-[1010px]:w-[200px] max-[767px]:w-full max-[767px]:max-w-[420px] leading-[100%]"
              >
                {image.title}
              </h4>
            </div>
          ))}
        </div>
      </div>

      {portalEl && createPortal(
        <GalleryModal
          images={images}
          initialIndex={selectedIndex}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          cabinTitle={cabinTitle}
          cabinInfo={cabinInfo}
        />,
        portalEl,
      )}
    </>
  )
}

