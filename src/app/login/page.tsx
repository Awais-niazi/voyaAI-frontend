'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const inputClass = "w-full h-11 border border-black/10 rounded-lg px-3 text-sm text-black outline-none focus:border-[#2d9e82] transition-colors bg-white"

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/')
    } catch {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1a6b5c] mb-2">Welcome back</h1>
          <p className="text-[#5a5750] text-sm sm:text-base">Sign in to your Voya.ai account</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
            )}
            <button type="submit" disabled={loading} className="w-full h-12 bg-[#1a6b5c] hover:bg-[#155c4f] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="text-center text-sm text-[#8f8c85] mt-6">
            No account?{' '}
            <Link href="/register" className="text-[#1a6b5c] font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}