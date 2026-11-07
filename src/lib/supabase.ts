import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Server-side client (uses service_role key for admin operations)
export function createServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Client-side client (uses anon key for public operations)
let browserClient: SupabaseClient | null = null

export function createBrowserClient(): SupabaseClient {
  if (browserClient) return browserClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!url || !anonKey) {
    throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  browserClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })

  return browserClient
}

// Types matching our schema
export interface DbUser {
  id: string
  username: string
  name: string
  role: 'admin' | 'barber'
  password_hash: string
  created_at: string
  updated_at: string
}

export interface DbBooking {
  id: string
  service_id: string
  barber_name: string
  date: string // YYYY-MM-DD
  time: string // HH:MM:SS
  duration_minutes: number
  client_name: string
  client_phone: string
  client_email: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface BookingFilters {
  barberName?: string
  date?: string
  status?: string
  limit?: number
  offset?: number
}

export interface CreateBookingData {
  id: string
  service_id: string
  barber_name: string
  date: string
  time: string
  duration_minutes: number
  client_name: string
  client_phone: string
  client_email?: string
  notes?: string
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}