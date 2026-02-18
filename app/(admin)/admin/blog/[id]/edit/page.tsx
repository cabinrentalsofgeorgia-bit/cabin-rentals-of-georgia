'use client'

import { useState, useEffect, lazy, Suspense } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { getBlogById, updateBlog, Blog, BlogUpdateData } from '@/lib/api/blogs'
import PageLoading from '@/components/ui/PageLoading'

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

// Generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Format date for date input (YYYY-MM-DD)
function formatDateForInput(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function EditBlogPostPage() {
  const router = useRouter()
  const params = useParams()
  const blogId = params.id as string

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [blog, setBlog] = useState<Blog | null>(null)

  // Form state
  const [formData, setFormData] = useState<{
    title: string
    slug: string
    body: string
    published_at: string
    status: 'published' | 'draft' | 'archived'
    is_promoted: boolean
    is_sticky: boolean
  }>({
    title: '',
    slug: '',
    body: '',
    published_at: '',
    status: 'draft',
    is_promoted: false,
    is_sticky: false,
  })

  // Auto-generate slug from title
  const [autoSlug, setAutoSlug] = useState(false)

  // Load blog data
  useEffect(() => {
    async function loadBlog() {
      if (!blogId) return

      try {
        setLoading(true)
        setError(null)
        const blogData = await getBlogById(blogId)
        setBlog(blogData)
        
        // Populate form with existing data
        setFormData({
          title: blogData.title || '',
          slug: blogData.slug || '',
          body: blogData.body || '',
          published_at: formatDateForInput(blogData.published_at),
          status: (blogData.status as 'published' | 'draft' | 'archived') || 'draft',
          is_promoted: blogData.is_promoted || false,
          is_sticky: blogData.is_sticky || false,
        })
      } catch (err: any) {
        console.error('Error loading blog:', err)
        setError(err.response?.data?.detail || err.message || 'Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }

    loadBlog()
  }, [blogId])

  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }))
    }
  }, [formData.title, autoSlug])

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!blog) return

    // Validation
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    // Ensure slug is generated if empty
    let finalSlug = formData.slug.trim()
    if (!finalSlug) {
      finalSlug = generateSlug(formData.title.trim())
      if (!finalSlug) {
        setError('Unable to generate a valid slug from the title. Please enter a custom slug.')
        return
      }
      setFormData((prev) => ({ ...prev, slug: finalSlug }))
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(finalSlug)) {
      setError('Slug can only contain lowercase letters, numbers, and hyphens.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const blogData: BlogUpdateData = {
        title: formData.title.trim(),
        slug: finalSlug,
        body: formData.body.trim() || undefined,
        published_at: formData.published_at || undefined,
        status: formData.status,
        is_promoted: formData.is_promoted,
        is_sticky: formData.is_sticky,
      }

      const updatedBlog = await updateBlog(blogId, blogData)
      setSuccessMessage(`Blog post "${updatedBlog.title}" updated successfully!`)

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/blog')
      }, 1500)
    } catch (err: any) {
      let errorMessage = 'Failed to update blog post'
      
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail
        
        if (Array.isArray(detail)) {
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

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageLoading message="Loading blog post..." variant="container" />
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-red-900 mb-2">Blog Post Not Found</h2>
          <p className="text-red-700 mb-6">{error || 'The blog post you are trying to edit does not exist.'}</p>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Blog List
          </Link>
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
          <Link href="/admin/blog" className="hover:text-amber-600 transition-colors">
            Blog
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-900">Edit Post</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Edit Post</h1>
            <p className="text-slate-500 mt-1">Update blog post: {blog.title}</p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-800 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
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
                <FormField label="Post Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => updateField('title', e.target.value)}
                    placeholder="e.g., Top 10 Mountain Getaways"
                    required
                  />
                </FormField>

                <FormField
                  label="URL Slug"
                  required
                  hint={autoSlug ? 'Auto-generated from title. Click the lock to edit manually.' : 'Enter a custom URL slug. This will be used in the blog post URL.'}
                >
                  <div className="flex gap-2">
                    <Input
                      value={formData.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="top-10-mountain-getaways"
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

                <FormField label="Published Date" hint="Date when the post was published or written">
                  <Input
                    type="date"
                    value={formData.published_at}
                    onChange={(e) => updateField('published_at', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* Content */}
            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Content</h2>
              <div className="space-y-6">
                <FormField 
                  label="Post Content" 
                  hint="Use the rich text editor to format the post content with headings, lists, links, and images."
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
                      placeholder="Write your blog post content here..."
                      minHeight={300}
                    />
                  </Suspense>
                </FormField>
              </div>
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
                        checked={formData.is_promoted}
                        onChange={(e) => updateField('is_promoted', e.target.checked)}
                        className="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                      />
                      <div>
                        <div className="font-medium text-slate-900">Promoted Post</div>
                        <div className="text-xs text-slate-500">Show this post prominently on the website</div>
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
                        <div className="text-xs text-slate-500">Keep this post at the top of lists</div>
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
            href="/admin/blog"
            className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || loading}
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
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

