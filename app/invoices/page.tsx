import { InvoiceList } from '@/components/InvoiceList'

export default function InvoicesPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <InvoiceList />
      </main>
    </div>
  )
}
