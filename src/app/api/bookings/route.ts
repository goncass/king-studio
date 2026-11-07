import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

    // In production, you would:
    // 1. Save to database (PostgreSQL, MongoDB, etc.)
    // 2. Send confirmation email/SMS
    // 3. Add to calendar (Google Calendar, Cal.com, etc.)
    // 4. Send notification to barber

    console.log('New booking:', {
      ...validatedData,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
    })

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // TODO: Integrate with your preferred booking system:
    // - Cal.com API
    // - Google Calendar API
    // - SendGrid / Resend for emails
    // - Twilio / Vonage for SMS
    // - Database (Prisma, Supabase, etc.)

    return NextResponse.json(
      {
        success: true,
        message: 'Agendamento confirmado com sucesso!',
        bookingId: `KS-${Date.now()}`,
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