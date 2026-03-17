import Cookies from 'js-cookie'

const ACCESS_TOKEN_KEY = 'voya_access_token'
const REFRESH_TOKEN_KEY = 'voya_refresh_token'

export const setTokens = (access: string, refresh: string) => {
  Cookies.set(ACCESS_TOKEN_KEY, access, { expires: 1 })
  Cookies.set(REFRESH_TOKEN_KEY, refresh, { expires: 30 })
}

export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY)
}

export const getRefreshToken = (): string | undefined => {
  return Cookies.get(REFRESH_TOKEN_KEY)
}

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY)
  Cookies.remove(REFRESH_TOKEN_KEY)
}

export const isAuthenticated = (): boolean => {
  return !!getAccessToken()
}