'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import axios from 'axios'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(() => token ? 'loading' : 'error')

  useEffect(() => {
    if (!token) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    let redirectTimer: ReturnType<typeof setTimeout> | undefined

    axios.get(`${apiUrl}/api/v1/auth/verify?token=${token}`)
      .then(() => {
        setStatus('success')
        redirectTimer = setTimeout(() => router.push('/'), 3000)
      })
      .catch(() => setStatus('error'))

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer)
    }
  }, [token, router])

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-black/5 p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="w-10 h-10 border-2 border-[#1a6b5c]/20 border-t-[#1a6b5c] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#5a5750]">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-4xl mb-4">✅</div>
            <h2 className="font-serif text-xl font-semibold text-[#1a6b5c] mb-2">Email verified!</h2>
            <p className="text-[#5a5750] text-sm">Redirecting you to the app...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-4xl mb-4">❌</div>
            <h2 className="font-serif text-xl font-semibold text-red-600 mb-2">Verification failed</h2>
            <p className="text-[#5a5750] text-sm mb-4">The link may have expired or already been used.</p>
            <button onClick={() => router.push('/register')} className="text-[#1a6b5c] font-medium hover:underline text-sm">
              Register again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7] flex items-center justify-center"><div className="w-10 h-10 border-2 border-[#1a6b5c]/20 border-t-[#1a6b5c] rounded-full animate-spin" /></div>}>
      <VerifyContent />
    </Suspense>
  )
}
