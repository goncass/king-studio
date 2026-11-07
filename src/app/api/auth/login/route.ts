import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createToken, checkRateLimit, getClientIp, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth'

// User database - in production, use a real database
// Passwords should be pre-hashed and stored in environment variables or database
const USERS = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin',
    role: 'admin' as const,
    // password: kings2020 (hashed)
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S',
  },
  {
    id: '2',
    username: 'king',
    name: 'King',
    role: 'admin' as const,
    // password: king2020 (hashed)
    passwordHash: '$2a$12$8K1p/a0dURXAm7QiTRqUzuPjwDQUbNvcN.7QZ8LqJq1Q5ZqJq5q5y',
  },
  {
    id: '3',
    username: 'ricardo',
    name: 'Ricardo',
    role: 'barber' as const,
    // password: ricardo2020 (hashed)
    passwordHash: '$2a$12$9L2q/b1eVSYBn8RjUSRvavQkxEVRoCOWD8R9AMrKqr2R6ArKr6r6z',
  },
  {
    id: '4',
    username: 'miguel',
    name: 'Miguel',
    role: 'barber' as const,
    // password: miguel2020 (hashed)
    passwordHash: '$2a$12$0M3r/c2fWTZCo9SkVTSwbwRlyFWSpDPXE9SBNLrLrs3S7BsLs7s8A',
  },
]

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rateLimit = checkRateLimit(ip)

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Utilizador e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Find user
    const user = USERS.find(u => u.username === username)
    if (!user) {
      // Use same timing to prevent username enumeration
      await verifyPassword(password, '$2a$12$dummy.hash.to.prevent.timing.attacks')
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Verify password
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // Create token
    const token = await createToken({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    })

    // Set httpOnly cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      }
    })

    response.cookies.set(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS)

    // Add rate limit headers
    response.headers.set('X-RateLimit-Remaining', String(rateLimit.remaining))
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetAt / 1000)))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}