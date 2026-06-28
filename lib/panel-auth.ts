/** Shared auth helpers for dashboard panels */
import { API_URL } from '@/lib/api-config'

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

export function authHeaders(json = false): HeadersInit {
  const token = getAuthToken()
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`
  if (json) headers['Content-Type'] = 'application/json'
  return headers
}

export async function parseApiError(response: Response): Promise<string> {
  const text = await response.text()
  try {
    const data = JSON.parse(text) as { detail?: string | { msg?: string }[] }
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((d) => d.msg || String(d)).join(', ')
    }
  } catch {
    /* use raw */
  }
  return text || `Request failed (${response.status})`
}

export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  return fetch(url, {
    ...init,
    headers: {
      ...authHeaders(!!init.body && !(init.headers as Record<string, string>)?.['Content-Type']),
      ...(init.headers as Record<string, string>),
    },
  })
}
