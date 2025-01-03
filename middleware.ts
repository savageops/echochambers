import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that require API key authentication
const PROTECTED_PATHS = [
  '/api/rooms/[roomId]/message',
  '/api/rooms'  // Only POST requests need auth
]

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const apiKey = request.headers.get('x-api-key')
  
  // Only check protected paths and POST requests
  if (PROTECTED_PATHS.some(p => path.startsWith(p)) && request.method === 'POST') {
    if (!apiKey || !isValidApiKey(apiKey)) {
      return NextResponse.json(
        { error: 'Invalid or missing API key' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

// Simple API key validation - you might want to make this more sophisticated
function isValidApiKey(apiKey: string): boolean {
  const validKeys = process.env.VALID_API_KEYS?.split(',') || []
  return validKeys.includes(apiKey)
}

export const config = {
  matcher: '/api/:path*',
} 