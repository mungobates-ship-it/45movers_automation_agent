import { TaskList } from '@/components/TaskList'

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <TaskList />
      </main>
    </div>
  )
}
