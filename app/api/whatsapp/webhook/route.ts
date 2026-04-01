import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  // WhatsApp webhook verification
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'your_verify_token'

  if (mode === 'subscribe' && token === verifyToken) {
    return NextResponse.json(challenge)
  }

  return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract message data from WhatsApp webhook
    const entry = body.entry[0]
    const changes = entry.changes[0]
    const value = changes.value

    // Check for incoming messages
    if (value.messages) {
      const message = value.messages[0]
      const senderPhone = message.from
      const messageText = message.text?.body || ''
      const messageId = message.id

      // Find the lead by phone number
      const { data: leads, error: findError } = await supabase
        .from('leads')
        .select('id, first_reply_at, created_at')
        .eq('phone', senderPhone)
        .order('created_at', { ascending: false })
        .limit(1)

      if (findError || !leads || leads.length === 0) {
        console.log(`No lead found for phone: ${senderPhone}`)
        return NextResponse.json({ success: true })
      }

      const lead = leads[0]

      // Log the received message
      await supabase.from('whatsapp_messages').insert([
        {
          lead_id: lead.id,
          direction: 'received',
          message_text: messageText,
          message_id: messageId
        }
      ])

      // Update lead with first reply time if not set
      if (!lead.first_reply_at) {
        const sentAt = new Date(lead.created_at)
        const replyAt = new Date()
        const minutesElapsed = (replyAt.getTime() - sentAt.getTime()) / (1000 * 60)

        // Calculate lead quality based on reply time
        let leadQuality = 'warm'
        if (minutesElapsed <= 20) {
          leadQuality = 'hot'
        }

        // Check if message mentions booking keywords
        const bookingKeywords = ['book', 'booking', 'confirm', 'schedule', 'date', 'time']
        const hasBookingRequest = bookingKeywords.some((keyword) =>
          messageText.toLowerCase().includes(keyword)
        )

        await supabase
          .from('leads')
          .update({
            first_reply_at: replyAt.toISOString(),
            lead_quality: leadQuality,
            booking_requested: hasBookingRequest
          })
          .eq('id', lead.id)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
