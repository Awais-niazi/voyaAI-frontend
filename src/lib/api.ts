import axios from 'axios'
import { getAccessToken, clearTokens } from './auth'
import type {
  TokenResponse,
  User,
  Trip,
  TripGenerationJob,
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

export class ApiError extends Error {
  status?: number
  retryAfter?: number

  constructor(message: string, status?: number, retryAfter?: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.retryAfter = retryAfter
  }
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail
    if (typeof detail === 'string' && detail.trim()) {
      return detail
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return fallback
}

const toApiError = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const retryAfterHeader = error.response?.headers?.['retry-after']
    const retryAfter = typeof retryAfterHeader === 'string'
      ? Number.parseInt(retryAfterHeader, 10)
      : undefined

    return new ApiError(
      getErrorMessage(error, fallback),
      error.response?.status,
      Number.isFinite(retryAfter) ? retryAfter : undefined,
    )
  }

  return new ApiError(getErrorMessage(error, fallback))
}

export const getDisplayErrorMessage = (error: unknown, fallback: string) => {
  const apiError = toApiError(error, fallback)

  if (apiError.status === 429 && apiError.retryAfter) {
    return `${apiError.message} Try again in about ${apiError.retryAfter} seconds.`
  }

  return apiError.message
}

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
    return Promise.reject(toApiError(error, 'Request failed'))
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

  generateAsync: async (trip_id: string): Promise<TripGenerationJob> => {
    const { data } = await api.post('/trips/generate-async', { trip_id })
    return data
  },

  createGenerationJob: async (trip_id: string): Promise<TripGenerationJob> => {
    const { data } = await api.post(`/trips/${trip_id}/generation-jobs`)
    return data
  },

  getGenerationJob: async (jobId: string): Promise<TripGenerationJob> => {
    const { data } = await api.get(`/trips/generation-jobs/${jobId}`)
    return data
  },

  getLatestGenerationJob: async (tripId: string): Promise<TripGenerationJob> => {
    const { data } = await api.get(`/trips/${tripId}/generation-jobs/latest`)
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
