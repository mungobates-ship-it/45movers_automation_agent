import { NextResponse, NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import invoicesData from '@/lib/invoices-data.json'

export async function GET() {
  try {
    return NextResponse.json(invoicesData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { invoice_number } = body

    if (!invoice_number) {
      return NextResponse.json(
        { error: 'Missing invoice_number' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('paid_invoices')
      .insert([{ invoice_number }])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to mark invoice as paid' },
      { status: 500 }
    )
  }
}
