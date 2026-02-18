'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { updateActivity, getAdminActivityById, ActivityUpdateData, Activity } from '@/lib/api/activities'
import {
  getActivityTypeOptions,
  getAreaOptions,
  getPeopleOptions,
  getDifficultyLevelOptions,
  getSeasonOptions,
  TaxonomyTerm
} from '@/lib/api/taxonomy'
import ImageUploader from '@/components/admin/ImageUploader'

// Lazy load the rich text editor to avoid SSR issues
const RichTextEditor = lazy(() => import('@/components/admin/RichTextEditor'))

// Tab definitions
const TABS = [
  { id: 'basic', label: 'Basic Info', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'details', label: 'Activity Details', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { id: 'location', label: 'Location', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'media', label: 'Media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
] as const

type TabId = typeof TABS[number]['id']

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

// Dynamic list input for video URLs with editing and reordering
function VideoUrlsList({
  videoUrls,
  onChange,
}: {
  videoUrls: string[]
  onChange: (videoUrls: string[]) => void
}) {
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const addVideoUrl = () => {
    if (newVideoUrl.trim()) {
      onChange([...videoUrls, newVideoUrl.trim()])
      setNewVideoUrl('')
    }
  }

  const removeVideoUrl = (index: number) => {
    onChange(videoUrls.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
    }
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditValue(videoUrls[index])
  }

  const saveEdit = (index: number) => {
    if (editValue.trim()) {
      const updated = [...videoUrls]
      updated[index] = editValue.trim()
      onChange(updated)
    }
    setEditingIndex(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditValue('')
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const updated = [...videoUrls]
    const draggedItem = updated[draggedIndex]
    updated.splice(draggedIndex, 1)
    updated.splice(index, 0, draggedItem)
    onChange(updated)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newVideoUrl}
          onChange={(e) => setNewVideoUrl(e.target.value)}
          placeholder="Add a video URL (e.g., https://www.youtube.com/watch?v=...)"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addVideoUrl()
            }
          }}
        />
        <button
          type="button"
          onClick={addVideoUrl}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium whitespace-nowrap"
        >
          Add
        </button>
      </div>
      {videoUrls.length > 0 && (
        <div className="space-y-2">
          {videoUrls.map((videoUrl, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-all group ${draggedIndex === index ? 'opacity-50' : ''
                }`}
            >
              {/* Drag Handle */}
              <button
                type="button"
                className="text-slate-400 hover:text-slate-600 cursor-move flex-shrink-0"
                title="Drag to reorder"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>

              {/* Video URL Content - Editable or Display */}
              {editingIndex === index ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        saveEdit(index)
                      } else if (e.key === 'Escape') {
                        cancelEdit()
                      }
                    }}
                    onBlur={() => saveEdit(index)}
                    className="flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => saveEdit(index)}
                    className="text-emerald-600 hover:text-emerald-700 p-1"
                    title="Save"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Cancel"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-2">
                    <div
                      onClick={() => startEditing(index)}
                      className={`flex-1 px-3 py-1.5 text-slate-700 rounded cursor-text hover:bg-slate-50 transition-colors truncate ${!isValidUrl(videoUrl) ? 'text-red-600' : ''
                        }`}
                      title={videoUrl}
                    >
                      {videoUrl}
                    </div>
                    {isValidUrl(videoUrl) && (
                      <a
                        href={videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Open in new tab"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => startEditing(index)}
                    className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeVideoUrl(index)}
                    className="text-slate-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Format date for input field (YYYY-MM-DD)
function formatDateForInput(dateString: string | null | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

export default function EditActivityPage() {
  const router = useRouter()
  const params = useParams()
  const activityId = params.id as string

  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Taxonomy options
  const [activityTypeOptions, setActivityTypeOptions] = useState<TaxonomyTerm[]>([])
  const [areaOptions, setAreaOptions] = useState<TaxonomyTerm[]>([])
  const [peopleOptions, setPeopleOptions] = useState<TaxonomyTerm[]>([])
  const [difficultyLevelOptions, setDifficultyLevelOptions] = useState<TaxonomyTerm[]>([])
  const [seasonOptions, setSeasonOptions] = useState<TaxonomyTerm[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  // Form state
  const [formData, setFormData] = useState({
    // Basic
    title: '',
    slug: '',
    activity_slug: '',
    body: '',
    body_summary: '',
    // Details
    activity_type: '',
    activity_type_tid: undefined as number | undefined,
    area: '',
    area_tid: undefined as number | undefined,
    people: '',
    people_tid: undefined as number | undefined,
    difficulty_level: '',
    difficulty_level_tid: undefined as number | undefined,
    season: '',
    season_tid: undefined as number | undefined,
    // Location
    address: '',
    latitude: '',
    longitude: '',
    // Media
    featured_image_url: '',
    featured_image_alt: '',
    featured_image_title: '',
    video_urls: [] as string[],
    // Settings
    published_at: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
    is_featured: false
  })

  // Auto-generate slug from title
  const [autoSlug, setAutoSlug] = useState(false) // Disabled by default for edit

  // Generate activity_slug in format: category/area/title-slug (area is optional)
  const generateActivitySlug = (category: string, area: string, titleSlug: string): string => {
    const parts: string[] = []
    if (category) {
      parts.push(generateSlug(category))
    }
    if (area) {
      parts.push(generateSlug(area))
    }
    if (titleSlug) {
      parts.push(titleSlug)
    }
    return parts.join('/')
  }

  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, autoSlug])

  // Auto-generate activity_slug when category, area, or slug changes (area is optional)
  useEffect(() => {
    if (formData.activity_type && formData.slug) {
      const activitySlug = generateActivitySlug(
        formData.activity_type,
        formData.area || '',
        formData.slug
      )
      setFormData((prev) => ({ ...prev, activity_slug: activitySlug }))
    } else {
      setFormData((prev) => ({ ...prev, activity_slug: '' }))
    }
  }, [formData.activity_type, formData.area, formData.slug])

  // Load activity data and taxonomy options
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true)
        setError(null)

        // Load taxonomy options and activity data in parallel
        const [activityTypes, areas, people, difficultyLevels, seasons, activity] = await Promise.all([
          getActivityTypeOptions().catch(() => []),
          getAreaOptions().catch(() => []),
          getPeopleOptions().catch(() => []),
          getDifficultyLevelOptions().catch(() => []),
          getSeasonOptions().catch(() => []),
          getAdminActivityById(activityId),
        ])

        setActivityTypeOptions(activityTypes)
        setAreaOptions(areas)
        setPeopleOptions(people)
        setDifficultyLevelOptions(difficultyLevels)
        setSeasonOptions(seasons)

        // Populate form with activity data
        setFormData({
          title: activity.title || '',
          slug: activity.slug || '',
          activity_slug: activity.activity_slug || '',
          body: activity.body || '',
          body_summary: activity.body_summary || '',
          activity_type: activity.activity_type || '',
          activity_type_tid: activity.activity_type_tid || undefined,
          area: activity.area || '',
          area_tid: activity.area_tid || undefined,
          people: activity.people || '',
          people_tid: activity.people_tid || undefined,
          difficulty_level: activity.difficulty_level || '',
          difficulty_level_tid: activity.difficulty_level_tid || undefined,
          season: activity.season || '',
          season_tid: activity.season_tid || undefined,
          address: activity.address || '',
          latitude: activity.latitude?.toString() || '',
          longitude: activity.longitude?.toString() || '',
          featured_image_url: activity.featured_image_url || '',
          featured_image_alt: activity.featured_image_alt || '',
          featured_image_title: activity.featured_image_title || '',
          video_urls: activity.video_urls || [],
          published_at: formatDateForInput(activity.published_at),
          status: (activity.status as 'published' | 'draft' | 'archived') || 'draft',
          is_featured: activity.is_featured || false
        })
      } catch (err: any) {
        console.error('Failed to load activity:', err)
        setError(err.response?.data?.detail || err.message || 'Failed to load activity')
      } finally {
        setIsLoading(false)
        setLoadingOptions(false)
      }
    }
    loadData()
  }, [activityId])

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle taxonomy selection with both name and tid
  const handleActivityTypeChange = (tid: string) => {
    const selected = activityTypeOptions.find((opt) => opt.tid.toString() === tid)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        activity_type: selected.name,
        activity_type_tid: selected.tid,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        activity_type: '',
        activity_type_tid: undefined,
      }))
    }
  }

  const handleAreaChange = (tid: string) => {
    const selected = areaOptions.find((opt) => opt.tid.toString() === tid)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        area: selected.name,
        area_tid: selected.tid,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        area: '',
        area_tid: undefined,
      }))
    }
  }

  const handlePeopleChange = (tid: string) => {
    const selected = peopleOptions.find((opt) => opt.tid.toString() === tid)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        people: selected.name,
        people_tid: selected.tid,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        people: '',
        people_tid: undefined,
      }))
    }
  }

  const handleDifficultyChange = (tid: string) => {
    const selected = difficultyLevelOptions.find((opt) => opt.tid.toString() === tid)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        difficulty_level: selected.name,
        difficulty_level_tid: selected.tid,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        difficulty_level: '',
        difficulty_level_tid: undefined,
      }))
    }
  }

  const handleSeasonChange = (tid: string) => {
    const selected = seasonOptions.find((opt) => opt.tid.toString() === tid)
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        season: selected.name,
        season_tid: selected.tid,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        season: '',
        season_tid: undefined,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      setActiveTab('basic')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const activityData: ActivityUpdateData = {
        title: formData.title.trim(),
        slug: formData.slug.trim() || undefined,
        activity_slug: formData.activity_slug.trim() || undefined,
        body: formData.body.trim() || undefined,
        body_summary: formData.body_summary.trim() || undefined,
        activity_type: formData.activity_type || undefined,
        activity_type_tid: formData.activity_type_tid,
        area: formData.area || undefined,
        area_tid: formData.area_tid,
        people: formData.people || undefined,
        people_tid: formData.people_tid,
        difficulty_level: formData.difficulty_level || undefined,
        difficulty_level_tid: formData.difficulty_level_tid,
        season: formData.season || undefined,
        season_tid: formData.season_tid,
        address: formData.address.trim() || undefined,
        featured_image_url: formData.featured_image_url.trim() || undefined,
        featured_image_alt: formData.featured_image_alt.trim() || undefined,
        featured_image_title: formData.featured_image_title.trim() || undefined,
        video_urls: formData.video_urls.length > 0 ? formData.video_urls : undefined,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        published_at: formData.published_at || undefined,
        status: formData.status,
        is_featured: formData.is_featured
      }

      const activity = await updateActivity(activityId, activityData)
      setSuccessMessage(`Activity "${activity.title}" updated successfully!`)

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/activities')
      }, 1500)
    } catch (err: any) {
      let errorMessage = 'Failed to update activity'

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

  // Tab content renderers (same as new page)
  const renderBasicTab = () => (
    <div className="space-y-6">
      <FormField label="Activity Title" required>
        <Input
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder="e.g., Bell Mountain Trail"
          required
        />
      </FormField>

      <FormField
        label="URL Slug"
        hint={autoSlug ? 'Auto-generated from title. Click the lock to edit manually.' : 'Enter a custom URL slug.'}
      >
        <div className="flex gap-2">
          <Input
            value={formData.slug}
            onChange={(e) => updateField('slug', e.target.value)}
            placeholder="bell-mountain-trail"
            disabled={autoSlug}
            className={autoSlug ? 'bg-slate-50' : ''}
          />
          <button
            type="button"
            onClick={() => setAutoSlug(!autoSlug)}
            className={`px-3 py-2 rounded-lg border transition-colors ${autoSlug
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-slate-50 border-slate-300 text-slate-600'
              }`}
            title={autoSlug ? 'Click to edit manually' : 'Click to auto-generate'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {autoSlug ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              )}
            </svg>
          </button>
        </div>
      </FormField>

      <FormField
        label="Activity Slug"
        hint="Auto-generated in format: category/area/title (e.g., hiking/blue-ridge/bell-mountain-trail)"
      >
        <Input
          value={formData.activity_slug}
          onChange={(e) => updateField('activity_slug', e.target.value)}
          placeholder="category/area/title"
          className="bg-slate-50"
          readOnly
        />
      </FormField>

      <FormField label="Description" hint="Use the rich text editor to format your description with headings, lists, links, and images.">
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
            placeholder="Describe the activity, what visitors can expect, highlights..."
            minHeight={300}
          />
        </Suspense>
      </FormField>

      <FormField label="Summary" hint="A brief summary of the activity (optional, will be auto-generated if left empty)">
        <Textarea
          value={formData.body_summary}
          onChange={(e) => updateField('body_summary', e.target.value)}
          placeholder="Brief summary of the activity..."
          rows={3}
        />
      </FormField>
    </div>
  )

  const renderDetailsTab = () => (
    <div className="space-y-6">
      <FormField label="Activity Category" required>
        {loadingOptions ? (
          <div className="text-slate-500 text-sm">Loading categories...</div>
        ) : (
          <Select
            value={formData.activity_type_tid?.toString() || ''}
            onChange={(e) => handleActivityTypeChange(e.target.value)}
            placeholder="Select activity category"
            options={activityTypeOptions.map((opt) => ({ value: opt.tid.toString(), label: opt.name }))}
            required
          />
        )}
      </FormField>

      <FormField label="Area" hint="Select the area where this activity is located">
        {loadingOptions ? (
          <div className="text-slate-500 text-sm">Loading areas...</div>
        ) : (
          <Select
            value={formData.area_tid?.toString() || ''}
            onChange={(e) => handleAreaChange(e.target.value)}
            placeholder="Select area (optional)"
            options={areaOptions.map((opt) => ({ value: opt.tid.toString(), label: opt.name }))}
          />
        )}
      </FormField>

      <FormField label="Number of People" hint="Group size or capacity">
        {loadingOptions ? (
          <div className="text-slate-500 text-sm">Loading options...</div>
        ) : (
          <Select
            value={formData.people_tid?.toString() || ''}
            onChange={(e) => handlePeopleChange(e.target.value)}
            placeholder="Select number of people (optional)"
            options={peopleOptions.map((opt) => ({ value: opt.tid.toString(), label: opt.name }))}
          />
        )}
      </FormField>

      <FormField label="Level of Difficulty" hint="Difficulty rating">
        {loadingOptions ? (
          <div className="text-slate-500 text-sm">Loading options...</div>
        ) : (
          <Select
            value={formData.difficulty_level_tid?.toString() || ''}
            onChange={(e) => handleDifficultyChange(e.target.value)}
            placeholder="Select difficulty level (optional)"
            options={difficultyLevelOptions.map((opt) => ({ value: opt.tid.toString(), label: opt.name }))}
          />
        )}
      </FormField>

      <FormField label="Season" hint="Best season for this activity">
        {loadingOptions ? (
          <div className="text-slate-500 text-sm">Loading options...</div>
        ) : (
          <Select
            value={formData.season_tid?.toString() || ''}
            onChange={(e) => handleSeasonChange(e.target.value)}
            placeholder="Select season (optional)"
            options={seasonOptions.map((opt) => ({ value: opt.tid.toString(), label: opt.name }))}
          />
        )}
      </FormField>
    </div>
  )

  const renderLocationTab = () => (
    <div className="space-y-6">
      <FormField
        label="Address"
        hint="Use the rich text editor to provide the address and any location details."
      >
        <Suspense fallback={
          <div className="border border-slate-300 rounded-lg bg-slate-50 animate-pulse" style={{ minHeight: '200px' }}>
            <div className="h-10 bg-slate-200 rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          </div>
        }>
          <RichTextEditor
            value={formData.address}
            onChange={(value) => updateField('address', value)}
            placeholder="Enter the address and location details..."
            minHeight={200}
          />
        </Suspense>
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Latitude" hint="e.g., 34.8691">
          <Input
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => updateField('latitude', e.target.value)}
            placeholder="34.8691"
          />
        </FormField>

        <FormField label="Longitude" hint="e.g., -84.3242">
          <Input
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => updateField('longitude', e.target.value)}
            placeholder="-84.3242"
          />
        </FormField>
      </div>
    </div>
  )

  const renderMediaTab = () => (
    <div className="space-y-6">
      <div>
        <div className="space-y-4">
          <ImageUploader
            value={formData.featured_image_url}
            onChange={(url) => updateField('featured_image_url', url)}
            altValue={formData.featured_image_alt}
            onAltChange={(alt) => updateField('featured_image_alt', alt)}
            titleValue={formData.featured_image_title}
            onTitleChange={(title) => updateField('featured_image_title', title)}
            label="Activity Image"
            hint="Upload an image or enter a URL. Images will be automatically resized."
            showPreview={true}
            createThumbnail={false}
            imageType="activity"
            required
          />
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Videos</h3>
        <p className="text-sm text-slate-500 mb-4">Add video URLs. Drag to reorder, click to edit.</p>
        <VideoUrlsList
          videoUrls={formData.video_urls}
          onChange={(videoUrls) => updateField('video_urls', videoUrls)}
        />
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Publication Status</h3>
        <div className="flex gap-4">
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

      <div className="border-t border-slate-200 pt-6">
        <FormField label="Published Date" hint="Date when the activity was published or written">
          <Input
            type="date"
            value={formData.published_at}
            onChange={(e) => updateField('published_at', e.target.value)}
          />
        </FormField>
      </div>

      <div className="border-t border-slate-200 pt-6">
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => updateField('is_featured', e.target.checked)}
              className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
            />
            <div>
              <div className="font-medium text-slate-900">Featured Activity</div>
              <div className="text-xs text-slate-500">Show this activity prominently on the website</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  )

  const tabContent: Record<TabId, () => JSX.Element> = {
    basic: renderBasicTab,
    details: renderDetailsTab,
    location: renderLocationTab,
    media: renderMediaTab,
    settings: renderSettingsTab,
  }

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-slate-600">Loading activity...</p>
        </div>
      </div>
    )
  }

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
          <Link href="/admin/activities" className="hover:text-amber-600 transition-colors">
            Activities
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900">Edit</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Activity</h1>
            <p className="text-slate-500 mt-1">Update activity information and settings</p>
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
          {/* Tabs */}
          <div className="border-b border-slate-200 bg-slate-50">
            <nav className="flex overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                    ? 'border-amber-500 text-amber-600 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">{tabContent[activeTab]()}</div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <Link
            href="/admin/activities"
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
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Activity
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

