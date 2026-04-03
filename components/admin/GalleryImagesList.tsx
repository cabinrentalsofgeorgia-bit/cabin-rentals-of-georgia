'use client'

import { useState } from 'react'
import ImageUploader from './ImageUploader'
import { deleteImage } from '@/lib/api/media'

interface GalleryImage {
  url: string
  alt?: string
  title?: string
}

interface GalleryImagesListProps {
  images: GalleryImage[]
  onChange: (images: GalleryImage[]) => void
}

export default function GalleryImagesList({
  images,
  onChange,
}: GalleryImagesListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')
  const [removingIndex, setRemovingIndex] = useState<number | null>(null)

  const addImage = (url: string) => {
    if (url.trim()) {
      onChange([...images, { url: url.trim(), alt: '', title: '' }])
    }
  }

  const removeImage = async (index: number) => {
    const imageToRemove = images[index]

    // Set loading state
    setRemovingIndex(index)

    try {
      // Delete the image from R2 if it has a URL
      if (imageToRemove.url && imageToRemove.url.trim()) {
        try {
          await deleteImage(imageToRemove.url)
        } catch (error: any) {
          console.error('Failed to delete image from R2:', error)
          // Continue with removal even if deletion fails
          // The user might want to remove it from the form anyway
        }
      }

      // Remove from list
      onChange(images.filter((_, i) => i !== index))
    } finally {
      // Clear loading state
      setRemovingIndex(null)
    }
  }

  const updateImageAlt = (index: number, alt: string) => {
    const updated = [...images]
    updated[index] = {
      ...updated[index],
      alt: alt,
    }
    onChange(updated)
  }

  const updateImageTitle = (index: number, title: string) => {
    const updated = [...images]
    updated[index] = {
      ...updated[index],
      title: title,
    }
    onChange(updated)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...images]
    const draggedItem = updated[draggedIndex]
    updated.splice(draggedIndex, 1)
    updated.splice(index, 0, draggedItem)
    onChange(updated)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Add New Image */}
      <div>
        <p className="text-sm font-medium text-slate-700 mb-2">Add Gallery Image</p>
        <div className="space-y-2">
          <ImageUploader
            value={newImageUrl}
            onChange={(url) => {
              if (url) {
                addImage(url)
                setNewImageUrl('') // Reset after adding
              }
            }}
            label=""
            hint="Upload an image to add to the gallery"
            showPreview={false}
            imageType="gallery"
          />
        </div>
      </div>

      {/* Image List */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-700">
            Gallery Images ({images.length})
          </p>
          {images.map((image, index) => (
            <div
              key={index}
              draggable={removingIndex !== index}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all group ${draggedIndex === index ? 'opacity-50' : ''
                } ${removingIndex === index ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {/* Drag Handle */}
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 cursor-move flex-shrink-0 mt-1"
                title="Drag to reorder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>

              {/* Image Preview */}
              <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt || `Gallery image ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/images/cabin-placeholder.jpg'
                  }}
                />
              </div>

              {/* Image Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={image.title || ''}
                  onChange={(e) => updateImageTitle(index, e.target.value)}
                  placeholder="Image title"
                  disabled={removingIndex === index}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    disabled={removingIndex === index}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                  >
                    {removingIndex === index ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Removing...</span>
                      </>
                    ) : (
                      'Remove'
                    )}
                  </button>
                </div>
                
                <input
                  type="text"
                  value={image.alt || ''}
                  onChange={(e) => updateImageAlt(index, e.target.value)}
                  placeholder="Alt text (for accessibility)"
                  disabled={removingIndex === index}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Click &quot;Choose File&quot; above to upload a new image.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

