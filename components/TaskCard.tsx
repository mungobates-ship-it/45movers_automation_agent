import { StatusBadge, PriorityBadge } from './StatusBadge'

interface TaskCardProps {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  owner: string | null
  role: string | null
  timeline: string | null
  est_cost: number | null
  onStatusToggle: (id: string) => void
}

export function TaskCard({
  id,
  title,
  description,
  priority,
  status,
  owner,
  role,
  timeline,
  est_cost,
  onStatusToggle
}: TaskCardProps) {
  const getNextStatus = (current: string) => {
    switch (current) {
      case 'pending':
        return 'in_progress'
      case 'in_progress':
        return 'completed'
      case 'completed':
        return 'pending'
      default:
        return 'pending'
    }
  }

  return (
    <div
      className="group transition-all duration-200"
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '20px',
        cursor: 'default'
      }}
      onMouseEnter={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.boxShadow = 'var(--shadow-md)'
        target.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const target = e.currentTarget as HTMLElement
        target.style.boxShadow = 'var(--shadow-sm)'
        target.style.transform = 'translateY(0)'
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
          {description && (
            <p className="text-sm mt-1" style={{ color: 'var(--secondary)' }}>
              {description}
            </p>
          )}
        </div>
        <PriorityBadge priority={priority} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
        {role && (
          <div style={{ color: 'var(--secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              Role:
            </span>{' '}
            {role}
          </div>
        )}
        {owner && (
          <div style={{ color: 'var(--secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              Owner:
            </span>{' '}
            {owner}
          </div>
        )}
        {timeline && (
          <div style={{ color: 'var(--secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              Timeline:
            </span>{' '}
            {timeline}
          </div>
        )}
        {est_cost ? (
          <div style={{ color: 'var(--secondary)' }}>
            <span className="font-medium" style={{ color: 'var(--foreground)' }}>
              Cost:
            </span>{' '}
            NZD ${est_cost}
          </div>
        ) : null}
      </div>

      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <div onClick={() => onStatusToggle(id)} className="cursor-pointer">
          <StatusBadge status={status} onClick={() => onStatusToggle(id)} />
        </div>
      </div>
    </div>
  )
}
