'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '@/lib/api-config'
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  AUTH_TIMESTAMP_KEY,
  formatApiError,
} from '@/lib/auth'
import { firebaseSignOut, isFirebaseConfigured, signInWithGooglePopup } from '@/lib/firebase'

interface User {
  id: string
  email: string
  name: string
  is_active: boolean
  is_verified: boolean
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  refreshToken: () => Promise<boolean>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function persistSession(accessToken: string, user: User) {
  localStorage.setItem(AUTH_TOKEN_KEY, accessToken)
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
  localStorage.setItem(AUTH_TIMESTAMP_KEY, Date.now().toString())
}

function clearSession() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
  localStorage.removeItem(AUTH_USER_KEY)
  localStorage.removeItem(AUTH_TIMESTAMP_KEY)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const logout = useCallback(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
    if (storedToken) {
      fetch(API_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: { Authorization: `Bearer ${storedToken}` },
      }).catch(() => {})
    }
    if (isFirebaseConfigured()) {
      firebaseSignOut().catch(() => {})
    }
    setUser(null)
    setToken(null)
    clearSession()
    router.push('/login')
  }, [router])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!storedToken) return false

      const response = await fetch(API_ENDPOINTS.ME, {
        headers: { Authorization: `Bearer ${storedToken}` },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setToken(storedToken)
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData))
        return true
      }

      logout()
      return false
    } catch {
      logout()
      return false
    }
  }, [logout])

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY)
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(API_ENDPOINTS.ME, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })

        if (response.ok) {
          const userData = await response.json()
          setUser(userData)
          setToken(storedToken)
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData))
        } else {
          clearSession()
        }
      } catch {
        const storedUser = localStorage.getItem(AUTH_USER_KEY)
        if (storedUser) {
          setToken(storedToken)
          setUser(JSON.parse(storedUser))
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }))
        if (response.status === 401) {
          throw new Error('Incorrect email or password')
        }
        throw new Error(formatApiError(error.detail, 'Login failed'))
      }

      const data = await response.json()
      setUser(data.user)
      setToken(data.token.access_token)
      persistSession(data.token.access_token, data.user)
      router.push('/dashboard')
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          'Login timed out — the server may be waking up. Please wait a moment and try again.'
        )
      }
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Registration failed' }))
        throw new Error(formatApiError(error.detail, 'Registration failed'))
      }

      const data = await response.json()
      setUser(data.user)
      setToken(data.token.access_token)
      persistSession(data.token.access_token, data.user)
      router.push('/dashboard')
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(
          'Registration timed out — the server may be waking up. Please wait a moment and try again.'
        )
      }
      throw error
    }
  }

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured()) {
      throw new Error(
        'Google sign-in is not configured. Add Firebase env vars to .env.local'
      )
    }

    const idToken = await signInWithGooglePopup()

    const response = await fetch(API_ENDPOINTS.FIREBASE_AUTH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: idToken }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Google sign-in failed' }))
      throw new Error(formatApiError(error.detail, 'Google sign-in failed'))
    }

    const data = await response.json()
    setUser(data.user)
    setToken(data.token.access_token)
    persistSession(data.token.access_token, data.user)
    router.push('/dashboard')
  }

  useEffect(() => {
    if (!token) return

    const checkAuth = async () => {
      const timestamp = localStorage.getItem(AUTH_TIMESTAMP_KEY)
      if (!timestamp) return

      const age = Date.now() - parseInt(timestamp, 10)
      const sixDays = 6 * 24 * 60 * 60 * 1000

      if (age > sixDays) {
        const valid = await refreshToken()
        if (!valid) {
          router.push('/login')
        }
      }
    }

    checkAuth()
    const interval = setInterval(checkAuth, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token, refreshToken, router])

  const value = {
    user,
    token,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshToken,
    isLoading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
