import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import redirectMap from '@/lib/redirects.json'

const redirects: Record<string, string> = redirectMap

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const target = redirects[pathname] || redirects[pathname.replace(/\/$/, '')]
  if (target) {
    const url = request.nextUrl.clone()
    url.pathname = target.split('?')[0]
    url.search = target.includes('?') ? '?' + target.split('?')[1] : ''
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon\\.ico|images|icons|fonts).*)',
  ],
}
