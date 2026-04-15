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
  const [deleting, setDeleting] = useState<string | null>(null)

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

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation()
    if (!confirm('Delete this trip?')) return
    setDeleting(tripId)
    try {
      await tripsApi.delete(tripId)
      setTrips((prev) => prev.filter((t) => t.id !== tripId))
    } catch {
      alert('Failed to delete trip')
    } finally {
      setDeleting(null)
    }
  }

  const getTripCardMeta = (status: string) => {
    switch (status) {
      case 'generated':
        return {
          clickable: true,
          badgeClass: 'bg-[#e8f5f1] text-[#1a6b5c]',
          helperText: 'Ready to view itinerary',
        }
      case 'generating':
        return {
          clickable: true,
          badgeClass: 'bg-[#fdf5e6] text-[#c8922a]',
          helperText: 'Generation in progress',
        }
      case 'failed':
        return {
          clickable: true,
          badgeClass: 'bg-red-50 text-red-600',
          helperText: 'Open to retry generation',
        }
      default:
        return {
          clickable: false,
          badgeClass: 'bg-[#f4f2ee] text-[#8f8c85]',
          helperText: 'Trip draft',
        }
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1c1b19] mb-6 sm:mb-8">
        My trips
      </h1>

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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trips.map((trip) => (
            (() => {
              const meta = getTripCardMeta(trip.status)

              return (
                <div
                  key={trip.id}
                  onClick={() => meta.clickable ? router.push(`/results?id=${trip.id}`) : null}
                  className={`bg-white rounded-2xl border border-black/5 p-5 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all relative ${
                    meta.clickable ? 'cursor-pointer' : ''
                  }`}
                >
              {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, trip.id)}
                    disabled={deleting === trip.id}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#8f8c85] hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-40"
                  >
                    {deleting === trip.id ? (
                      <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                    )}
                  </button>

                  <div className="flex items-start justify-between mb-3 pr-8">
                    <h2 className="font-serif text-lg font-semibold text-[#1c1b19]">
                      {trip.destination}
                    </h2>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ml-2 flex-shrink-0 ${meta.badgeClass}`}>
                      {trip.status}
                    </span>
                  </div>

                  {trip.tagline && (
                    <p className="text-sm text-[#5a5750] mb-3 leading-relaxed">{trip.tagline}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs text-[#8f8c85] mb-3">
                    <span>{trip.num_days} days</span>
                    <span>·</span>
                    <span className="capitalize">{trip.budget_level}</span>
                    <span>·</span>
                    <span className="capitalize">{trip.travel_style}</span>
                  </div>
                  <p className="text-sm text-[#8f8c85]">{meta.helperText}</p>
                </div>
              )
            })()
          ))}
        </div>
      )}
    </div>
  )
}
