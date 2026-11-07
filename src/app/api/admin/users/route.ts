import { NextRequest, NextResponse } from 'next/server'
import { hashPassword, verifyPassword, getSession, verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'

// In-memory user store (in production, use database)
// This mirrors the login route USERS array
let USERS = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin',
    role: 'admin' as const,
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', // kings2020
  },
  {
    id: '2',
    username: 'king',
    name: 'King',
    role: 'barber' as const,
    passwordHash: '$2a$12$8K1p/a0dURXAm7QiTRqUzuPjwDQUbNvcN.7QZ8LqJq1Q5ZqJq5q5y', // king2020
  },
  {
    id: '3',
    username: 'ricardo',
    name: 'Ricardo',
    role: 'barber' as const,
    passwordHash: '$2a$12$9L2q/b1eVSYBn8RjUSRvavQkxEVRoCOWD8R9AMrKqr2R6ArKr6r6z', // ricardo2020
  },
  {
    id: '4',
    username: 'miguel',
    name: 'Miguel',
    role: 'barber' as const,
    passwordHash: '$2a$12$0M3r/c2fWTZCo9SkVTSwbwRlyFWSpDPXE9SBNLrLrs3S7BsLs7s8A', // miguel2020
  },
]

function getNextId() {
  return String(Math.max(...USERS.map(u => parseInt(u.id))) + 1)
}

function sanitizeUser(user: typeof USERS[0]) {
  const { passwordHash, ...rest } = user
  return rest
}

// Verify admin access
async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean; user?: any }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('kingsstudio_auth')?.value

  if (!token) {
    return { authorized: false }
  }

  try {
    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return { authorized: false }
    }
    return { authorized: true, user: payload }
  } catch {
    return { authorized: false }
  }
}

export async function GET(request: NextRequest) {
  const { authorized } = await verifyAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  return NextResponse.json({ users: USERS.map(sanitizeUser) })
}

export async function POST(request: NextRequest) {
  const { authorized } = await verifyAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { username, name, role, password } = body

    // Validation
    if (!username || !name || !role || !password) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (!['admin', 'barber'].includes(role)) {
      return NextResponse.json({ error: 'Role inválido' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 })
    }

    // Check username uniqueness
    if (USERS.some(u => u.username === username)) {
      return NextResponse.json({ error: 'Utilizador já existe' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    const newUser = {
      id: getNextId(),
      username,
      name,
      role,
      passwordHash,
    }

    USERS.push(newUser)

    return NextResponse.json({ user: sanitizeUser(newUser) }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const { authorized } = await verifyAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, name, role, password } = body

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    const userIndex = USERS.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    // Prevent removing last admin
    if (USERS[userIndex].role === 'admin' && role === 'barber') {
      const adminCount = USERS.filter(u => u.role === 'admin').length
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Não pode remover o último admin' }, { status: 400 })
      }
    }

    // Update fields
    if (name) USERS[userIndex].name = name
    if (role) USERS[userIndex].role = role
    if (password) {
      if (password.length < 8) {
        return NextResponse.json({ error: 'Senha deve ter pelo menos 8 caracteres' }, { status: 400 })
      }
      USERS[userIndex].passwordHash = await hashPassword(password)
    }

    return NextResponse.json({ user: sanitizeUser(USERS[userIndex]) })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { authorized } = await verifyAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    const userIndex = USERS.findIndex(u => u.id === id)
    if (userIndex === -1) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    // Prevent deleting last admin
    if (USERS[userIndex].role === 'admin') {
      const adminCount = USERS.filter(u => u.role === 'admin').length
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Não pode eliminar o último admin' }, { status: 400 })
      }
    }

    // Prevent self-deletion (get current user from token)
    const cookieStore = await cookies()
    const token = cookieStore.get('kingsstudio_auth')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.sub === id) {
        return NextResponse.json({ error: 'Não pode eliminar a si mesmo' }, { status: 400 })
      }
    }

    USERS.splice(userIndex, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}