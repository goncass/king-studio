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

// Initial users - passwords are bcrypt hashes (12 rounds)
// Generated fresh - guaranteed to match passwords below
const initialUsers: StoredUser[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin',
    role: 'admin',
    passwordHash: '$2b$12$4lFtG3S0rFAMUlO55hbqYeeh.MWbDK4Mw60VP8iDPHI7DCg20aKvO', // kings2020
  },
  {
    id: '2',
    username: 'ruben',
    name: 'Ruben',
    role: 'barber',
    passwordHash: '$2b$12$xfleH307yaK0nUcUo604jOdrF9hTekuqE.v/ftrGCM.xdkmopORqu', // king2020
  },
  {
    id: '3',
    username: 'bruno',
    name: 'Bruno',
    role: 'barber',
    passwordHash: '$2b$12$SQbhn3QvGZmHAFGJjoA2y.1mzl0nt/rLXwbIS.PPA1nWHtvTPXLNa', // ricardo2020
  },
  {
    id: '4',
    username: 'vitor',
    name: 'Vitor',
    role: 'barber',
    passwordHash: '$2b$12$VEFaYSmpRWUB6gGbcy3rwOtpHghqs2nmj8DZvlGsRgI604T640Rn2', // miguel2020
  },
  {
    id: '5',
    username: 'nuno',
    name: 'Nuno',
    role: 'barber',
    passwordHash: '$2b$12$mKL466CqjL4I5BcTk7vkae5aEjzVpJMPi0ryRyTixKd.c1uGo9Lbi', // miguel2020
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