'use client'

import Image from 'next/image'

interface HeroImageProps {
  src: string
  alt: string
  title?: string
  photoCount?: number
}

export default function HeroImage({ src, alt, title, photoCount }: HeroImageProps) {
  const handleClick = () => {
    window.dispatchEvent(
      new CustomEvent('cabin-gallery-open', { detail: { index: 0 } }),
    )
  }

  return (
    <button
      onClick={handleClick}
      className="mb-1 relative text-white leading-[23px] w-full text-left cursor-pointer group"
      type="button"
    >
      <Image
        src={src}
        alt={alt}
        title={title}
        width={800}
        height={600}
        className="w-full h-auto p-[3px] transition-opacity group-hover:opacity-90"
        priority
        style={{ boxShadow: '0 0 10px #333' }}
      />
      {photoCount != null && photoCount > 0 && (
        <span className="absolute bottom-[10px] right-[20px] text-[140%] drop-shadow-lg">
          +<i>{photoCount}</i><br />Photos
        </span>
      )}
    </button>
  )
}
