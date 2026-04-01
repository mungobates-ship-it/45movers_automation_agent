'use client'

import { useEffect, useState } from 'react'

interface Invoice {
  invoice_number: string
  job_id: string
  name: string
  email: string
  phone: string
  amount: number
  status: string
  invoice_date: string
  due_date: string
}

interface PaidInvoice {
  invoice_number: string
  paid_at: string
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'amount' | 'oldest' | 'recent'>('amount')
  const [paidNumbers, setPaidNumbers] = useState<Set<string>>(new Set())
  const [showPaid, setShowPaid] = useState(false)
  const [paidDetails, setPaidDetails] = useState<Map<string, PaidInvoice>>(new Map())

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invoicesRes, paidRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/invoices/paid')
        ])

        const invoicesData = await invoicesRes.json()
        const paidData: PaidInvoice[] = await paidRes.json()

        setInvoices(invoicesData)

        const paidSet = new Set(paidData.map((p) => p.invoice_number))
        setPaidNumbers(paidSet)

        const paidMap = new Map(paidData.map((p) => [p.invoice_number, p]))
        setPaidDetails(paidMap)

        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch invoices:', err)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const today = new Date('2026-03-31')

  // Filter out paid invoices from active view
  const activeInvoices = invoices.filter((inv) => !paidNumbers.has(inv.invoice_number))
  const overdueInvoices = activeInvoices.filter((inv) => inv.status === 'Overdue')
  const partiallyPaidInvoices = activeInvoices.filter((inv) => inv.status === 'Partially Paid')
  const openInvoices = activeInvoices.filter((inv) => inv.status === 'Open')

  // Get paid invoices
  const paidInvoices = invoices.filter((inv) => paidNumbers.has(inv.invoice_number))

  const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0)

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const diff = today.getTime() - due.getTime()
    return Math.floor(diff / (1000 * 60 * 60 * 24))
  }

  const handleMarkPaid = async (invoiceNumber: string) => {
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice_number: invoiceNumber })
      })

      if (res.ok) {
        setPaidNumbers((prev) => new Set([...prev, invoiceNumber]))
      }
    } catch (err) {
      console.error('Failed to mark as paid:', err)
    }
  }

  const sortedInvoices = [...overdueInvoices].sort((a, b) => {
    if (sortBy === 'amount') {
      return b.amount - a.amount
    } else if (sortBy === 'oldest') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    } else {
      return new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    }
  })

  const groupedByTimeline = {
    under7: sortedInvoices.filter((inv) => getDaysOverdue(inv.due_date) <= 7),
    _8to21: sortedInvoices.filter((inv) => {
      const days = getDaysOverdue(inv.due_date)
      return days > 7 && days <= 21
    }),
    over21: sortedInvoices.filter((inv) => getDaysOverdue(inv.due_date) > 21)
  }

  if (loading) {
    return <div className="text-center py-12">Loading invoices...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header with Total Overdue */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
            Overdue Invoices
          </h2>
          <div className="flex gap-3">
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'rgba(255,59,48,0.1)',
                color: '#ff3b30'
              }}
            >
              Overdue: {overdueInvoices.length}
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'rgba(255,159,64,0.1)',
                color: '#ff9500'
              }}
            >
              Partially Paid: {partiallyPaidInvoices.length}
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: 'rgba(76,175,80,0.1)',
                color: '#4caf50'
              }}
            >
              Open: {openInvoices.length}
            </div>
            {paidInvoices.length > 0 && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  background: 'rgba(52,199,89,0.1)',
                  color: '#34c759'
                }}
              >
                ✓ Paid: {paidInvoices.length}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            textAlign: 'right',
            padding: '16px',
            background: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <p className="text-xs" style={{ color: 'var(--secondary)' }}>
            Total Overdue
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: '#ff3b30' }}
          >
            NZD ${totalOverdue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Sort Filter */}
      <div className="flex gap-2">
        {[
          { value: 'amount' as const, label: 'Largest Amount' },
          { value: 'oldest' as const, label: 'Oldest Overdue' },
          { value: 'recent' as const, label: 'Most Recent Overdue' }
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: sortBy === option.value ? 'var(--accent)' : 'var(--surface)',
              color: sortBy === option.value ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Timeline Sections */}
      {groupedByTimeline.under7.length > 0 && (
        <TimelineSection
          title="🔴 Under 7 Days Overdue"
          invoices={groupedByTimeline.under7}
          getDaysOverdue={getDaysOverdue}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {groupedByTimeline._8to21.length > 0 && (
        <TimelineSection
          title="🟡 8–21 Days Overdue"
          invoices={groupedByTimeline._8to21}
          getDaysOverdue={getDaysOverdue}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {groupedByTimeline.over21.length > 0 && (
        <TimelineSection
          title="⚫ 21+ Days Overdue"
          invoices={groupedByTimeline.over21}
          getDaysOverdue={getDaysOverdue}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {sortedInvoices.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--secondary)' }}>
          No overdue invoices
        </div>
      )}

      {/* Paid Section */}
      {paidInvoices.length > 0 && (
        <div className="mt-8 border-t border-gray-200" style={{ borderTopColor: 'var(--border)', paddingTop: '24px' }}>
          <button
            onClick={() => setShowPaid(!showPaid)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#34c759'
            }}
          >
            ✓ Paid ({paidInvoices.length}) {showPaid ? '▼' : '▶'}
          </button>

          {showPaid && (
            <div className="mt-4 space-y-2">
              <div
                style={{
                  padding: '16px',
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                  marginBottom: '16px'
                }}
              >
                <p className="text-xs" style={{ color: 'var(--secondary)' }}>
                  Total Paid
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: '#34c759' }}>
                  NZD ${totalPaid.toFixed(2)}
                </p>
              </div>

              {paidInvoices.map((invoice) => {
                const paidRecord = paidDetails.get(invoice.invoice_number)
                const paidDate = paidRecord ? new Date(paidRecord.paid_at).toLocaleDateString('en-NZ') : '—'

                return (
                  <div
                    key={invoice.invoice_number}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr 1fr',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'rgba(52,199,89,0.08)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid rgba(52,199,89,0.2)',
                      alignItems: 'center',
                      fontSize: '0.875rem'
                    }}
                  >
                    <div style={{ color: 'var(--foreground)', fontWeight: '500' }}>
                      {invoice.name}
                    </div>
                    <div style={{ color: 'var(--secondary)' }}>
                      {invoice.invoice_number}
                    </div>
                    <div style={{ color: '#34c759', fontWeight: '600' }}>
                      NZD ${invoice.amount.toFixed(2)}
                    </div>
                    <div style={{ color: 'var(--secondary)', textAlign: 'right' }}>
                      Paid: {paidDate}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface TimelineSectionProps {
  title: string
  invoices: Invoice[]
  getDaysOverdue: (dueDate: string) => number
  onMarkPaid: (invoiceNumber: string) => void
}

function TimelineSection({ title, invoices, getDaysOverdue, onMarkPaid }: TimelineSectionProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>

      <div className="space-y-2">
        {invoices.map((invoice) => {
          const daysOverdue = getDaysOverdue(invoice.due_date)
          return (
            <div
              key={invoice.invoice_number}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
                gap: '12px',
                padding: '12px 16px',
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ color: 'var(--foreground)', fontWeight: '500' }}>
                {invoice.name}
              </div>
              <div style={{ color: 'var(--secondary)' }}>
                {invoice.invoice_number}
              </div>
              <div style={{ color: 'var(--accent)', fontWeight: '600' }}>
                NZD ${invoice.amount.toFixed(2)}
              </div>
              <div style={{ color: 'var(--secondary)' }}>
                {new Date(invoice.due_date).toLocaleDateString('en-NZ')}
              </div>
              <div
                style={{
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,59,48,0.15)',
                  color: '#ff3b30',
                  fontWeight: '600',
                  textAlign: 'center'
                }}
              >
                {daysOverdue}d
              </div>
              <button
                onClick={() => onMarkPaid(invoice.invoice_number)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: '#34c759',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#30b450'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#34c759'
                }}
              >
                ✓ Paid
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
