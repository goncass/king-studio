import { Resend } from 'resend'
import { services } from '@/lib/data'

// Lazy initialization - only create client when actually sending emails
function getResendClient(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY not configured')
  }
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'KingsStudio <agendamentos@kingsstudio.pt>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@kingsstudio.pt'

interface BookingEmailData {
  bookingId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  serviceName: string // Can be service ID or name
  barberName: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

interface ReminderEmailData extends BookingEmailData {
  hoursUntil: number
}

function getServiceName(serviceIdOrName: string): string {
  const service = services.find(s => s.id === serviceIdOrName || s.name === serviceIdOrName)
  return service?.name || serviceIdOrName
}

function formatDatePt(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('pt-PT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTimePt(timeStr: string): string {
  return timeStr.substring(0, 5)
}

// ============================================
// BOOKING CONFIRMATION EMAIL
// ============================================
export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email')
    return
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
    <h1 style="color: #fbbf24; font-family: Georgia, serif; font-size: 28px; margin: 0 0 8px;">KingsStudio 2020</h1>
    <p style="color: #9ca3af; margin: 0; font-size: 14px;">Barbearia Premium • Queluz</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">
    <h2 style="color: #1f2937; font-size: 22px; margin: 0 0 24px;">✅ Agendamento Confirmado!</h2>

    <p style="font-size: 16px; margin-bottom: 24px;">Olá <strong>${data.clientName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 24px;">O seu agendamento foi confirmado com sucesso. Aqui estão os detalhes:</p>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600; width: 120px;">Serviço:</td>
          <td style="padding: 8px 0; color: #1f2937;">${getServiceName(data.serviceName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Barbeiro:</td>
          <td style="padding: 8px 0; color: #1f2937;">${data.barberName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Data:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formatDatePt(data.date)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Hora:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formatTimePt(data.time)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Referência:</td>
          <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${data.bookingId}</td>
        </tr>
      </table>
    </div>

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px; color: #4b5563;">
      <p style="margin: 0 0 8px;"><strong>📍 Morada:</strong> R. 5 de Outubro 4, 2745-039 Queluz</p>
      <p style="margin: 0 0 8px;"><strong>📞 Telefone:</strong> 915 271 491</p>
      <p style="margin: 0;"><strong>⏰ Chegue 5 min antes</strong> do seu horário para melhor atendimento.</p>
    </div>

    <p style="font-size: 14px; color: #6b7280; margin-bottom: 16px;">
      Precisa de alterar ou cancelar? Responda a este email ou ligue para <a href="tel:+351915271491" style="color: #fbbf24;">915 271 491</a>.
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
      KingsStudio 2020 • R. 5 de Outubro 4, Queluz • <a href="https://maps.google.com" style="color: #fbbf24;">Ver no mapa</a>
    </p>
  </div>
</body>
</html>
  `

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail || ADMIN_EMAIL, // fallback to admin if no client email
    subject: `✅ Agendamento confirmado - ${getServiceName(data.serviceName)} com ${data.barberName} em ${formatDatePt(data.date)}`,
    html,
  })

  // Also send to barber/admin
  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `📅 Novo agendamento: ${data.clientName} - ${getServiceName(data.serviceName)} com ${data.barberName}`,
    html: html.replace('Olá <strong>${data.clientName}</strong>,', 'Novo agendamento recebido:'),
  })
}

// ============================================
// 24H REMINDER EMAIL
// ============================================
export async function sendReminderEmail(data: ReminderEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping reminder email')
    return
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
    <h1 style="color: #1f2937; font-family: Georgia, serif; font-size: 28px; margin: 0 0 8px;">⏰ Lembrete</h1>
    <p style="color: #1f2937; margin: 0; font-size: 14px;">O seu agendamento é amanhã!</p>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">
    <p style="font-size: 16px; margin-bottom: 24px;">Olá <strong>${data.clientName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 24px;">Este é um lembrete amigável de que o seu agendamento é <strong>amanhã</strong>:</p>

    <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600; width: 120px;">Serviço:</td>
          <td style="padding: 8px 0; color: #1f2937;">${getServiceName(data.serviceName)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Barbeiro:</td>
          <td style="padding: 8px 0; color: #1f2937;">${data.barberName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Data:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formatDatePt(data.date)} (Amanhã)</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Hora:</td>
          <td style="padding: 8px 0; color: #1f2937;">${formatTimePt(data.time)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #92400e; font-weight: 600;">Referência:</td>
          <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${data.bookingId}</td>
        </tr>
      </table>
    </div>

    <div style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 14px; color: #991b1b;">
      <p style="margin: 0;"><strong>⚠️ Importante:</strong> Se precisar de cancelar ou reagendar, por favor avise com pelo menos 2 horas de antecedência. Ligue para <a href="tel:+351915271491" style="color: #fbbf24;">915 271 491</a>.</p>
    </div>

    <p style="font-size: 14px; color: #6b7280;">
      Aguardamos por si na KingsStudio 2020! 💈
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
      KingsStudio 2020 • R. 5 de Outubro 4, Queluz
    </p>
  </div>
</body>
</html>
  `

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail || ADMIN_EMAIL,
    subject: `⏰ Lembrete: O seu agendamento é amanhã às ${formatTimePt(data.time)}`,
    html,
  })
}

// ============================================
// STATUS CHANGE EMAIL
// ============================================
export async function sendStatusChangeEmail(
  data: BookingEmailData,
  newStatus: 'confirmed' | 'completed' | 'cancelled'
): Promise<void> {
  if (!process.env.RESEND_API_KEY) return

  const statusLabels = {
    confirmed: { label: 'Confirmado', color: '#3b82f6', bg: '#eff6ff' },
    completed: { label: 'Concluído', color: '#22c55e', bg: '#f0fdf4' },
    cancelled: { label: 'Cancelado', color: '#ef4444', bg: '#fef2f2' },
  }

  const status = statusLabels[newStatus]

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, ${status.color} 0%, ${status.color}dd 100%); border-radius: 16px 16px 0 0; padding: 32px; text-align: center;">
    <h1 style="color: white; font-family: Georgia, serif; font-size: 28px; margin: 0 0 8px;">Agendamento ${status.label}</h1>
  </div>

  <div style="background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 16px 16px; padding: 32px;">
    <p style="font-size: 16px; margin-bottom: 24px;">Olá <strong>${data.clientName}</strong>,</p>

    <p style="font-size: 16px; margin-bottom: 24px;">O estado do seu agendamento foi atualizado:</p>

    <div style="background: ${status.bg}; border: 1px solid ${status.color}; border-radius: 12px; padding: 20px; margin-bottom: 24px; text-align: center;">
      <span style="background: ${status.color}; color: white; padding: 8px 24px; border-radius: 9999px; font-weight: 600; font-size: 16px;">${status.label}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 120px;">Serviço:</td>
        <td style="padding: 8px 0; color: #1f2937;">${getServiceName(data.serviceName)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Barbeiro:</td>
        <td style="padding: 8px 0; color: #1f2937;">${data.barberName}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Data:</td>
        <td style="padding: 8px 0; color: #1f2937;">${formatDatePt(data.date)}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Hora:</td>
        <td style="padding: 8px 0; color: #1f2937;">${formatTimePt(data.time)}</td>
      </tr>
    </table>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">

    <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
      KingsStudio 2020 • R. 5 de Outubro 4, Queluz
    </p>
  </div>
</body>
</html>
  `

  await getResendClient().emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail || ADMIN_EMAIL,
    subject: `📋 Agendamento ${status.label} - ${getServiceName(data.serviceName)} com ${data.barberName}`,
    html,
  })
}