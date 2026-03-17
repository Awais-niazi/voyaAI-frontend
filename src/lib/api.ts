import axios from 'axios'
import { getAccessToken, clearTokens } from './auth'
import type {
  TokenResponse,
  User,
  Trip,
  TripWithItinerary,
  TripCreateRequest,
  ChatMessage,
  PaginatedResponse,
} from '@/types'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearTokens()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  register: async (email: string, password: string, full_name: string): Promise<TokenResponse> => {
    const { data } = await api.post('/auth/register', { email, password, full_name })
    return data
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },

  me: async (): Promise<User> => {
    const { data } = await api.get('/auth/me')
    return data
  },
}

// ── Trips ──────────────────────────────────────────────────────────────
export const tripsApi = {
  create: async (body: TripCreateRequest): Promise<Trip> => {
    const { data } = await api.post('/trips', body)
    return data
  },

  list: async (page = 1): Promise<PaginatedResponse<Trip>> => {
    const { data } = await api.get('/trips', { params: { page } })
    return data
  },

  get: async (id: string): Promise<TripWithItinerary> => {
    const { data } = await api.get(`/trips/${id}`)
    return data
  },

  generate: async (trip_id: string): Promise<TripWithItinerary> => {
    const { data } = await api.post('/trips/generate', { trip_id })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/trips/${id}`)
  },
}

// ── Chat ──────────────────────────────────────────────────────────────
export const chatApi = {
  send: async (messages: ChatMessage[], trip_id?: string): Promise<string> => {
    const { data } = await api.post('/chat', { messages, trip_id })
    return data.reply
  },
}