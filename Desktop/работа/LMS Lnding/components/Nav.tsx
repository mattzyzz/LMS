'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-brand-bg/90 backdrop-blur-md border-b border-white/[0.06]'
          : 'bg-transparent',
      )}
      role="banner"
    >
      <nav className="container flex items-center justify-between h-16" aria-label="Основная навигация">
        <a href="/" className="text-xl font-black tracking-wide hover:opacity-90 transition-opacity uppercase" style={{ letterSpacing: '0.08em' }}>
          АЛЬФА<span className="text-brand-red">-</span>КУ
          <svg className="inline -ml-0.5 -mr-0.5 relative -top-px" width="14" height="16" viewBox="0 0 14 16" fill="none" aria-hidden="true">
            <path d="M1 1.5L13 8L1 14.5V1.5Z" fill="#EF3124" />
          </svg>
          С
        </a>

        {/* Desktop CTA */}
        <a
          href="#contact"
          className="hidden md:inline-flex items-center justify-center px-5 py-2.5 bg-brand-red text-white text-sm font-semibold rounded-lg hover:brightness-110 hover:shadow-lg hover:shadow-brand-red/20 transition-all duration-200 min-h-[44px]"
        >
          Получить демо
        </a>

        {/* Mobile burger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-11 h-11 flex items-center justify-center text-white rounded-lg hover:bg-white/5 transition-colors"
          aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 4L16 16M4 16L16 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-brand-bg/98 backdrop-blur-md border-t border-white/[0.06] px-4 py-4"
        >
          <a
            href="#contact"
            className="flex items-center justify-center w-full py-3.5 bg-brand-red text-white font-semibold rounded-xl text-base"
            onClick={() => setMenuOpen(false)}
          >
            Получить демо
          </a>
        </div>
      )}
    </header>
  )
}
