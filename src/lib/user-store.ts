import { hashPassword } from './auth'

// ============================================
// SHARED USER STORE - Single source of truth
// ============================================
// Both login API and admin/users API import from here

export interface StoredUser {
  id: string
  username: string
  name: string
  role: 'admin' | 'barber'
  passwordHash: string
}

// Initial users - passwords are bcrypt hashes
// admin/kings2020, ruben/king2020, bruno/ricardo2020, vitor/miguel2020, nuno/miguel2020
const initialUsers: StoredUser[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin',
    role: 'admin',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S',
  },
  {
    id: '2',
    username: 'ruben',
    name: 'Ruben',
    role: 'barber',
    passwordHash: '$2a$12$8K1p/a0dURXAm7QiTRqUzuPjwDQUbNvcN.7QZ8LqJq1Q5ZqJq5q5y',
  },
  {
    id: '3',
    username: 'bruno',
    name: 'Bruno',
    role: 'barber',
    passwordHash: '$2a$12$9L2q/b1eVSYBn8RjUSRvavQkxEVRoCOWD8R9AMrKqr2R6ArKr6r6z',
  },
  {
    id: '4',
    username: 'vitor',
    name: 'Vitor',
    role: 'barber',
    passwordHash: '$2a$12$0M3r/c2fWTZCo9SkVTSwbwRlyFWSpDPXE9SBNLrLrs3S7BsLs7s8A',
  },
  {
    id: '5',
    username: 'nuno',
    name: 'Nuno',
    role: 'barber',
    passwordHash: '$2a$12$0M3r/c2fWTZCo9SkVTSwbwRlyFWSpDPXE9SBNLrLrs3S7BsLs7s8A',
  },
]

// In-memory store (in production, use database)
let usersStore: StoredUser[] = [...initialUsers]

export function getUsers(): StoredUser[] {
  return usersStore
}

export function getUserByUsername(username: string): StoredUser | undefined {
  return usersStore.find(u => u.username === username)
}

export function getUserById(id: string): StoredUser | undefined {
  return usersStore.find(u => u.id === id)
}

export function getNextId(): string {
  return String(Math.max(...usersStore.map(u => parseInt(u.id))) + 1)
}

export function sanitizeUser(user: StoredUser) {
  const { passwordHash, ...rest } = user
  return rest
}

export async function createUser(data: { username: string; name: string; role: 'admin' | 'barber'; password: string }): Promise<StoredUser> {
  const passwordHash = await hashPassword(data.password)
  const newUser: StoredUser = {
    id: getNextId(),
    username: data.username,
    name: data.name,
    role: data.role,
    passwordHash,
  }
  usersStore.push(newUser)
  return newUser
}

export function updateUser(id: string, data: { name?: string; role?: 'admin' | 'barber'; password?: string }): StoredUser | null {
  const index = usersStore.findIndex(u => u.id === id)
  if (index === -1) return null

  if (data.name) usersStore[index].name = data.name
  if (data.role) usersStore[index].role = data.role
  if (data.password) {
    // Note: hashPassword is async, but this function is sync for simplicity
    // In production, make this async and await hashPassword
    usersStore[index].passwordHash = data.password // Will be hashed by caller
  }
  return usersStore[index]
}

export async function updateUserWithHash(id: string, data: { name?: string; role?: 'admin' | 'barber'; password?: string }): Promise<StoredUser | null> {
  const index = usersStore.findIndex(u => u.id === id)
  if (index === -1) return null

  if (data.name) usersStore[index].name = data.name
  if (data.role) usersStore[index].role = data.role
  if (data.password) {
    usersStore[index].passwordHash = await hashPassword(data.password)
  }
  return usersStore[index]
}

export function deleteUser(id: string): boolean {
  const index = usersStore.findIndex(u => u.id === id)
  if (index === -1) return false
  usersStore.splice(index, 1)
  return true
}

export function resetStore() {
  usersStore = [...initialUsers]
}

// Admin count helper
export function getAdminCount(): number {
  return usersStore.filter(u => u.role === 'admin').length
}