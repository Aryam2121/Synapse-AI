/** Shared auth helpers for API calls */

export const AUTH_TOKEN_KEY = 'auth_token'
export const AUTH_USER_KEY = 'auth_user'
export const AUTH_TIMESTAMP_KEY = 'auth_timestamp'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken()
  return token
    ? {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    : { 'Content-Type': 'application/json' }
}

export function formatApiError(detail: unknown, fallback: string): string {
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === 'string') return item
        if (item && typeof item === 'object' && 'msg' in item) {
          return String((item as { msg: string }).msg)
        }
        return JSON.stringify(item)
      })
      .join('. ')
  }
  if (detail && typeof detail === 'object' && 'msg' in detail) {
    return String((detail as { msg: string }).msg)
  }
  return fallback
}
