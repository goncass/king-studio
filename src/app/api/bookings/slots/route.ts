// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getBookings, getServiceDuration } from '@/lib/db/bookings'

// Helper function to get all 30-min slots a service occupies
function getOccupiedSlots(startTime: string, durationMinutes: number): string[] {
  const [hours, minutes] = startTime.split(':').map(Number)
  const start = hours * 60 + minutes
  const end = start + durationMinutes
  const slots: string[] = []

  for (let t = start; t < end; t += 30) {
    const h = Math.floor(t / 60).toString().padStart(2, '0')
    const m = (t % 60).toString().padStart(2, '0')
    slots.push(`${h}:${m}`)
  }
  return slots
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceId = searchParams.get('service')
    const barberName = searchParams.get('barber')
    const date = searchParams.get('date')

    if (!serviceId || !barberName || !date) {
      return NextResponse.json(
        { error: 'service, barber e date são obrigatórios' },
        { status: 400 }
      )
    }

    // Get service duration
    const duration = getServiceDuration(serviceId)

    // Fetch existing bookings for this barber and date
    const bookings = await getBookings({
      barberName,
      date,
      status: undefined,
    })

    // Build occupied slots set
    const occupiedSlots = new Set<string>()

    // Add all occupied slots from existing bookings
    bookings.forEach((booking) => {
      const bookingDuration = booking.duration || getServiceDuration(booking.service)
      getOccupiedSlots(booking.time, bookingDuration).forEach((s) => occupiedSlots.add(s))
    })

    // Generate all possible slots (9:00 to 18:30, 30min intervals)
    const allSlots: string[] = []
    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 18 && minute > 0) break
        allSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }

    // Filter available slots - a slot is available only if IT and all subsequent slots for the duration are free
    const availableSlots = allSlots.filter((slot) => {
      const neededSlots = getOccupiedSlots(slot, duration)
      return neededSlots.every((s) => !occupiedSlots.has(s))
    })

    return NextResponse.json({
      availableSlots,
      duration,
      occupiedSlots: Array.from(occupiedSlots),
    })
  } catch (error) {
    console.error('Get available slots error:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar horários disponíveis' },
      { status: 500 }
    )
  }
}