import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

// Types
export interface User {
  id: string
  username: string
  name: string
  role: 'admin' | 'barber'
}

export interface TokenPayload {
  sub: string
  username: string
  name: string
  role: 'admin' | 'barber'
  iat: number
  exp: number
}

// Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'kingsstudio-super-secret-change-in-production-min-32-chars'
)
const JWT_EXPIRY = '8h'
const BCRYPT_ROUNDS = 12
const COOKIE_NAME = 'kingsstudio_auth'
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 8, // 8 hours
  path: '/',
}

// Rate limiting store (in production, use Redis)
const loginAttempts = new Map<string, { count: number; resetAt: number }>()

// More permissive in development
const isDev = process.env.NODE_ENV !== 'production'
const RATE_LIMIT_WINDOW_MS = isDev ? 5 * 60 * 1000 : 15 * 60 * 1000 // 5 min dev, 15 min prod
const RATE_LIMIT_MAX_ATTEMPTS = isDev ? 20 : 5 // 20 attempts dev, 5 prod

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const windowMs = RATE_LIMIT_WINDOW_MS
  const maxAttempts = RATE_LIMIT_MAX_ATTEMPTS

  const record = loginAttempts.get(ip)
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetAt: now + windowMs }
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  record.count++
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt }
}

// Helper to clear rate limit (for testing)
export function clearRateLimit(ip?: string) {
  if (ip) {
    loginAttempts.delete(ip)
  } else {
    loginAttempts.clear()
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createToken(user: User): Promise<string> {
  return new SignJWT({
    username: user.username,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export function setAuthCookie(token: string) {
  // This is a helper - actual cookie setting happens in API routes
  // because cookies() is async in Next.js 14
}

export function clearAuthCookie() {
  // Helper - actual clearing in API routes
}

export const AUTH_COOKIE_NAME = COOKIE_NAME
export const AUTH_COOKIE_OPTIONS = COOKIE_OPTIONS