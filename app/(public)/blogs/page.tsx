import { Suspense } from 'react'
import { Blog, BlogListResponse, getBlogs } from '@/lib/api/blogs'
import Link from 'next/link'
import PageLoading from '@/components/ui/PageLoading'
import { stripHtmlTags } from '@/lib/utils/html-utils'

export const metadata = {
  title: 'Blog - Cabin Rentals of Georgia',
  description: 'Read our latest blog posts about North Georgia, cabin living, and travel tips',
}

async function fetchBlogs(page: number = 1): Promise<BlogListResponse> {
  try {
    const data = await getBlogs({
      page,
      page_size: 12,
      status: 'published',
    })
    return data
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return {
      blogs: [],
      total: 0,
      page: 1,
      page_size: 12,
      total_pages: 0
    }
  }
}

function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 9
    const sidePages = 4

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      let startPage = Math.max(2, currentPage - sidePages)
      let endPage = Math.min(totalPages - 1, currentPage + sidePages)

      // Adjust if we're near the start
      if (currentPage <= sidePages + 2) {
        endPage = Math.min(maxVisible - 1, totalPages - 1)
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - sidePages - 1) {
        startPage = Math.max(2, totalPages - maxVisible + 2)
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...')
      }

      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...')
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap my-8 pagination">
      {/* First */}
      {currentPage > 1 ? (
        <Link href="/blogs?page=1" className="pagination-link">
          « first
        </Link>
      ) : (
        <span className="pagination-disabled">« first</span>
      )}

      {/* Previous */}
      {currentPage > 1 ? (
        <Link href={`/blogs?page=${currentPage - 1}`} className="pagination-link">
          ‹ previous
        </Link>
      ) : (
        <span className="pagination-disabled">‹ previous</span>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
        }

        const pageNum = page as number
        const isCurrentPage = pageNum === currentPage

        if (isCurrentPage) {
          return (
            <span key={pageNum} className="pagination-current">
              {pageNum}
            </span>
          )
        }

        return (
          <Link
            key={pageNum}
            href={`/blogs?page=${pageNum}`}
            className="pagination-link"
          >
            {pageNum}
          </Link>
        )
      })}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={`/blogs?page=${currentPage + 1}`} className="pagination-link">
          next ›
        </Link>
      ) : (
        <span className="pagination-disabled">next ›</span>
      )}

      {/* Last */}
      {currentPage < totalPages ? (
        <Link href={`/blogs?page=${totalPages}`} className="pagination-link">
          last »
        </Link>
      ) : (
        <span className="pagination-disabled">last »</span>
      )}
    </div>
  )
}

function formatBlogUrl(blog: Blog): string {
  // Use published_at if available, otherwise fall back to created_at
  const dateString = blog.published_at || blog.created_at
  if (dateString) {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `/blog/${year}/${month}/${day}/${blog.slug}`
  }
  // Fallback: use current date if no date available (shouldn't happen in practice)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `/blog/${year}/${month}/${day}/${blog.slug}`
}

async function BlogContent({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = parseInt(searchParams.page || '1', 10) || 1
  const data = await fetchBlogs(currentPage)
  const { blogs, total_pages } = data

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-[210%] mb-4">Blogs</h1>
        
        {blogs.length === 0 ? (
          <div className="rounded">
            <p>No blog posts available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-8 block">
            {blogs.map((blog) => (
              <article key={blog.id}>
                <h3 className="my-0">
                  <Link href={formatBlogUrl(blog)} className="text-[20px] font-normal">
                    {blog.title}
                  </Link>
                </h3>
                {blog.published_at && (
                  <p className="text-sm italic my-0">
                    {new Date(blog.published_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                {blog.body ? (
                  <p className="my-0">
                    {stripHtmlTags(blog.body).substring(0, 275)}
                    {stripHtmlTags(blog.body).length > 275 ? '...' : ''}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
        
        <Pagination currentPage={currentPage} totalPages={total_pages} />
      </div>
    </div>
  )
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  return (
    <Suspense fallback={<PageLoading message="Loading blog posts..." variant="container" />}>
      <BlogContent searchParams={searchParams} />
    </Suspense>
  )
}

