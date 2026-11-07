import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { services } from '@/lib/data'

const bookingSchema = z.object({
  service: z.string().min(1),
  barber: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  name: z.string().min(2),
  phone: z.string().min(9),
  email: z.string().email().optional().or(z.literal('')),
  notes: z.string().optional(),
})

// In-memory store for demo (in production: database)
const bookingsStore: Array<{
  id: string
  service: string
  barber: string
  date: string
  time: string
  duration: number
  name: string
  phone: string
  email: string
  notes: string
  createdAt: string
  status: string
}> = [
  { id: 'KS-1704067200001', service: 'corte-barba', barber: 'King', date: '2024-12-15', time: '10:00', duration: 60, name: 'João Silva', phone: '915 271 491', email: 'joao@email.com', notes: 'Prefere fade baixo', createdAt: '2024-12-10T10:30:00Z', status: 'confirmed' },
  { id: 'KS-1704067200002', service: 'fade-cut', barber: 'Ricardo', date: '2024-12-15', time: '11:30', duration: 45, name: 'Miguel Santos', phone: '912 345 678', email: '', notes: '', createdAt: '2024-12-11T14:20:00Z', status: 'pending' },
  { id: 'KS-1704067200003', service: 'navalha-quente', barber: 'King', date: '2024-12-14', time: '14:30', duration: 35, name: 'Pedro Costa', phone: '918 765 432', email: 'pedro@email.com', notes: 'Pele sensível', createdAt: '2024-12-12T09:15:00Z', status: 'completed' },
  { id: 'KS-1704067200004', service: 'corte-crianca', barber: 'Miguel', date: '2024-12-16', time: '11:00', duration: 30, name: 'André Ferreira', phone: '913 456 789', email: '', notes: 'Primeiro corte do filho (8 anos)', createdAt: '2024-12-13T16:45:00Z', status: 'confirmed' },
  { id: 'KS-1704067200005', service: 'colocacao-cor', barber: 'King', date: '2024-12-16', time: '15:30', duration: 90, name: 'Rui Martins', phone: '917 890 123', email: 'rui@email.com', notes: 'Cobrir brancos - tom natural', createdAt: '2024-12-13T18:00:00Z', status: 'pending' },
]

// Parse duration string to minutes (e.g., '60 min' → 60, '30-45 min' → 45)
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)(?:-(\d+))?\s*min/i)
  if (!match) return 30
  const min = parseInt(match[1])
  const max = match[2] ? parseInt(match[2]) : min
  return max
}

// Get all 30-min slots that a service occupies starting from a given time
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

// Check if a new booking would overlap with existing bookings for same barber/date
function hasOverlap(newBooking: { barber: string; date: string; time: string; duration: number }): boolean {
  const newSlots = getOccupiedSlots(newBooking.time, newBooking.duration)
  const newSlotSet = new Set(newSlots)

  for (const existing of bookingsStore) {
    if (existing.barber === newBooking.barber && existing.date === newBooking.date && existing.status !== 'cancelled') {
      const existingSlots = getOccupiedSlots(existing.time, existing.duration)
      if (existingSlots.some((s) => newSlotSet.has(s))) {
        return true
      }
    }
  }
  return false
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Get service duration
    const serviceData = services.find((s) => s.id === validatedData.service)
    const duration = serviceData ? parseDuration(serviceData.duration) : 30

    // Check for overlapping bookings
    if (hasOverlap({ barber: validatedData.barber, date: validatedData.date, time: validatedData.time, duration })) {
      return NextResponse.json(
        {
          success: false,
          message: 'Este horário já não está disponível. Escolha outro horário.',
        },
        { status: 409 }
      )
    }

    // Create booking
    const newBooking = {
      id: `KS-${Date.now()}`,
      service: validatedData.service,
      barber: validatedData.barber,
      date: validatedData.date,
      time: validatedData.time,
      duration,
      name: validatedData.name,
      phone: validatedData.phone,
      email: validatedData.email || '',
      notes: validatedData.notes || '',
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    }

    bookingsStore.push(newBooking)

    console.log('New booking:', newBooking)

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return NextResponse.json(
      {
        success: true,
        message: 'Agendamento confirmado com sucesso!',
        bookingId: newBooking.id,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Dados inválidos',
          errors: error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    console.error('Booking error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor. Tente novamente mais tarde.',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API de agendamentos KingsStudio 2020',
    endpoints: {
      POST: '/api/bookings - Criar novo agendamento',
    },
  })
}