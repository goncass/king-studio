import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'
import {
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingsCount,
} from '@/lib/db/bookings'

const statusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
})

// Verify admin access
async function verifyAdmin(request: NextRequest): Promise<{ authorized: boolean }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('kingsstudio_auth')?.value

  if (!token) return { authorized: false }

  try {
    const payload = await verifyToken(token)
    return { authorized: payload?.role === 'admin' }
  } catch {
    return { authorized: false }
  }
}

// Verify barber or admin access (barber sees own, admin sees all)
async function verifyBarberOrAdmin(request: NextRequest): Promise<{ authorized: boolean; isAdmin: boolean; barberName?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get('kingsstudio_auth')?.value

  if (!token) return { authorized: false, isAdmin: false }

  try {
    const payload = await verifyToken(token)
    if (!payload) return { authorized: false, isAdmin: false }
    return {
      authorized: true,
      isAdmin: payload.role === 'admin',
      barberName: payload.role === 'barber' ? payload.name : undefined,
    }
  } catch {
    return { authorized: false, isAdmin: false }
  }
}

export async function GET(request: NextRequest) {
  const { authorized, isAdmin, barberName } = await verifyBarberOrAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || undefined
    const status = searchParams.get('status') || undefined
    const barber = searchParams.get('barber') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined

    // Barbers can only see their own bookings
    const filterBarber = isAdmin ? barber : barberName

    const [bookings, total] = await Promise.all([
      getBookings({
        barberName: filterBarber,
        date,
        status,
        limit,
        offset,
      }),
      getBookingsCount({
        barberName: filterBarber,
        date,
        status,
      }),
    ])

    return NextResponse.json({ bookings, total })
  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const { authorized, isAdmin } = await verifyBarberOrAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'ID e status são obrigatórios' }, { status: 400 })
    }

    // Verify booking exists and user has access
    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 })
    }

    // Barbers can only update their own bookings
    if (!isAdmin) {
      const { authorized: auth2, barberName } = await verifyBarberOrAdmin(request)
      if (!auth2 || booking.barber !== barberName) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
      }
    }

    const updated = await updateBookingStatus(id, status)
    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('Update booking error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const { authorized, isAdmin } = await verifyBarberOrAdmin(request)
  if (!authorized) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
    }

    // Verify booking exists and user has access
    const booking = await getBookingById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Reserva não encontrada' }, { status: 404 })
    }

    // Only admin can delete bookings
    if (!isAdmin) {
      return NextResponse.json({ error: 'Apenas administradores podem eliminar reservas' }, { status: 403 })
    }

    await deleteBooking(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete booking error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}