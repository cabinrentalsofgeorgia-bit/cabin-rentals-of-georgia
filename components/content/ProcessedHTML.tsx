'use client'

import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface ProcessedHTMLProps {
  html: string
  className?: string
}

const IFRAME_RESPONSIVE_CLASSES = [
  '[&_iframe]:w-full',
  '[&_iframe]:aspect-video',
  '[&_iframe]:rounded-lg',
  '[&_iframe]:max-w-full',
  '[&_video]:w-full',
  '[&_video]:aspect-video',
  '[&_video]:rounded-lg',
  '[&_video]:max-w-full',
  '[&_object]:w-full',
  '[&_object]:max-w-full',
  '[&_embed]:w-full',
  '[&_embed]:max-w-full',
].join(' ')

/**
 * Renders legacy HTML content with responsive iframe/video handling
 * and converts internal links to Next.js client-side navigation.
 */
export default function ProcessedHTML({ html, className = '' }: ProcessedHTMLProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!containerRef.current) return

    const anchors = containerRef.current.querySelectorAll('a[href]')
    const clickHandlers: Array<{ element: Element; handler: (e: Event) => void }> = []

    anchors.forEach((anchor) => {
      const href = anchor.getAttribute('href')
      if (!href) return

      const isInternalLink =
        href.startsWith('/') ||
        href.startsWith('#') ||
        href.includes('cabin-rentals-of-georgia.com') ||
        (!href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:'))

      if (isInternalLink) {
        let relativePath = href
        if (href.includes('cabin-rentals-of-georgia.com')) {
          try {
            const url = new URL(href.startsWith('http') ? href : `https://${href}`)
            relativePath = url.pathname + url.search + url.hash
          } catch {
            const match = href.match(/cabin-rentals-of-georgia\.com([^\s]*)/)
            if (match) {
              relativePath = match[1] || '/'
            }
          }
        }

        if (relativePath.startsWith('#')) {
          return
        }

        const handler = (e: Event) => {
          e.preventDefault()
          e.stopPropagation()
          router.push(relativePath)
        }

        anchor.addEventListener('click', handler)
        clickHandlers.push({ element: anchor, handler })
        ;(anchor as HTMLElement).style.cursor = 'pointer'
      }
    })

    return () => {
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener('click', handler)
      })
    }
  }, [html, router, pathname])

  return (
    <div
      ref={containerRef}
      className={`${IFRAME_RESPONSIVE_CLASSES} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

