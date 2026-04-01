interface StatusBadgeProps {
  status: string
  onClick?: () => void
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const getStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          background: 'rgba(142, 142, 147, 0.15)',
          color: '#636366',
          border: '1px solid rgba(142, 142, 147, 0.3)'
        }
      case 'in_progress':
        return {
          background: 'rgba(0, 113, 227, 0.1)',
          color: 'var(--accent)',
          border: '1px solid rgba(0, 113, 227, 0.2)'
        }
      case 'completed':
        return {
          background: 'rgba(52, 199, 89, 0.12)',
          color: '#248a3d',
          border: '1px solid rgba(52, 199, 89, 0.25)'
        }
      default:
        return {
          background: 'rgba(142, 142, 147, 0.15)',
          color: '#636366',
          border: '1px solid rgba(142, 142, 147, 0.3)'
        }
    }
  }

  const label = status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)
  const styles = getStyles(status)

  return (
    <button
      onClick={onClick}
      style={{
        ...styles,
        borderRadius: 'var(--radius-md)',
        padding: '6px 12px',
        fontSize: '0.875rem',
        fontWeight: '500',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      {label}
    </button>
  )
}

interface PriorityBadgeProps {
  priority: string
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return '#ff3b30' // Apple red
      case 'high':
        return '#ff9500' // Apple orange
      case 'medium':
        return '#ffcc00' // Apple yellow
      case 'low':
        return '#8e8e93' // Apple gray
      default:
        return '#8e8e93'
    }
  }

  const color = getColor(priority)
  const label = priority.charAt(0).toUpperCase() + priority.slice(1)

  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: color
      }}
    >
      <span style={{ fontSize: '1.2em' }}>●</span> {label}
    </span>
  )
}
