'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { tripsApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import type { Trip } from '@/types'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    tripsApi.list()
      .then((res) => setTrips(res.items))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [router])

  return (
    <div className="max-w-4xl mx-auto px-8 py-12">
      <h1 className="font-serif text-3xl font-semibold text-[#1c1b19] mb-8">My trips</h1>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#1a6b5c]/20 border-t-[#1a6b5c] rounded-full animate-spin" />
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#8f8c85] mb-4">No trips yet</p>
          <button
            onClick={() => router.push('/')}
            className="bg-[#1a6b5c] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#155c4f] transition-colors"
          >
            Plan your first trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => trip.status === 'generated' ? router.push(`/results?id=${trip.id}`) : null}
              className="bg-white rounded-2xl border border-black/5 p-6 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-serif text-lg font-semibold text-[#1c1b19]">{trip.destination}</h2>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  trip.status === 'generated'
                    ? 'bg-[#e8f5f1] text-[#1a6b5c]'
                    : 'bg-[#f4f2ee] text-[#8f8c85]'
                }`}>
                  {trip.status}
                </span>
              </div>
              {trip.tagline && (
                <p className="text-sm text-[#5a5750] mb-3 leading-relaxed">{trip.tagline}</p>
              )}
              <div className="flex gap-3 text-xs text-[#8f8c85]">
                <span>{trip.num_days} days</span>
                <span>·</span>
                <span className="capitalize">{trip.budget_level}</span>
                <span>·</span>
                <span className="capitalize">{trip.travel_style}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
