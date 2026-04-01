import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
).replace(/\/+$/, '')

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Origin: 'https://crog-ai.com',
    Referer: 'https://crog-ai.com/',
    'X-Forwarded-Host': 'crog-ai.com',
  }

  if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
    headers['CF-Access-Client-Id'] = process.env.CF_ACCESS_CLIENT_ID
    headers['CF-Access-Client-Secret'] = process.env.CF_ACCESS_CLIENT_SECRET
  }

  return headers
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const backendPath = '/' + params.path.join('/')
  const url = new URL(backendPath, BACKEND_URL)
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value)
  })

  try {
    const response = await fetch(url.toString(), {
      method: request.method,
      headers: buildHeaders(),
      body: request.method !== 'GET' && request.method !== 'HEAD'
        ? await request.text()
        : undefined,
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
    console.error('[proxy] upstream error:', error)
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
