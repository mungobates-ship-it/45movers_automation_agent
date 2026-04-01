'use client'

import { useEffect, useState } from 'react'

interface Lead {
  id: string
  first_name: string
  last_name?: string
  email?: string
  phone: string
  move_date?: string
  pickup_address?: string
  delivery_address?: string
  move_size?: string
  lead_quality: 'hot' | 'warm' | 'cold' | 'pending'
  message_sent_at: string
  first_reply_at?: string
  booking_requested: boolean
  created_at: string
}

export function LeadsList() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cold'>('all')

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('/api/leads')
        const data = await res.json()
        setLeads(data)
      } catch (err) {
        console.error('Failed to fetch leads:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [])

  const filteredLeads = leads.filter((lead) => filter === 'all' || lead.lead_quality === filter)

  const leadCounts = {
    hot: leads.filter((l) => l.lead_quality === 'hot').length,
    warm: leads.filter((l) => l.lead_quality === 'warm').length,
    cold: leads.filter((l) => l.lead_quality === 'cold').length,
    pending: leads.filter((l) => l.lead_quality === 'pending').length
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'hot':
        return { bg: 'rgba(255,59,48,0.1)', text: '#ff3b30', label: '🔴 Hot' }
      case 'warm':
        return { bg: 'rgba(255,159,64,0.1)', text: '#ff9500', label: '🟡 Warm' }
      case 'cold':
        return { bg: 'rgba(150,150,150,0.1)', text: '#8e8e93', label: '⚫ Cold' }
      default:
        return { bg: 'rgba(200,200,200,0.1)', text: '#a0a0a0', label: '⚪ Pending' }
    }
  }

  const getReplyTime = (sentAt: string, repliedAt?: string) => {
    if (!repliedAt) return 'No reply'
    const sent = new Date(sentAt)
    const replied = new Date(repliedAt)
    const minutes = Math.floor((replied.getTime() - sent.getTime()) / (1000 * 60))
    return `${minutes}m`
  }

  if (loading) {
    return <div className="text-center py-12">Loading leads...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
          WhatsApp Leads
        </h2>
        <div className="flex gap-3">
          {[
            { key: 'hot', label: 'Hot', count: leadCounts.hot, color: '#ff3b30' },
            { key: 'warm', label: 'Warm', count: leadCounts.warm, color: '#ff9500' },
            { key: 'cold', label: 'Cold', count: leadCounts.cold, color: '#8e8e93' },
            { key: 'pending', label: 'Pending', count: leadCounts.pending, color: '#a0a0a0' }
          ].map((item) => (
            <div
              key={item.key}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '500',
                background: `rgba(${item.color}, 0.1)`,
                color: item.color
              }}
            >
              {item.label}: {item.count}
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'hot', 'warm', 'cold'].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option as any)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: filter === option ? 'var(--accent)' : 'var(--surface)',
              color: filter === option ? '#fff' : 'var(--foreground)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              textTransform: 'capitalize'
            }}
          >
            {option === 'all' ? 'All Leads' : option}
          </button>
        ))}
      </div>

      {/* Leads List */}
      <div className="space-y-2">
        {filteredLeads.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--secondary)' }}>
            No leads
          </div>
        ) : (
          filteredLeads.map((lead) => {
            const quality = getQualityColor(lead.lead_quality)
            return (
              <div
                key={lead.id}
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
                  {lead.first_name} {lead.last_name || ''}
                </div>
                <div style={{ color: 'var(--secondary)' }}>{lead.phone}</div>
                <div style={{ color: 'var(--secondary)' }}>
                  {lead.move_date ? new Date(lead.move_date).toLocaleDateString('en-NZ') : '—'}
                </div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.8rem' }}>
                  {lead.move_size || '—'}
                </div>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: quality.bg,
                    color: quality.text,
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  {quality.label}
                </div>
                <div style={{ color: 'var(--secondary)', textAlign: 'right', fontSize: '0.8rem' }}>
                  {getReplyTime(lead.message_sent_at, lead.first_reply_at)}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
