import { NextRequest, NextResponse } from 'next/server'
import { verifyPassword, createToken, checkRateLimit, getClientIp, AUTH_COOKIE_NAME, AUTH_COOKIE_OPTIONS } from '@/lib/auth'
import { verifyUserPassword } from '@/lib/db/users'

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

    // Find user and verify password from database
    const user = await verifyUserPassword(username, password)

    if (!user) {
      // Use same timing to prevent username enumeration
      await verifyPassword(password, '$2a$12$dummy.hash.to.prevent.timing.attacks')
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