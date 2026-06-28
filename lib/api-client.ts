import { API_URL } from '@/lib/api-config'
import { formatApiError, getAuthToken } from '@/lib/auth'

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }))
    throw new Error(formatApiError(error.detail, `Request failed (${response.status})`))
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}
