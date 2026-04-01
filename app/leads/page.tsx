import { LeadsList } from '@/components/LeadsList'

export default function LeadsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <LeadsList />
      </main>
    </div>
  )
}
