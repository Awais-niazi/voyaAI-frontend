export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  is_premium: boolean
  preferences: Record<string, unknown>
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface Trip {
  id: string
  destination: string
  destination_country: string | null
  num_days: number
  budget_level: 'budget' | 'mid' | 'luxury'
  budget_amount: number | null
  travel_style: string
  interests: string[]
  status: string
  tagline: string | null
  created_at: string
  updated_at: string
}

export interface Activity {
  time: string
  name: string
  description: string
  type: string
  estimatedCost: number
  duration: string
  tags: string[]
  latitude?: number
  longitude?: number
}

export interface ItineraryDay {
  id: string
  trip_id: string
  day_number: number
  theme: string | null
  activities: Activity[]
}

export interface BudgetPlan {
  id: string
  trip_id: string
  total_budget: number
  currency: string
  accommodation: number
  food: number
  transport: number
  activities: number
  miscellaneous: number
}

export interface TripWithItinerary extends Trip {
  itineraries: ItineraryDay[]
  budget_plan: BudgetPlan | null
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface TripCreateRequest {
  destination: string
  num_days: number
  budget_level: string
  travel_style: string
  interests: string[]
}