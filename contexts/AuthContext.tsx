'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { API_ENDPOINTS } from '@/lib/api-config'

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
  logout: () => void
  refreshToken: () => Promise<boolean>
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Login failed' }))
        if (response.status === 401) {
          throw new Error('Incorrect email or password')
        }
        throw new Error(error.detail || 'Login failed')
      }

      const data = await response.json()
      
      setUser(data.user)
      setToken(data.token.access_token)
      
      // Store in localStorage with timestamp
      localStorage.setItem('auth_token', data.token.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))
      localStorage.setItem('auth_timestamp', Date.now().toString())

      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Registration failed')
      }

      const data = await response.json()
      
      setUser(data.user)
      setToken(data.token.access_token)
      
      // Store in localStorage
      localStorage.setItem('auth_token', data.token.access_token)
      localStorage.setItem('auth_user', JSON.stringify(data.user))

      router.push('/dashboard')
    } catch (error) {
      throw error
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedToken = localStorage.getItem('auth_token')
      if (!storedToken) return false

      // Verify token is still valid by calling /me endpoint
      const response = await fetch(API_ENDPOINTS.ME, {
        headers: {
          'Authorization': `Bearer ${storedToken}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setToken(storedToken)
        return true
      } else {
        // Token expired or invalid, clear it
        logout()
        return false
      }
    } catch (error) {
      logout()
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    router.push('/login')
  }

  // Auto-refresh token on mount and periodically
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        // Check if token is too old (more than 6 days)
        const timestamp = localStorage.getItem('auth_timestamp')
        if (timestamp) {
          const age = Date.now() - parseInt(timestamp)
          const sixDays = 6 * 24 * 60 * 60 * 1000
          
          if (age > sixDays) {
            // Token is about to expire, verify it
            const valid = await refreshToken()
            if (!valid) {
              alert('Your session has expired. Please login again.')
            }
          }
        }
      }
    }
    
    checkAuth()
    
    // Check auth every hour
    const interval = setInterval(checkAuth, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [token])

  const value = {
    user,
    token,
    login,
    register,
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
