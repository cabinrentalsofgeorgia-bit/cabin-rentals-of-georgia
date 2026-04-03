'use client'

import { useState, useRef } from 'react'
import { uploadImage, deleteImage, ImageUploadResponse } from '@/lib/api/media'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  onAltChange?: (alt: string) => void
  altValue?: string
  onTitleChange?: (title: string) => void
  titleValue?: string
  label?: string
  hint?: string
  required?: boolean
  showPreview?: boolean
  createThumbnail?: boolean
  imageType?: 'featured' | 'gallery' | 'testimonial' | 'activity'
}

export default function ImageUploader({
  value,
  onChange,
  onAltChange,
  altValue = '',
  onTitleChange,
  titleValue = '',
  label = 'Image',
  hint,
  required = false,
  showPreview = true,
  createThumbnail = false,
  imageType = 'featured',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isRemoving, setIsRemoving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounter = useRef(0)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setUploadError('File size too large. Maximum size is 10MB.')
      return
    }

    setIsUploading(true)
    setUploadError(null)
    setUploadProgress(0)

    try {
      // Upload image with progress tracking
      const response = await uploadImage(file, {
        image_type: imageType,
        create_thumbnail: createThumbnail,
        onUploadProgress: (progress) => {
          setUploadProgress(progress)
        },
      })

      // Only update the URL after successful upload (this is the resized URL)
      if (response.url) {
        onChange(response.url)
      }
      setUploadProgress(100)

      // Keep progress at 100% briefly to show completion, then reset
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 300)
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.response?.data?.detail || error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    dragCounter.current = 0

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file)
    } else {
      setUploadError('Please drop an image file.')
    }
  }

  const handleRemove = async () => {
    // If there's a current image URL, delete it from R2
    if (value && value.trim()) {
      setIsRemoving(true)
      try {
        await deleteImage(value)
      } catch (error: any) {
        console.error('Failed to delete image from R2:', error)
        // Continue with removal even if deletion fails
        // The user might want to remove it from the form anyway
      } finally {
        setIsRemoving(false)
      }
    }

    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setUploadError(null)
  }
  const displayUrl = value?.trim() || ''
  const hasImage = displayUrl.length > 0

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg transition-all ${isDragging
            ? 'border-amber-500 bg-amber-50'
            : isUploading
              ? 'border-slate-300 bg-slate-50'
              : hasImage
                ? 'border-slate-200'
                : 'border-slate-300 hover:border-amber-400 hover:bg-slate-50'
          }`}
      >
        {isUploading ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 text-amber-600 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="w-full max-w-xs">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-600 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Uploading image... {uploadProgress > 0 && `${uploadProgress}%`}
                </p>
              </div>
            </div>
          </div>
        ) : hasImage ? (
          <div className={`p-4 ${isRemoving ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-start gap-4">
              {showPreview && displayUrl && (
                <div className="relative w-32 h-32 bg-slate-100 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={displayUrl}
                    src={displayUrl}
                    alt={altValue || 'Preview'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (target.src !== '/images/cabin-placeholder.jpg') {
                        target.src = '/images/cabin-placeholder.jpg'
                      }
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                  {onTitleChange && (
                    <input
                      type="text"
                      value={titleValue}
                      onChange={(e) => onTitleChange(e.target.value)}
                      placeholder="Image title"
                      disabled={isRemoving}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                    />
                  )}
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                  >
                    {isRemoving ? (
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

                {onAltChange && (
                  <input
                    type="text"
                    value={altValue}
                    onChange={(e) => onAltChange(e.target.value)}
                    placeholder="Alt text (for accessibility)"
                    disabled={isRemoving}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                )}
                <p className="text-xs text-slate-500 mt-2">
                  Click &quot;Choose File&quot; to upload a new image.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-100 rounded-full">
                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {isDragging ? 'Drop image here' : 'Drag & drop an image here, or click to browse'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  JPG, PNG, GIF or WebP (max 10MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
                id={`image-upload-${label.replace(/\s+/g, '-')}`}
              />
              <label
                htmlFor={`image-upload-${label.replace(/\s+/g, '-')}`}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors cursor-pointer text-sm font-medium"
              >
                Choose File
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-red-800">{uploadError}</p>
          <button
            onClick={() => setUploadError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {hint && !uploadError && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  )
}

