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

    // Extract pickup suburb (everything before city/postcode)
    // Format: "Street, Suburb, City PostCode, Country" -> extract "Street, Suburb"
    const pickupParts = pickup_address?.split(',') || []
    const pickupSuburb = pickupParts.slice(0, 2).join(',').trim() // Take first two parts

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

    // Format move_date for template (YYYY-MM-DD -> readable format)
    const moveDate = move_date ? new Date(move_date).toLocaleDateString('en-NZ') : ''

    // Send via WhatsApp Template API
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const whatsappResponse = await fetch(`https://graph.instagram.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone.replace(/\s+/g, ''),
        type: 'template',
        template: {
          name: '45movers_first_touch_wa',
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: first_name },
                { type: 'text', text: pickupSuburb },
                { type: 'text', text: moveDate }
              ]
            }
          ]
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
        phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID,
        templateName: '45movers_first_touch_wa'
      })
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: whatsappData, status: whatsappResponse.status },
        { status: whatsappResponse.status }
      )
    }

    // Log the sent message
    const messageId = whatsappData.messages?.[0]?.id || 'unknown'

    await supabase.from('whatsapp_messages').insert([
      {
        lead_id: lead.id,
        direction: 'sent',
        message_text: `Template: 45movers_first_touch_wa - ${first_name}, ${pickupSuburb}, ${moveDate}`,
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
