import { createServerClient, type DbBooking, type BookingFilters, type CreateBookingData } from '@/lib/supabase'
import { services } from '@/lib/data'

// Parse duration string to minutes (e.g., '60 min' → 60, '30-45 min' → 45)
export function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)(?:-(\d+))?\s*min/i)
  if (!match) return 30
  const min = parseInt(match[1])
  const max = match[2] ? parseInt(match[2]) : min
  return max
}

// Get service duration by service ID
export function getServiceDuration(serviceId: string): number {
  const service = services.find(s => s.id === serviceId)
  return service ? parseDuration(service.duration) : 30
}

// Transform DB booking to app format
export function transformBooking(db: DbBooking) {
  return {
    id: db.id,
    service: db.service_id,
    barber: db.barber_name,
    date: db.date,
    time: db.time.substring(0, 5), // HH:MM
    duration: db.duration_minutes,
    name: db.client_name,
    phone: db.client_phone,
    email: db.client_email || '',
    notes: db.notes || '',
    createdAt: db.created_at,
    status: db.status,
  }
}

export async function getBookings(filters: BookingFilters = {}) {
  const supabase = createServerClient()

  let query = supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time', { ascending: true })

  if (filters.barberName) {
    query = query.eq('barber_name', filters.barberName)
  }
  if (filters.date) {
    query = query.eq('date', filters.date)
  }
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.limit) {
    query = query.limit(filters.limit)
  }
  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('getBookings error:', error)
    throw new Error(`Failed to fetch bookings: ${error.message}`)
  }

  return (data || []).map(transformBooking)
}

export async function getBookingById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    console.error('getBookingById error:', error)
    throw new Error(`Failed to fetch booking: ${error.message}`)
  }

  return transformBooking(data)
}

export async function createBooking(data: CreateBookingData): Promise<{ booking: ReturnType<typeof transformBooking>; overlap: boolean }> {
  const supabase = createServerClient()

  // Check for overlap using RPC function
  const { data: overlap, error: overlapError } = await supabase
    .rpc('check_booking_overlap', {
      p_barber_name: data.barber_name,
      p_date: data.date,
      p_time: data.time,
      p_duration_minutes: data.duration_minutes,
    })

  if (overlapError) {
    console.error('Overlap check error:', overlapError)
    // Fallback: manual check
    const existing = await getBookings({
      barberName: data.barber_name,
      date: data.date,
    })
    const hasOverlap = existing.some(b => {
      const existingStart = timeToMinutes(b.time)
      const existingEnd = existingStart + b.duration
      const newStart = timeToMinutes(data.time)
      const newEnd = newStart + data.duration_minutes
      return newStart < existingEnd && newEnd > existingStart
    })
    if (hasOverlap) {
      return { booking: null as any, overlap: true }
    }
  } else if (overlap) {
    return { booking: null as any, overlap: true }
  }

  // Insert booking
  const { data: inserted, error } = await supabase
    .from('bookings')
    .insert({
      id: data.id,
      service_id: data.service_id,
      barber_name: data.barber_name,
      date: data.date,
      time: data.time,
      duration_minutes: data.duration_minutes,
      client_name: data.client_name,
      client_phone: data.client_phone,
      client_email: data.client_email || null,
      notes: data.notes || null,
      status: data.status || 'confirmed',
    })
    .select()
    .single()

  if (error) {
    console.error('createBooking error:', error)
    throw new Error(`Failed to create booking: ${error.message}`)
  }

  return { booking: transformBooking(inserted), overlap: false }
}

export async function updateBookingStatus(id: string, status: DbBooking['status']) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('updateBookingStatus error:', error)
    throw new Error(`Failed to update booking: ${error.message}`)
  }

  return transformBooking(data)
}

export async function deleteBooking(id: string): Promise<boolean> {
  const supabase = createServerClient()

  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('deleteBooking error:', error)
    throw new Error(`Failed to delete booking: ${error.message}`)
  }

  return true
}

export async function getBookingsCount(filters: Pick<BookingFilters, 'barberName' | 'date' | 'status'> = {}) {
  const supabase = createServerClient()

  let query = supabase.from('bookings').select('*', { count: 'exact', head: true })

  if (filters.barberName) query = query.eq('barber_name', filters.barberName)
  if (filters.date) query = query.eq('date', filters.date)
  if (filters.status) query = query.eq('status', filters.status)

  const { count, error } = await query

  if (error) {
    console.error('getBookingsCount error:', error)
    return 0
  }

  return count || 0
}

// Helper
function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}