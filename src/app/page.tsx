'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { tripsApi } from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

const INTERESTS = [
  { value: 'culture', label: '🏛️ Culture & History' },
  { value: 'food', label: '🍜 Food & Dining' },
  { value: 'nature', label: '🌿 Nature & Outdoors' },
  { value: 'nightlife', label: '🎶 Nightlife' },
  { value: 'shopping', label: '🛍️ Shopping' },
  { value: 'art', label: '🎨 Art & Museums' },
  { value: 'adventure', label: '🧗 Adventure Sports' },
  { value: 'wellness', label: '🧘 Wellness & Spas' },
]

export default function HomePage() {
  const router = useRouter()
  const [destination, setDestination] = useState('')
  const [numDays, setNumDays] = useState('5')
  const [budgetLevel, setBudgetLevel] = useState('mid')
  const [travelStyle, setTravelStyle] = useState('couple')
  const [interests, setInterests] = useState<string[]>(['culture', 'nature'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    )
  }

  const handleGenerate = async () => {
    if (!destination.trim()) {
      setError('Please enter a destination')
      return
    }
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    setError('')
    setLoading(true)
    try {
      const trip = await tripsApi.create({
        destination,
        num_days: parseInt(numDays),
        budget_level: budgetLevel,
        travel_style: travelStyle,
        interests,
      })
      const full = await tripsApi.generate(trip.id)
      router.push(`/results?id=${full.id}`)
    } catch {
      setError('Failed to generate itinerary. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      {/* Hero */}
      <div
        className="px-8 py-20 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1a6b5c 0%, #0f4d3f 60%, #0a3329 100%)' }}
      >
        <div className="inline-block bg-white/10 text-[#a8dfd0] text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-5">
          ✦ AI-Powered Travel Planning
        </div>
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
          Your perfect trip,<br />
          <em className="text-[#a8dfd0]">planned in seconds</em>
        </h1>
        <p className="text-white/60 text-lg max-w-md mx-auto mb-10 font-light">
          Tell us where you want to go. Our AI builds a complete itinerary tailored to your budget and interests.
        </p>

        {/* Planner Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl mx-auto text-left relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Destination
              </label>
              <input
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Tokyo, Japan"
                className="w-full h-11 border-[1.5px] border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] bg-[#faf9f7] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Number of days
              </label>
              <select
                value={numDays}
                onChange={(e) => setNumDays(e.target.value)}
                className="w-full h-11 border-[1.5px] border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] bg-[#faf9f7] transition-colors"
              >
                {['3', '5', '7', '10', '14'].map((d) => (
                  <option key={d} value={d}>{d} days</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Budget
              </label>
              <select
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(e.target.value)}
                className="w-full h-11 border-[1.5px] border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] bg-[#faf9f7] transition-colors"
              >
                <option value="budget">Budget — under $50/day</option>
                <option value="mid">Mid-range — $50–150/day</option>
                <option value="luxury">Luxury — $150+/day</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
                Travel style
              </label>
              <select
                value={travelStyle}
                onChange={(e) => setTravelStyle(e.target.value)}
                className="w-full h-11 border-[1.5px] border-black/10 rounded-lg px-3 text-sm outline-none focus:border-[#2d9e82] bg-[#faf9f7] transition-colors"
              >
                <option value="solo">Solo traveler</option>
                <option value="couple">Couple</option>
                <option value="family">Family with kids</option>
                <option value="group">Group of friends</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-[#8f8c85] uppercase tracking-wide mb-2">
              Interests
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => (
                <button
                  key={i.value}
                  onClick={() => toggleInterest(i.value)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${
                    interests.includes(i.value)
                      ? 'bg-[#e8f5f1] border-[#2d9e82] text-[#1a6b5c] font-medium'
                      : 'bg-[#faf9f7] border-black/10 text-[#5a5750] hover:border-[#2d9e82]'
                  }`}
                >
                  {i.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full h-14 bg-[#1a6b5c] hover:bg-[#155c4f] text-white rounded-lg font-medium text-base flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating your itinerary...
              </>
            ) : (
              <>⚡ Generate My Itinerary</>
            )}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-8 py-20">
        <p className="text-xs font-medium tracking-widest uppercase text-[#2d9e82] mb-3">Why Voya.ai</p>
        <h2 className="font-serif text-3xl font-semibold text-[#1c1b19] mb-12">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: '🗺️', title: 'Smart itinerary generation', desc: 'AI clusters attractions by location and optimises your daily route.' },
            { icon: '💰', title: 'Budget-aware planning', desc: 'Every suggestion filtered to match your spending level.' },
            { icon: '🤖', title: 'AI travel guide chat', desc: 'Ask anything about your destination and get instant expert answers.' },
            { icon: '📍', title: 'Location intelligence', desc: 'Interactive maps with walking distances and transport options.' },
            { icon: '✏️', title: 'Fully editable trips', desc: 'Swap attractions, add restaurants, or shift days around.' },
            { icon: '⭐', title: 'Personalised to you', desc: 'The more you travel with Voya, the smarter it gets.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-black/5 p-7 hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-medium text-[#1c1b19] mb-2">{f.title}</h3>
              <p className="text-sm text-[#5a5750] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}