'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createTestimonial, TestimonialCreateData } from '@/lib/api/testimonials'
import { getAllCabins } from '@/lib/api/cabins'
import { Property } from '@/lib/types'
import ImageUploader from '@/components/admin/ImageUploader'

// Lazy load the rich text editor to avoid SSR issues
const RichTextEditor = lazy(() => import('@/components/admin/RichTextEditor'))

// Form field component
function FormField({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

// Input component
function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  value: string | number
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow ${className}`}
      {...props}
    />
  )
}

// Textarea component
function Textarea({
  value,
  onChange,
  placeholder,
  rows = 4,
  className = '',
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  rows?: number
  className?: string
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow resize-none ${className}`}
    />
  )
}

// Select component
function Select({
  value,
  onChange,
  options,
  placeholder,
  required,
  ...props
}: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white cursor-pointer"
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function AddNewTestimonialPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [cabins, setCabins] = useState<Property[]>([])
  const [loadingCabins, setLoadingCabins] = useState(true)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    body: string
    cabin_name: string
    cabin_slug: string
    customer_image: { url: string; title?: string; width?: number; height?: number } | null
    author_name: string
    published_at: string
    status: 'published' | 'draft' | 'archived'
    is_featured: boolean
    is_sticky: boolean
    display_order: number
  }>({
    title: '',
    body: '',
    cabin_name: '',
    cabin_slug: '',
    customer_image: null,
    author_name: '',
    published_at: getTodayDate(),
    status: 'draft',
    is_featured: false,
    is_sticky: false,
    display_order: 0,
  })

  // Load cabins for dropdown
  useEffect(() => {
    async function loadCabins() {
      try {
        const allCabins = await getAllCabins()
        setCabins(allCabins)
      } catch (err) {
        console.error('Failed to load cabins:', err)
      } finally {
        setLoadingCabins(false)
      }
    }
    loadCabins()
  }, [])

  // Handle cabin selection
  const handleCabinChange = (cabinId: string) => {
    const selectedCabin = cabins.find((c) => c.id === cabinId)
    if (selectedCabin) {
      setFormData((prev) => ({
        ...prev,
        cabin_name: selectedCabin.title || '',
        cabin_slug: selectedCabin.cabin_slug || '',
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        cabin_name: '',
        cabin_slug: '',
      }))
    }
  }

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (!formData.cabin_name.trim()) {
      setError('Cabin is required')
      return
    }

    if (!formData.published_at) {
      setError('Published date is required')
      return
    }

    if (!formData.body.trim()) {
      setError('Testimonial content is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const testimonialData: TestimonialCreateData = {
        title: formData.title.trim(),
        body: formData.body.trim() || undefined,
        cabin_name: formData.cabin_name || undefined,
        cabin_slug: formData.cabin_slug || undefined,
        customer_image: formData.customer_image || undefined,
        author_name: formData.author_name.trim() || undefined,
        published_at: formData.published_at || undefined,
        status: formData.status,
        is_featured: formData.is_featured,
        is_sticky: formData.is_sticky,
        display_order: formData.display_order,
      }

      const testimonial = await createTestimonial(testimonialData)
      setSuccessMessage(`Testimonial "${testimonial.title}" created successfully!`)

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/testimonials')
      }, 1500)
    } catch (err: any) {
      let errorMessage = 'Failed to create testimonial'
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        
        // FastAPI validation errors return an array of error objects
        if (Array.isArray(detail)) {
          // Format validation errors into readable messages
          errorMessage = detail
            .map((error: any) => {
              const field = error.loc && error.loc.length > 1 ? error.loc[error.loc.length - 1] : 'field'
              return `${field}: ${error.msg}`
            })
            .join(', ')
        } else if (typeof detail === 'string') {
          errorMessage = detail
        } else if (detail.message) {
          errorMessage = detail.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get selected cabin ID for the dropdown
  const selectedCabinId = cabins.find((c) => c.title === formData.cabin_name)?.id || ''

  return (
    <div className="max-w-5xl mx-auto">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border bg-emerald-50 border-emerald-200 text-emerald-800 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
          <Link href="/admin/testimonials" className="hover:text-amber-600 transition-colors">
            Testimonials
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900">Add New</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Add New Testimonial</h1>
            <p className="text-slate-500 mt-1">Create a new guest testimonial or review</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className='flex flex-col'>
              <div className="space-y-6">
                <FormField label="Testimonial Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Amazing Mountain Getaway!"
                    required
                  />
                </FormField>

                <FormField label="Cabin" required hint="Select the cabin this testimonial is about">
                  {loadingCabins ? (
                    <div className="text-slate-500 text-sm">Loading cabins...</div>
                  ) : (
                    <Select
                      value={selectedCabinId}
                      onChange={(e) => handleCabinChange(e.target.value)}
                      placeholder="Select a cabin"
                      required
                      options={cabins.map((cabin) => ({
                        value: cabin.id,
                        label: cabin.title || 'Untitled Cabin',
                      }))}
                    />
                  )}
                </FormField>

                <FormField label="Published Date" required hint="Date when the testimonial was published or written">
                  <Input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => updateField('published_at', e.target.value)}
                    required
                  />
                </FormField>
              </div>
            </div>

            {/* Content */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Content</h2>
              <div className="space-y-6">
                <FormField 
                  label="Testimonial Content" 
                  required
                  hint="Use the rich text editor to format the testimonial content with headings, lists, links, and images."
                >
                  <Suspense fallback={
                    <div className="border border-slate-300 rounded-lg bg-slate-50 animate-pulse" style={{ minHeight: '300px' }}>
                      <div className="h-10 bg-slate-200 rounded-t-lg" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                      </div>
                    </div>
                  }>
                    <RichTextEditor
                      value={formData.body}
                      onChange={(value) => updateField('body', value)}
                      placeholder="Write the testimonial content here..."
                      minHeight={300}
                    />
                  </Suspense>
                </FormField>
              </div>
            </div>

            {/* Customer Image */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Customer Image</h2>
              <ImageUploader
                value={formData.customer_image?.url || ''}
                onChange={(url) => {
                  setFormData((prev) => ({
                    ...prev,
                    customer_image: url ? { 
                      url, 
                      title: prev.customer_image?.title || '',
                      width: prev.customer_image?.width,
                      height: prev.customer_image?.height
                    } : null
                  }))
                }}
                altValue={formData.customer_image?.title || ''}
                onAltChange={(title) => {
                  setFormData((prev) => ({
                    ...prev,
                    customer_image: prev.customer_image 
                      ? { ...prev.customer_image, title }
                      : { url: '', title }
                  }))
                }}
                titleValue={formData.customer_image?.title || ''}
                onTitleChange={(title) => {
                  setFormData((prev) => ({
                    ...prev,
                    customer_image: prev.customer_image 
                      ? { ...prev.customer_image, title }
                      : { url: '', title }
                  }))
                }}
                label="Customer Photo"
                hint="Upload a photo of the customer or enter a URL"
                showPreview={true}
                createThumbnail={false}
                imageType="testimonial"
              />
            </div>

            {/* Settings */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">Publication Status</h3>
                  <div className="flex gap-4 relative">
                    {(['draft', 'published', 'archived'] as const).map((status) => (
                      <label
                        key={status}
                        className={`flex-1 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.status === status
                          ? status === 'published'
                            ? 'border-emerald-500 bg-emerald-50'
                            : status === 'draft'
                              ? 'border-amber-500 bg-amber-50'
                              : 'border-slate-500 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="status"
                          value={status}
                          checked={formData.status === status}
                          onChange={() => {
                            setFormData((prev) => ({ ...prev, status }))
                          }}
                          className="sr-only"
                        />
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${status === 'published'
                              ? 'bg-emerald-500'
                              : status === 'draft'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                              }`}
                          />
                          <div>
                            <div className="font-medium text-slate-900 capitalize">{status}</div>
                            <div className="text-xs text-slate-500">
                              {status === 'published'
                                ? 'Visible on the website'
                                : status === 'draft'
                                  ? 'Only visible to admins'
                                  : 'Hidden from all views'}
                            </div>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => updateField('is_featured', e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                      />
                      <div>
                        <div className="font-medium text-slate-900">Featured Testimonial</div>
                        <div className="text-xs text-slate-500">Show this testimonial prominently on the website</div>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_sticky}
                        onChange={(e) => updateField('is_sticky', e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                      />
                      <div>
                        <div className="font-medium text-slate-900">Sticky</div>
                        <div className="text-xs text-slate-500">Keep this testimonial at the top of lists</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <Link
            href="/admin/testimonials"
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Testimonial
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

