'use client'

import { useEffect, useState } from 'react'
import { TaskCard } from './TaskCard'
import { TaskFilters } from './TaskFilters'

interface Task {
  id: string
  title: string
  description: string | null
  priority: string
  status: string
  owner: string | null
  role: string | null
  timeline: string | null
  est_cost: number | null
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedPriority, setSelectedPriority] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/tasks')
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  // Handle status toggle
  const handleStatusToggle = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const nextStatus = task.status === 'pending' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'pending'

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus })
      })

      if (!res.ok) throw new Error('Failed to update task')
      const updated = await res.json()

      setTasks((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedPriority && task.priority !== selectedPriority) return false
    if (selectedStatus && task.status !== selectedStatus) return false
    if (selectedRole && task.role !== selectedRole) return false
    return true
  })

  const completedCount = filteredTasks.filter((t) => t.status === 'completed').length
  const progressPercent = filteredTasks.length > 0 ? (completedCount / filteredTasks.length) * 100 : 0

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              height: '120px',
              animation: 'pulse 1.5s ease-in-out infinite',
              opacity: 0.6,
              border: '1px solid var(--border)'
            }}
          />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Error: {error}</div>
  }

  return (
    <div>
      {/* Progress Card */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--border)'
        }}
        className="p-6 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-base" style={{ color: 'var(--foreground)' }}>
            Overall Progress
          </h2>
          <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            {completedCount} / {filteredTasks.length} done
          </span>
        </div>
        {/* Progress track */}
        <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
          <div
            className="h-2 rounded-full"
            style={{
              width: `${progressPercent}%`,
              background: 'var(--accent)',
              transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--secondary)' }}>
          {Math.round(progressPercent)}% complete
        </p>
      </div>

      {/* Filters */}
      <TaskFilters
        selectedPriority={selectedPriority}
        selectedStatus={selectedStatus}
        selectedRole={selectedRole}
        onPriorityChange={setSelectedPriority}
        onStatusChange={setSelectedStatus}
        onRoleChange={setSelectedRole}
      />

      {/* Task Count */}
      <p className="text-sm mb-4" style={{ color: 'var(--secondary)' }}>
        {filteredTasks.length === tasks.length
          ? `${tasks.length} tasks`
          : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
      </p>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              {...task}
              onStatusToggle={handleStatusToggle}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No tasks found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  )
}
