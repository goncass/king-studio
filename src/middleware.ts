import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kingsstudio-super-secret-change-in-production-min-32-chars'
)

const PROTECTED_PATHS = ['/admin']
const PUBLIC_PATHS = ['/admin/login'] // Exclude login from protection
const AUTH_COOKIE_NAME = 'kingsstudio_auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths (login page)
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if path is protected
  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

  if (!token) {
    // Redirect to login with return URL
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    await jwtVerify(token, JWT_SECRET)
    return NextResponse.next()
  } catch {
    // Invalid token - clear cookie and redirect
    const response = NextResponse.redirect(new URL('/admin/login', request.url))
    response.cookies.set(AUTH_COOKIE_NAME, '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/admin/:path*'],
}