'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GalleryImage {
    url: string
    alt?: string
    title?: string
}

interface GalleryModalProps {
    images: GalleryImage[]
    initialIndex: number
    isOpen: boolean
    onClose: () => void
    cabinTitle: string
    cabinInfo?: string
}

const THUMBNAILS_PER_PAGE = 10

export default function GalleryModal({
    images,
    initialIndex,
    isOpen,
    onClose,
    cabinTitle,
    cabinInfo
}: GalleryModalProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [currentPage, setCurrentPage] = useState(1)
    const [isFading, setIsFading] = useState(false)

    const totalPages = Math.ceil(images.length / THUMBNAILS_PER_PAGE)

    // Update current index when initialIndex changes
    useEffect(() => {
        setCurrentIndex(initialIndex)
        // Calculate which page this image is on
        const page = Math.floor(initialIndex / THUMBNAILS_PER_PAGE) + 1
        setCurrentPage(page)
    }, [initialIndex])

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return

        switch (e.key) {
            case 'Escape':
                onClose()
                break
            case 'ArrowLeft':
                setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
                break
            case 'ArrowRight':
                setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
                break
        }
    }, [isOpen, images.length, onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [handleKeyDown])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Update page when navigating through images (with fade effect if page changes)
    useEffect(() => {
        const newPage = Math.floor(currentIndex / THUMBNAILS_PER_PAGE) + 1
        if (newPage !== currentPage && !isFading) {
            setIsFading(true)
            setTimeout(() => {
                setCurrentPage(newPage)
            }, 300)
            setTimeout(() => {
                setIsFading(false)
            }, 350)
        }
    }, [currentIndex, currentPage, isFading])

    if (!isOpen) return null

    const currentImage = images[currentIndex]
    const startIndex = (currentPage - 1) * THUMBNAILS_PER_PAGE
    const visibleThumbnails = images.slice(startIndex, startIndex + THUMBNAILS_PER_PAGE)

    const goToPrevious = () => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))
    }

    const goToNext = () => {
        setCurrentIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))
    }

    const goToPage = (page: number) => {
        if (page === currentPage || isFading) return
        setIsFading(true)
        setTimeout(() => {
            setCurrentPage(page)
            // Set selected image to the first image of the new page
            const firstImageIndex = (page - 1) * THUMBNAILS_PER_PAGE
            setCurrentIndex(firstImageIndex)
        }, 300)
        setTimeout(() => {
            setIsFading(false)
        }, 350)
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                isolation: 'isolate',
            }}
        >
            {/* Backdrop */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.75)',
                }}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                style={{
                    position: 'relative',
                    width: '95vw',
                    maxWidth: '960px',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    backgroundImage: "url('/images/bg_overlay.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 md:top-3 md:right-3 z-10 cursor-pointer bg-black/40 hover:bg-black/60 rounded-full w-9 h-9 flex items-center justify-center text-white text-xl leading-none transition-colors"
                    aria-label="Close gallery"
                >
                    &times;
                </button>

                <div className="flex flex-col md:flex-row p-4 md:p-6 gap-4 md:gap-6">
                    {/* Left Side - Main Image */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <Image
                            src={currentImage?.url || ''}
                            alt={currentImage?.alt || cabinTitle}
                            width={950}
                            height={633}
                            className="w-full h-auto p-[3px] rounded"
                            style={{ boxShadow: '0 0 10px #333' }}
                            priority
                        />

                        {/* Caption and Navigation */}
                        <div className="flex items-center justify-between mt-2">
                            <span className="text-[#533e27] italic text-sm md:text-lg flex-1 pr-4">
                                {currentImage?.title || currentImage?.alt || ''}
                            </span>

                            <div className="flex items-center gap-2 text-[#7c2c00] text-sm md:text-base shrink-0">
                                <button onClick={goToPrevious} className="hover:underline">
                                    previous
                                </button>
                                <span className="text-[#533e27]">|</span>
                                <button onClick={goToNext} className="hover:underline">
                                    next
                                </button>
                            </div>
                        </div>

                        {/* Cabin Info */}
                        <div className="mt-2 hidden md:flex items-center gap-4">
                            <Image
                                src="/images/logo.png"
                                alt="Cabin Rentals of Georgia"
                                width={120}
                                height={64}
                                className="object-contain"
                            />
                            <div className="flex flex-col">
                                <h3 className="text-[#533e27] text-xl font-normal m-0" style={{ fontFamily: 'Georgia, serif' }}>
                                    {cabinTitle}
                                </h3>
                                {cabinInfo && (
                                    <span className="text-[#533e27] text-base">
                                        {cabinInfo}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Thumbnails Grid */}
                    <div className="w-full md:w-[200px] flex flex-col shrink-0">
                        <div className={`flex flex-wrap justify-center md:justify-around gap-2 transition-opacity duration-300 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                            {visibleThumbnails.map((image, idx) => {
                                const actualIndex = startIndex + idx
                                return (
                                    <button
                                        key={actualIndex}
                                        onClick={() => setCurrentIndex(actualIndex)}
                                        className={`relative w-[60px] h-[45px] md:w-[45%] md:aspect-[4/3] md:h-auto overflow-hidden transition-all ${actualIndex === currentIndex
                                            ? 'border-[3px] border-black'
                                            : 'border-[3px] border-transparent hover:opacity-80'
                                            }`}
                                        style={{ boxShadow: '0 0 5px #333' }}
                                    >
                                        <Image
                                            src={image.url || ''}
                                            alt={image.alt || `Thumbnail ${actualIndex + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 60px, 100px"
                                        />
                                    </button>
                                )
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-3 text-[#7c2c00]">
                                {currentPage > 1 && (
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        className="hover:text-[#5a2000]"
                                    >
                                        &lt;
                                    </button>
                                )}
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => goToPage(page)}
                                        className={`w-6 h-6 flex items-center justify-center rounded text-sm ${page === currentPage
                                            ? 'bg-[#7c2c00] text-white'
                                            : 'hover:bg-[#7c2c00]/20'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                {currentPage < totalPages && (
                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        className="hover:text-[#5a2000]"
                                    >
                                        &gt;
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

