'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getDisplayErrorMessage, tripsApi } from '@/lib/api'
import type { Activity, ItineraryDay, TripGenerationJob, TripWithItinerary } from '@/types'

const POLL_INTERVAL_MS = 3000

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tripId = searchParams.get('id')
  const initialJobId = searchParams.get('jobId')

  const [trip, setTrip] = useState<TripWithItinerary | null>(null)
  const [job, setJob] = useState<TripGenerationJob | null>(null)
  const [currentDay, setCurrentDay] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isPolling, setIsPolling] = useState(false)

  useEffect(() => {
    if (!tripId) {
      router.push('/')
      return
    }

    let cancelled = false

    const loadTripState = async () => {
      setLoading(true)
      setError('')

      try {
        const tripData = await tripsApi.get(tripId)
        if (cancelled) return

        setTrip(tripData)

        if (tripData.status === 'generated') {
          setJob(null)
          return
        }

        const jobData = initialJobId
          ? await tripsApi.getGenerationJob(initialJobId)
          : await tripsApi.getLatestGenerationJob(tripId)

        if (cancelled) return
        setJob(jobData)
      } catch (err) {
        if (cancelled) return
        setError(getDisplayErrorMessage(err, 'Trip not found'))
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadTripState()

    return () => {
      cancelled = true
    }
  }, [initialJobId, router, tripId])

  useEffect(() => {
    if (!tripId || !job || job.status === 'completed' || job.status === 'failed') {
      return
    }

    let cancelled = false
    setIsPolling(true)

    const poll = async () => {
      try {
        const nextJob = await tripsApi.getGenerationJob(job.id)
        if (cancelled) return

        setJob(nextJob)

        if (nextJob.status === 'completed') {
          const tripData = await tripsApi.get(tripId)
          if (cancelled) return
          setTrip(tripData)
          setIsPolling(false)
          return
        }

        if (nextJob.status === 'failed') {
          const tripData = await tripsApi.get(tripId)
          if (cancelled) return
          setTrip(tripData)
          setIsPolling(false)
        }
      } catch (err) {
        if (cancelled) return
        setError(getDisplayErrorMessage(err, 'Unable to refresh trip status'))
        setIsPolling(false)
      }
    }

    const intervalId = window.setInterval(() => {
      void poll()
    }, POLL_INTERVAL_MS)

    void poll()

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
      setIsPolling(false)
    }
  }, [job, tripId])

  const handleRetryGeneration = async () => {
    if (!tripId) return

    setError('')
    setLoading(true)

    try {
      const nextJob = await tripsApi.createGenerationJob(tripId)
      setJob(nextJob)
      const tripData = await tripsApi.get(tripId)
      setTrip(tripData)
    } catch (err) {
      setError(getDisplayErrorMessage(err, 'Failed to restart itinerary generation'))
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] gap-4">
        <div className="w-10 h-10 border-2 border-[#1a6b5c]/20 border-t-[#1a6b5c] rounded-full animate-spin" />
        <p className="text-[#5a5750]">Loading your itinerary...</p>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 px-4">
        <p className="text-red-600 text-center">{error || 'Something went wrong'}</p>
        <button onClick={() => router.push('/')} className="text-[#1a6b5c] underline">Go back</button>
      </div>
    )
  }

  if (job && (job.status === 'pending' || job.status === 'running' || trip.status === 'generating')) {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-[#faf9f7] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-black/5 shadow-sm p-8 sm:p-10 text-center">
          <div className="w-14 h-14 mx-auto mb-6 border-2 border-[#1a6b5c]/20 border-t-[#1a6b5c] rounded-full animate-spin" />
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#2d9e82] mb-3">Generating</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1c1b19] mb-3">
            Building your trip to {trip.destination}
          </h1>
          <p className="text-sm sm:text-base text-[#5a5750] max-w-lg mx-auto leading-relaxed mb-6">
            The backend is generating your itinerary in the background. You can stay on this page while we keep checking for completion.
          </p>
          <div className="bg-[#f4f2ee] rounded-2xl px-5 py-4 text-left max-w-md mx-auto">
            <p className="text-xs uppercase tracking-wide text-[#8f8c85] mb-2">Current status</p>
            <p className="text-sm font-medium text-[#1c1b19] capitalize">{job.status}</p>
            <p className="text-xs text-[#8f8c85] mt-2">
              {isPolling ? 'Checking every few seconds for updates.' : 'Preparing the next status check.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (job?.status === 'failed' || trip.status === 'failed') {
    return (
      <div className="min-h-[calc(100vh-60px)] bg-[#faf9f7] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-black/5 shadow-sm p-8 sm:p-10 text-center">
          <p className="text-xs font-medium tracking-[0.25em] uppercase text-[#c8922a] mb-3">Generation Failed</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#1c1b19] mb-3">
            We couldn&apos;t finish this itinerary yet
          </h1>
          <p className="text-sm sm:text-base text-[#5a5750] max-w-lg mx-auto leading-relaxed mb-6">
            {job?.error_message || 'The AI service is temporarily unavailable. Please try again in a moment.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetryGeneration}
              className="px-5 py-3 rounded-xl bg-[#1a6b5c] text-white text-sm font-medium hover:bg-[#155c4f] transition-colors"
            >
              Try again
            </button>
            <button
              onClick={() => router.push('/trips')}
              className="px-5 py-3 rounded-xl border border-black/10 text-sm font-medium text-[#5a5750] hover:border-[#2d9e82] hover:text-[#1a6b5c] transition-colors"
            >
              Back to trips
            </button>
          </div>
        </div>
      </div>
    )
  }

  const days = [...trip.itineraries].sort((a, b) => a.day_number - b.day_number)
  const activeDay: ItineraryDay | undefined = days[currentDay]
  const totalBudget = trip.budget_plan?.total_budget || 0
  const spentEstimate = Math.round(totalBudget * 0.68)
  const budgetPct = totalBudget > 0 ? Math.min(Math.round((spentEstimate / totalBudget) * 100), 100) : 0

  const tagColors: Record<string, string> = {
    Free: 'bg-[#e8f5f1] text-[#1a6b5c]',
    'Must-see': 'bg-[#fdf0eb] text-[#e8572a]',
    'Hidden gem': 'bg-[#fdf5e6] text-[#c8922a]',
    'Budget-friendly': 'bg-[#e8f5f1] text-[#1a6b5c]',
    'Local favourite': 'bg-[#fdf5e6] text-[#c8922a]',
  }

  return (
    <div className="min-h-[calc(100vh-60px)] bg-[#faf9f7] lg:flex">
      <aside className="border-b border-black/5 bg-white lg:w-[320px] lg:border-b-0 lg:border-r lg:sticky lg:top-[60px] lg:max-h-[calc(100vh-60px)] lg:overflow-y-auto">
        <div className="p-4 sm:p-6">
          <h2 className="font-serif text-xl font-semibold text-[#1c1b19] mb-1">{trip.destination}</h2>
          <p className="text-sm text-[#8f8c85] mb-5">{trip.tagline}</p>

          {totalBudget > 0 && (
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#8f8c85]">Estimated spend</span>
                <span className="font-medium">${spentEstimate.toLocaleString()}</span>
              </div>
              <div className="h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2d9e82] rounded-full transition-all duration-700"
                  style={{ width: `${budgetPct}%` }}
                />
              </div>
              <p className="text-xs text-[#8f8c85] mt-1">of ${totalBudget.toLocaleString()} budget</p>
            </div>
          )}

          <div className="lg:hidden mb-5">
            <p className="text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">Daily plan</p>
            <div className="-mx-4 px-4 flex gap-2 overflow-x-auto pb-1 sm:-mx-6 sm:px-6">
              {days.map((day, i) => (
                <button
                  key={day.id}
                  onClick={() => setCurrentDay(i)}
                  className={`flex min-w-[140px] items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                    i === currentDay
                      ? 'border-[#2d9e82] bg-[#e8f5f1] text-[#1a6b5c]'
                      : 'border-black/10 bg-white text-[#5a5750]'
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium flex-shrink-0 ${
                    i === currentDay ? 'bg-[#1a6b5c] text-white' : 'bg-[#f4f2ee]'
                  }`}>
                    {day.day_number}
                  </span>
                  <span className="truncate">{day.theme || `Day ${day.day_number}`}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <p className="text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">Daily plan</p>
            <div className="space-y-1">
              {days.map((day, i) => (
                <button
                  key={day.id}
                  onClick={() => setCurrentDay(i)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left text-sm transition-all ${
                    i === currentDay
                      ? 'bg-[#e8f5f1] text-[#1a6b5c] font-medium'
                      : 'hover:bg-[#faf9f7] text-[#5a5750]'
                  }`}
                >
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    i === currentDay ? 'bg-[#1a6b5c] text-white' : 'bg-[#f4f2ee]'
                  }`}>
                    {day.day_number}
                  </span>
                  <span className="truncate">{day.theme || `Day ${day.day_number}`}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-black/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <button
              onClick={() => router.push(`/chat?tripId=${trip.id}`)}
              className="w-full py-2.5 px-4 rounded-lg border border-black/10 text-sm text-[#5a5750] hover:border-[#2d9e82] hover:text-[#1a6b5c] transition-all"
            >
              💬 Ask the AI guide
            </button>
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 px-4 rounded-lg bg-[#e8f5f1] text-[#1a6b5c] text-sm font-medium hover:bg-[#d0ede5] transition-all"
            >
              ← Plan another trip
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        {activeDay ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 sm:mb-6">
              {[
                { label: 'Day', value: `${activeDay.day_number} / ${days.length}` },
                { label: 'Activities', value: activeDay.activities.length },
                { label: 'Est. cost', value: `$${activeDay.activities.reduce((s, a) => s + (a.estimatedCost || 0), 0)}` },
                { label: 'Destination', value: trip.destination.split(',')[0] },
              ].map((stat) => (
                <div key={stat.label} className="bg-[#f4f2ee] rounded-lg p-3 sm:p-3.5">
                  <p className="text-xs text-[#8f8c85] uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-base sm:text-xl font-medium text-[#1c1b19] break-words">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mb-5 sm:mb-6">
              <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1c1b19] mb-1">
                Day {activeDay.day_number}: {activeDay.theme}
              </h2>
              <p className="text-sm text-[#8f8c85]">{trip.destination}</p>
            </div>

            <div className="relative pl-5 sm:pl-8">
              <div className="absolute left-[5px] sm:left-[9px] top-3 bottom-3 w-0.5 bg-black/5" />
              <div className="space-y-4">
                {activeDay.activities.map((act: Activity, i: number) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-5 sm:-left-8 top-3.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-white border-2 border-[#2d9e82]" />
                    <div className="bg-white rounded-xl border border-black/5 p-4 sm:p-5 hover:border-black/10 hover:shadow-sm transition-all">
                      <p className="text-xs font-medium text-[#2d9e82] mb-1 tracking-wide">
                        {act.time} {act.duration && `· ${act.duration}`}
                      </p>
                      <h3 className="font-medium text-[#1c1b19] mb-1 text-sm sm:text-base">{act.name}</h3>
                      <p className="text-sm text-[#5a5750] leading-relaxed mb-3">{act.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {(act.tags || []).map((tag: string) => (
                          <span
                            key={tag}
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColors[tag] || 'bg-[#e8f5f1] text-[#1a6b5c]'}`}
                          >
                            {tag}
                          </span>
                        ))}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          act.estimatedCost === 0 ? 'bg-[#e8f5f1] text-[#1a6b5c]' : 'bg-[#fdf5e6] text-[#c8922a]'
                        }`}>
                          {act.estimatedCost === 0 ? 'Free' : `$${act.estimatedCost}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-[#8f8c85]">No activities for this day.</p>
        )}
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-2 border-[#1a6b5c]/20 border-t-[#1a6b5c] rounded-full animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}
