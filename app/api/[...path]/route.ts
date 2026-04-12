import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '')

function buildHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: 'https://cabin-rentals-of-georgia.com',
    Referer: 'https://cabin-rentals-of-georgia.com/',
    'X-Forwarded-Host': 'cabin-rentals-of-georgia.com',
  }

  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID
    headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET
  }

  // Forward Authorization so JWT-authenticated calls work transparently
  const auth = request.headers.get('Authorization')
  if (auth) headers['Authorization'] = auth

  return headers
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  // Next.js strips the /api/ prefix when routing to app/api/[...path].
  // Re-add it so the backend receives the correct path.
  const backendPath = '/api/' + params.path.join('/')
  const url = new URL(backendPath, BACKEND_URL)

  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: buildHeaders(request),
      body:
        request.method !== 'GET' && request.method !== 'HEAD'
          ? await request.text()
          : undefined,
      cache: 'no-store',
    })

    const body = await response.text()

    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[api-catchall] upstream error:', error)
    return NextResponse.json(
      { error: 'Upstream backend unreachable' },
      { status: 502 }
    )
  }
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
