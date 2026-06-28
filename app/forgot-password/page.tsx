'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { AuthLayout } from '@/components/auth/AuthLayout'
import {
  AuthInput,
  AuthError,
  AuthSubmitButton,
  AuthFooterLink,
} from '@/components/auth/AuthFormComponents'
import { API_ENDPOINTS } from '@/lib/api-config'
import { formatApiError } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({ detail: 'Failed to send reset email' }))
        throw new Error(formatApiError(err.detail, 'Failed to send reset email'))
      }

      setSuccess(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      if (message.includes('fetch') || message.includes('network')) {
        setError('Cannot connect to server. Please check your connection and try again.')
      } else {
        setError(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout
      mode="login"
      title={success ? 'Check your email' : 'Reset password'}
      subtitle={
        success
          ? 'If an account exists, you will receive reset instructions shortly.'
          : 'Enter your email and we will send reset instructions.'
      }
      footer={
        <AuthFooterLink text="Remember your password?" linkText="Sign in" href="/login" />
      }
    >
      {success ? (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3 text-emerald-300">
            <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Request received</p>
              <p className="text-xs mt-1 opacity-80">
                Check your inbox for password reset instructions.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-white/10 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <AuthError message={error} />
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
          <AuthSubmitButton loading={isLoading} loadingText="Sending...">
            Send reset link
          </AuthSubmitButton>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors py-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  )
}
