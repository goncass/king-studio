import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getAdminCount,
} from '@/lib/db/users'

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

  try {
    const users = await getUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Erro ao buscar utilizadores' }, { status: 500 })
  }
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

    const newUser = await createUser({ username, name, role, password })

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error: any) {
    console.error('Create user error:', error)
    if (error.message === 'Utilizador já existe') {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
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

    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    // Prevent removing last admin
    if (user.role === 'admin' && role === 'barber') {
      const adminCount = await getAdminCount()
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Não pode remover o último admin' }, { status: 400 })
      }
    }

    const updatedUser = await updateUser(id, { name, role, password })
    if (!updatedUser) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Update user error:', error)
    if (error.message === 'Utilizador já existe') {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
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

    const user = await getUserById(id)
    if (!user) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    // Prevent deleting last admin
    if (user.role === 'admin') {
      const adminCount = await getAdminCount()
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Não pode eliminar o último admin' }, { status: 400 })
      }
    }

    // Prevent self-deletion
    const cookieStore = await cookies()
    const token = cookieStore.get('kingsstudio_auth')?.value
    if (token) {
      const payload = await verifyToken(token)
      if (payload && payload.sub === id) {
        return NextResponse.json({ error: 'Não pode eliminar a si mesmo' }, { status: 400 })
      }
    }

    const deleted = await deleteUser(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Utilizador não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}