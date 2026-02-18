'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getAdminActivities, deleteActivity, updateActivityStatus, Activity, ActivityListResponse, ActivityListParams } from '@/lib/api/activities'

function StatusBadge({ status }: { status: string }) {
  const styles = {
    published: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    draft: 'bg-amber-100 text-amber-700 border border-amber-200',
    archived: 'bg-slate-100 text-slate-600 border border-slate-200',
  }

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.draft}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function FeaturedBadge({ isFeatured }: { isFeatured: boolean }) {
  if (!isFeatured) return null

  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
      Featured
    </span>
  )
}

function DeleteModal({
  activity,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  activity: Activity
  onConfirm: () => void
  onCancel: () => void
  isDeleting: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Delete Activity</h3>
            <p className="text-sm text-slate-500">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-slate-600 mb-6">
          Are you sure you want to delete <span className="font-semibold">&quot;{activity.title}&quot;</span>?
          All associated data will be permanently removed.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isDeleting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Deleting...
              </>
            ) : (
              'Delete Activity'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function StatusChangeDropdown({
  activity,
  onStatusChange,
}: {
  activity: Activity
  onStatusChange: (activityId: string, newStatus: 'published' | 'draft' | 'archived') => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const statuses: Array<{ value: 'published' | 'draft' | 'archived'; label: string; icon: JSX.Element }> = [
    {
      value: 'published',
      label: 'Published',
      icon: (
        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      value: 'draft',
      label: 'Draft',
      icon: (
        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
    {
      value: 'archived',
      label: 'Archived',
      icon: (
        <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        title="Change status"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white rounded-lg shadow-lg border border-slate-200 py-1 min-w-[150px]">
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Change Status
            </div>
            {statuses
              .filter((s) => s.value !== activity.status)
              .map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    onStatusChange(activity.id, status.value)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  {status.icon}
                  {status.label}
                </button>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-pulse">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Activity', 'Category', 'Area', 'Status', 'Featured', 'Created', 'Last Updated', 'Actions'].map((header) => (
                <th key={header} className="text-left px-6 py-4">
                  <div className="h-3 bg-slate-200 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 bg-slate-200 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-200 rounded w-24" />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-20" /></td>
                <td className="px-6 py-4"><div className="h-6 bg-slate-200 rounded-full w-16" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-20" /></td>
                <td className="px-6 py-4"><div className="h-8 bg-slate-200 rounded w-24" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmptyState({ search, status }: { search: string; status: string }) {
  const hasFilters = search || status

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">
        {hasFilters ? 'No activities found' : 'No activities yet'}
      </h3>
      <p className="text-slate-500 mb-6 max-w-sm mx-auto">
        {hasFilters
          ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
          : 'Get started by adding your first activity.'}
      </p>
      {!hasFilters && (
        <Link
          href="/admin/activities/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Your First Activity
        </Link>
      )}
    </div>
  )
}

export default function AllActivitiesPage() {
  const [data, setData] = useState<ActivityListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Modals and actions
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // Reset to page 1 on search
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch data
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const params: ActivityListParams = {
        page,
        page_size: 10,
      }

      if (statusFilter) {
        params.status = statusFilter
      }

      if (debouncedSearch) {
        params.search = debouncedSearch
      }

      const response = await getAdminActivities(params)
      setData(response)
    } catch (err: any) {
      console.error('Failed to fetch activities:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to load activities')
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter, debouncedSearch])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Handle delete
  const handleDelete = async () => {
    if (!activityToDelete) return

    setIsDeleting(true)
    try {
      await deleteActivity(activityToDelete.id)
      setActionMessage({ type: 'success', text: `"${activityToDelete.title}" has been deleted.` })
      setActivityToDelete(null)
      fetchActivities()
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to delete activity' })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle status change
  const handleStatusChange = async (activityId: string, newStatus: 'published' | 'draft' | 'archived') => {
    try {
      await updateActivityStatus(activityId, newStatus)
      const activity = data?.activities.find((a) => a.id === activityId)
      setActionMessage({ type: 'success', text: `"${activity?.title}" status changed to ${newStatus}.` })
      fetchActivities()
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to update status' })
    }
  }

  // Auto-hide action messages
  useEffect(() => {
    if (actionMessage) {
      const timer = setTimeout(() => setActionMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [actionMessage])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  const activities = data?.activities || []
  const totalPages = data?.total_pages || 1
  const total = data?.total || 0

  return (
    <div className="space-y-6">
      {/* Action Message Toast */}
      {actionMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-top-2 duration-300 ${actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
            }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="text-sm font-medium">{actionMessage.text}</span>
            <button
              onClick={() => setActionMessage(null)}
              className="ml-2 text-current opacity-60 hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {activityToDelete && (
        <DeleteModal
          activity={activityToDelete}
          onConfirm={handleDelete}
          onCancel={() => setActivityToDelete(null)}
          isDeleting={isDeleting}
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Activities</h1>
          <p className="text-slate-500 mt-1">
            Manage Blue Ridge activities and attractions
            {total > 0 && !loading && <span className="text-slate-400"> · {total} total</span>}
          </p>
        </div>
        <Link
          href="/admin/activities/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Activity
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search activities by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-shadow"
            />
            <svg
              className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white min-w-[140px] cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            {(statusFilter || search) && (
              <button
                onClick={() => {
                  setStatusFilter('')
                  setSearch('')
                }}
                className="px-4 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1">
            <p className="text-red-800 font-medium">Failed to load activities</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={fetchActivities}
            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && !data && <LoadingSkeleton />}

      {/* Empty State */}
      {!loading && !error && activities.length === 0 && (
        <EmptyState search={debouncedSearch} status={statusFilter} />
      )}

      {/* Activities Table */}
      {!error && activities.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Featured
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-200 ${loading ? 'opacity-50' : ''}`}>
                {activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-slate-200 rounded-lg overflow-hidden relative flex-shrink-0">
                          {activity.featured_image_url ? (
                            <Image
                              src={activity.featured_image_url}
                              alt={activity.featured_image_alt || activity.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100">
                              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/activity/${activity.activity_slug}`}
                            className="font-medium text-slate-900 hover:text-amber-600 transition-colors block truncate"
                          >
                            {activity.title}
                          </Link>
                          <p className="text-sm text-slate-500 truncate max-w-[200px]">
                            {activity.body_summary || activity.body?.substring(0, 50) || 'No description'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {activity.activity_type || '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {activity.area || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={activity.status} />
                    </td>
                    <td className="px-6 py-4">
                      <FeaturedBadge isFeatured={activity.is_featured} />
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      {activity.created_at ? new Date(activity.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      }) : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">
                      {activity.updated_at
                        ? new Date(activity.updated_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {activity.activity_slug && (
                          <Link
                            href={`/activity/${activity.activity_slug}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View on site"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        )}
                        <Link
                          href={`/admin/activities/${activity.id}/edit`}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <StatusChangeDropdown activity={activity} onStatusChange={handleStatusChange} />
                        <button
                          onClick={() => setActivityToDelete(activity)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Showing{' '}
                <span className="font-medium">{(page - 1) * 10 + 1}-{Math.min(page * 10, total)}</span>
                {' '}of <span className="font-medium">{total}</span> activities
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => {
                      // Show first, last, current, and pages around current
                      return p === 1 || p === totalPages || Math.abs(p - page) <= 1
                    })
                    .map((p, idx, arr) => {
                      // Add ellipsis
                      const showEllipsisBefore = idx > 0 && arr[idx - 1] !== p - 1
                      return (
                        <span key={p} className="flex items-center">
                          {showEllipsisBefore && <span className="px-2 text-slate-400">...</span>}
                          <button
                            onClick={() => setPage(p)}
                            disabled={loading}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${p === page
                                ? 'bg-amber-600 text-white'
                                : 'border border-slate-300 hover:bg-slate-50'
                              }`}
                          >
                            {p}
                          </button>
                        </span>
                      )
                    })}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
