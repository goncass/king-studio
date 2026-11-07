// Force dynamic rendering - this route should not be statically generated
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type DbBooking } from '@/lib/supabase'
import { sendReminderEmail } from '@/lib/email'
import { format, addDays } from 'date-fns'
import { pt } from 'date-fns/locale'

// Verify cron secret (Vercel sets this header)
async function verifyCron(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured')
    return false
  }

  return authHeader === `Bearer ${cronSecret}`
}

export async function GET(request: NextRequest) {
  // Verify cron authorization
  if (!(await verifyCron(request))) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const supabase = createServerClient()

    // Get tomorrow's date
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd')

    // Fetch confirmed/pending bookings for tomorrow
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('date', tomorrowStr)
      .in('status', ['confirmed', 'pending'])

    if (error) {
      console.error('Cron: fetch bookings error:', error)
      return NextResponse.json({ error: 'Erro ao buscar reservas' }, { status: 500 })
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Nenhum lembrete para enviar',
        sent: 0,
      })
    }

    // Send reminder emails
    let sent = 0
    let failed = 0

    for (const booking of bookings as DbBooking[]) {
      try {
        await sendReminderEmail({
          bookingId: booking.id,
          clientName: booking.client_name,
          clientEmail: booking.client_email || '',
          clientPhone: booking.client_phone,
          serviceName: booking.service_id, // Will be resolved in email
          barberName: booking.barber_name,
          date: booking.date,
          time: booking.time.substring(0, 5),
          hoursUntil: 24,
        })
        sent++
      } catch (err) {
        console.error(`Cron: failed to send reminder for ${booking.id}:`, err)
        failed++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Lembretes processados: ${sent} enviados, ${failed} falharam`,
      sent,
      failed,
      date: tomorrowStr,
    })
  } catch (error) {
    console.error('Cron error:', error)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}