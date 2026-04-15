'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { getDisplayErrorMessage } from '@/lib/api'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, fullName)
      router.push('/')
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1a6b5c] mb-2">Create account</h1>
          <p className="text-[#5a5750] text-sm sm:text-base">Start planning your perfect trips</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-11 border border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] transition-colors"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 border border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] transition-colors"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 border border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] transition-colors"
                placeholder="Min 8 characters with a number"
                required
                minLength={8}
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1a6b5c] hover:bg-[#155c4f] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="text-center text-sm text-[#8f8c85] mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-[#1a6b5c] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
