import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const doctorId = request.cookies.get('doctor_id')?.value
  const token = request.cookies.get('rx-token')?.value
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname === '/login') {
    if (pathname === '/login' && doctorId && token) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (!doctorId || !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = atob(token)
    const parsed = JSON.parse(decoded)
    if (parsed.doctor_id !== doctorId) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
