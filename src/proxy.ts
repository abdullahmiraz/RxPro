import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'
import { verifyToken } from '@/lib/auth'

export function proxy(request: NextRequest) {
  const doctorId = request.cookies.get('doctor_id')?.value
  const token = request.cookies.get('rx-token')?.value
  const { pathname } = request.nextUrl

  // Auth redirects
  if (pathname === '/' || pathname === '/login') {
    if (pathname === '/login' && doctorId && token && verifyToken(token)?.doctor_id === doctorId) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!doctorId || !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const decoded = verifyToken(token)
  if (!decoded || decoded.doctor_id !== doctorId) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // CSP with per-request nonce
  const nonce = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
  const isDev = process.env.NODE_ENV === 'development'
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join('; ')

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
