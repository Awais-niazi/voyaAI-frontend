'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-[#1a6b5c] sticky top-0 z-50">
      <div className="h-[60px] flex items-center justify-between px-4 sm:px-8">
        <Link href="/" className="font-serif text-xl font-bold text-white tracking-tight">
          ✈ Voya<span className="text-[#a8dfd0]">.</span>ai
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-2">
          <Link href="/" className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all">
            Plan a Trip
          </Link>
          <Link href="/chat" className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all">
            AI Guide
          </Link>
          <Link href="/trips" className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all">
            My Trips
          </Link>
          {user ? (
            <div className="flex items-center gap-3 ml-2">
              <span className="text-white/60 text-sm">{user.email}</span>
              <button onClick={logout} className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all">
                Logout
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-white/15 hover:bg-white/25 text-white px-4 py-1.5 rounded-lg text-sm transition-all ml-2">
              Sign in
            </Link>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden text-white p-2 rounded-lg hover:bg-white/15 transition-all"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden bg-[#155c4f] px-4 py-3 flex flex-col gap-1 border-t border-white/10">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white py-2.5 text-sm border-b border-white/10">
            Plan a Trip
          </Link>
          <Link href="/chat" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white py-2.5 text-sm border-b border-white/10">
            AI Guide
          </Link>
          <Link href="/trips" onClick={() => setMenuOpen(false)} className="text-white/80 hover:text-white py-2.5 text-sm border-b border-white/10">
            My Trips
          </Link>
          {user ? (
            <>
              <span className="text-white/50 text-xs py-2">{user.email}</span>
              <button onClick={() => { logout(); setMenuOpen(false) }} className="text-white/80 hover:text-white py-2.5 text-sm text-left">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMenuOpen(false)} className="text-white py-2.5 text-sm font-medium">
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  )
}