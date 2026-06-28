'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout, AuthLoadingScreen } from '@/components/auth/AuthLayout'
import {
  AuthInput,
  AuthError,
  AuthSubmitButton,
  PasswordToggle,
  AuthFooterLink,
  PasswordStrength,
} from '@/components/auth/AuthFormComponents'
import { AuthDivider, GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { register, isAuthenticated, isLoading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      await register(name, email, password)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      if (message.includes('fetch') || message.includes('Failed to fetch')) {
        setError(
          'Cannot connect to server. Ensure the backend is running on port 8000.'
        )
      } else {
        setError(message)
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
      mode="register"
      title="Create account"
      subtitle="Free forever to start. No credit card required."
      footer={
        <AuthFooterLink text="Already have an account?" linkText="Sign in" href="/login" />
      }
      bottomNote={
        <p className="text-center text-xs text-slate-600 leading-relaxed px-4">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      }
    >
      <div className="space-y-5">
        <GoogleSignInButton label="Sign up with Google" onError={setError} disabled={isLoading} />

        <AuthDivider />

        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthError message={error} />

          <AuthInput
            id="name"
            label="Full name"
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={setName}
            icon={User}
            required
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

          <div className="space-y-2">
            <AuthInput
              id="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              value={password}
              onChange={setPassword}
              icon={Lock}
              required
              minLength={8}
              rightElement={
                <PasswordToggle show={showPassword} onToggle={() => setShowPassword(!showPassword)} />
              }
            />
            <PasswordStrength password={password} />
          </div>

          <AuthInput
            id="confirmPassword"
            label="Confirm password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            icon={Lock}
            required
            minLength={8}
            rightElement={
              <PasswordToggle
                show={showConfirmPassword}
                onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />

          <AuthSubmitButton loading={isLoading} loadingText="Creating account..." className="mt-2">
            Create account
          </AuthSubmitButton>
        </form>
      </div>
    </AuthLayout>
  )
}
