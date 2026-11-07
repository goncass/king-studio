import { createServerClient, type DbUser } from '@/lib/supabase'
import { hashPassword, verifyPassword } from '@/lib/auth'

// Transform DB user to app format (without password hash)
export function transformUser(db: DbUser) {
  return {
    id: db.id,
    username: db.username,
    name: db.name,
    role: db.role,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
  }
}

export async function getUsers() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('id, username, name, role, password_hash, created_at, updated_at')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('getUsers error:', error)
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  return (data || []).map(transformUser)
}

export async function getUserById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('getUserById error:', error)
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data as DbUser
}

export async function getUserByUsername(username: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    console.error('getUserByUsername error:', error)
    throw new Error(`Failed to fetch user: ${error.message}`)
  }

  return data as DbUser
}

export async function createUser(data: {
  username: string
  name: string
  role: 'admin' | 'barber'
  password: string
}) {
  const supabase = createServerClient()

  // Hash password
  const passwordHash = await hashPassword(data.password)

  const { data: inserted, error } = await supabase
    .from('users')
    .insert({
      username: data.username,
      name: data.name,
      role: data.role,
      password_hash: passwordHash,
    })
    .select()
    .single()

  if (error) {
    console.error('createUser error:', error)
    if (error.code === '23505') { // unique violation
      throw new Error('Utilizador já existe')
    }
    throw new Error(`Failed to create user: ${error.message}`)
  }

  return transformUser(inserted)
}

export async function updateUser(
  id: string,
  data: {
    name?: string
    role?: 'admin' | 'barber'
    password?: string
  }
) {
  const supabase = createServerClient()

  const updates: Partial<DbUser> = {}
  if (data.name) updates.name = data.name
  if (data.role) updates.role = data.role
  if (data.password) {
    updates.password_hash = await hashPassword(data.password)
  }
  updates.updated_at = new Date().toISOString()

  const { data: updated, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateUser error:', error)
    if (error.code === '23505') {
      throw new Error('Utilizador já existe')
    }
    throw new Error(`Failed to update user: ${error.message}`)
  }

  return transformUser(updated)
}

export async function deleteUser(id: string): Promise<boolean> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteUser error:', error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  return true
}

export async function getAdminCount(): Promise<number> {
  const supabase = createServerClient()

  const { count, error } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'admin')

  if (error) {
    console.error('getAdminCount error:', error)
    return 0
  }

  return count || 0
}

export async function verifyUserPassword(username: string, password: string): Promise<DbUser | null> {
  const user = await getUserByUsername(username)
  if (!user) return null

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) return null

  return user
}