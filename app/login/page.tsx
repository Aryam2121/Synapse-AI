'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout, AuthLoadingScreen } from '@/components/auth/AuthLayout'
import {
  AuthInput,
  AuthError,
  AuthSubmitButton,
  PasswordToggle,
  AuthFooterLink,
} from '@/components/auth/AuthFormComponents'
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed'
      if (message.includes('Incorrect email or password') || message.includes('401')) {
        setError('Incorrect email or password. Please try again.')
      } else if (
        message.includes('fetch') ||
        message.includes('Failed to fetch') ||
        message.includes('network')
      ) {
        setError(
          'Cannot connect to server. Ensure the backend is running on port 8000.'
        )
      } else {
        setError(message || 'Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isAuthenticated) {
    return <AuthLoadingScreen />
  }

  return (
    <AuthLayout
      mode="login"
      title="Sign in"
      subtitle="Access your AI workspace — chat, docs, tasks & more."
      footer={
        <AuthFooterLink text="Don't have an account?" linkText="Create one free" href="/register" />
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton onError={setError} disabled={isLoading} />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthError
            message={error}
            extra={
              error.includes('Incorrect email or password') ? (
                <p className="text-xs opacity-80">
                  New here?{' '}
                  <Link href="/register" className="underline text-red-200">
                    Create an account
                  </Link>
                </p>
              ) : undefined
            }
          />

          <AuthInput
            id="email"
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={setEmail}
            icon={Mail}
            required
          />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-slate-300 text-sm font-medium">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <AuthInput
              id="password"
              hideLabel
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={setPassword}
              icon={Lock}
              required
              rightElement={
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              }
            />
          </div>

          <AuthSubmitButton loading={isLoading} loadingText="Signing in...">
            Sign in
          </AuthSubmitButton>
        </form>
      </div>
    </AuthLayout>
  )
}
