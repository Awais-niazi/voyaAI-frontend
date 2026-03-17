'use client'

import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-[#1a6b5c] h-[60px] flex items-center justify-between px-8 sticky top-0 z-50">
      <Link href="/" className="font-serif text-xl font-bold text-white tracking-tight">
        ✈ Voya<span className="text-[#a8dfd0]">.</span>ai
      </Link>
      <nav className="flex items-center gap-2">
        <Link
          href="/"
          className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all"
        >
          Plan a Trip
        </Link>
        <Link
          href="/chat"
          className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all"
        >
          AI Guide
        </Link>
        <Link
          href="/trips"
          className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all"
        >
          My Trips
        </Link>
        {user ? (
          <div className="flex items-center gap-3 ml-2">
            <span className="text-white/60 text-sm">{user.email}</span>
            <button
              onClick={logout}
              className="text-white/75 hover:text-white hover:bg-white/15 px-4 py-1.5 rounded-lg text-sm transition-all"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="bg-white/15 hover:bg-white/25 text-white px-4 py-1.5 rounded-lg text-sm transition-all ml-2"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  )
}