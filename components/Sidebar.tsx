'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { label: 'PDR Tasks', href: '/' },
    { label: 'Overdue Invoices', href: '/invoices' },
    { label: 'WhatsApp Leads', href: '/leads' }
  ]

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 left-6 z-[60] flex flex-col gap-1.5 bg-none border-none cursor-pointer"
        aria-label="Toggle menu"
      >
        <div
          style={{
            width: '24px',
            height: '2px',
            background: 'var(--foreground)',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(45deg) translateY(10px)' : 'rotate(0)'
          }}
        />
        <div
          style={{
            width: '24px',
            height: '2px',
            background: 'var(--foreground)',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            opacity: isOpen ? 0 : 1
          }}
        />
        <div
          style={{
            width: '24px',
            height: '2px',
            background: 'var(--foreground)',
            borderRadius: '1px',
            transition: 'all 0.3s ease',
            transform: isOpen ? 'rotate(-45deg) translateY(-10px)' : 'rotate(0)'
          }}
        />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
          style={{
            backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* Sidebar Panel */}
      <nav
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: '100vh',
          width: '260px',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 50,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '80px',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '8px',
                textDecoration: 'none',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.95rem',
                color: isActive ? 'var(--accent)' : 'var(--foreground)',
                background: isActive ? 'rgba(0,113,227,0.08)' : 'transparent',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
