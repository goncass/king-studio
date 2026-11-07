// Force dynamic rendering - this route should not be statically generated
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { services } from '@/lib/data'
import { createBooking, getServiceDuration } from '@/lib/db/bookings'
import { sendBookingConfirmationEmail } from '@/lib/email'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = bookingSchema.parse(body)

    // Get service duration
    const duration = getServiceDuration(validatedData.service)

    // Create booking in Supabase
    const bookingId = `KS-${Date.now()}`
    const { booking, overlap } = await createBooking({
      id: bookingId,
      service_id: validatedData.service,
      barber_name: validatedData.barber,
      date: validatedData.date,
      time: validatedData.time,
      duration_minutes: duration,
      client_name: validatedData.name,
      client_phone: validatedData.phone,
      client_email: validatedData.email || undefined,
      notes: validatedData.notes,
      status: 'confirmed',
    })

    if (overlap || !booking) {
      return NextResponse.json(
        {
          success: false,
          message: 'Este horário já não está disponível. Escolha outro horário.',
        },
        { status: 409 }
      )
    }

    console.log('New booking:', booking)

    // Send confirmation email (non-blocking)
    sendBookingConfirmationEmail({
      bookingId: booking.id,
      clientName: booking.name,
      clientEmail: booking.email,
      clientPhone: booking.phone,
      serviceName: services.find(s => s.id === booking.service)?.name || booking.service,
      barberName: booking.barber,
      date: booking.date,
      time: booking.time,
    }).catch(err => console.error('Email send failed:', err))

    return NextResponse.json(
      {
        success: true,
        message: 'Agendamento confirmado com sucesso!',
        bookingId: booking.id,
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