interface TaskFiltersProps {
  selectedPriority: string | null
  selectedStatus: string | null
  selectedRole: string | null
  onPriorityChange: (priority: string | null) => void
  onStatusChange: (status: string | null) => void
  onRoleChange: (role: string | null) => void
}

const priorities = ['critical', 'high', 'medium', 'low']
const statuses = ['pending', 'in_progress', 'completed']
const roles = [
  'Owner',
  'Finance Agent',
  'Operations',
  'HR',
  'Crew Lead',
  'Sales',
  'Customer Service'
]

export function TaskFilters({
  selectedPriority,
  selectedStatus,
  selectedRole,
  onPriorityChange,
  onStatusChange,
  onRoleChange
}: TaskFiltersProps) {
  const selectStyle = {
    appearance: 'none',
    width: '100%',
    padding: '8px 12px',
    paddingRight: '32px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--foreground)',
    fontSize: '0.875rem',
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6e73' stroke-width='2'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    backgroundSize: '20px'
  }

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        padding: '16px'
      }}
      className="mb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Priority
          </label>
          <select
            value={selectedPriority || ''}
            onChange={(e) => onPriorityChange(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">All Priorities</option>
            {priorities.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Status
          </label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => onStatusChange(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Role Filter */}
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>
            Role/Owner
          </label>
          <select
            value={selectedRole || ''}
            onChange={(e) => onRoleChange(e.target.value || null)}
            style={selectStyle}
          >
            <option value="">All Roles</option>
            {roles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
