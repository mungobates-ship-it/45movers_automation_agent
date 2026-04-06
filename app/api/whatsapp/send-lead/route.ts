import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract form data from Zapier
    const {
      first_name,
      last_name,
      email,
      phone,
      move_date,
      pickup_address,
      delivery_address,
      move_size,
      additional_notes,
      referred_by,
      winz_quote,
      restricted_access
    } = body

    // Validate required fields
    if (!first_name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: first_name, phone' },
        { status: 400 }
      )
    }

    // Create lead record in Supabase
    const { data: leadData, error: leadError } = await supabase
      .from('leads')
      .insert([
        {
          first_name,
          last_name,
          email,
          phone,
          move_date,
          pickup_address,
          delivery_address,
          move_size,
          additional_notes,
          referred_by,
          winz_quote: winz_quote === 'yes',
          restricted_access: restricted_access === 'yes',
          lead_quality: 'pending',
          message_sent_at: new Date().toISOString()
        }
      ])
      .select()

    if (leadError) {
      return NextResponse.json({ error: leadError.message }, { status: 500 })
    }

    const lead = leadData[0]

    // Format WhatsApp message
    const message = `Hi ${first_name}, Mungo here from 45 Movers. Thanks for submitting an online form. You should soon get an email from us asking to complete your inventory. Please fill this in at your earliest convenience. In the meantime, can I ask if this is the first time using a moving company?`

    // Send via WhatsApp API
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const whatsappResponse = await fetch(`https://graph.instagram.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/\s+/g, ''), // Remove spaces from phone
        type: 'text',
        text: {
          body: message
        }
      })
    })

    const whatsappData = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', {
        status: whatsappResponse.status,
        statusText: whatsappResponse.statusText,
        data: whatsappData,
        token: process.env.WHATSAPP_ACCESS_TOKEN ? 'SET' : 'MISSING',
        phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID
      })
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: whatsappData, status: whatsappResponse.status },
        { status: whatsappResponse.status }
      )
    }

    // Log the sent message
    const messageId = whatsappData.messages[0]?.id || 'unknown'

    await supabase.from('whatsapp_messages').insert([
      {
        lead_id: lead.id,
        direction: 'sent',
        message_text: message,
        message_id: messageId
      }
    ])

    return NextResponse.json({
      success: true,
      lead_id: lead.id,
      message_id: messageId,
      customer_name: first_name
    })
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json(
      { error: 'Failed to process lead' },
      { status: 500 }
    )
  }
}
