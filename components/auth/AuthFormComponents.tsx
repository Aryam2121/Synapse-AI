'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2, LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const inputClass =
  'h-11 pl-10 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:bg-white/[0.06] transition-all rounded-xl'

interface AuthInputProps {
  id: string
  label?: string
  hideLabel?: boolean
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  icon: LucideIcon
  required?: boolean
  minLength?: number
  hint?: string
  rightElement?: React.ReactNode
}

export function AuthInput({
  id,
  label,
  hideLabel = false,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon: Icon,
  required,
  minLength,
  hint,
  rightElement,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      {!hideLabel && label && (
        <Label htmlFor={id} className="text-slate-300 text-sm font-medium">
          {label}
        </Label>
      )}
      <div className="relative group">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors pointer-events-none" />
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(inputClass, rightElement && 'pr-10')}
          required={required}
          minLength={minLength}
        />
        {rightElement}
      </div>
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  )
}

export function PasswordToggle({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-0.5"
      tabIndex={-1}
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )
}

export function AuthError({ message, extra }: { message: string; extra?: React.ReactNode }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3 text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="text-sm space-y-1 min-w-0">
              <p>{message}</p>
              {extra}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function AuthSubmitButton({
  loading,
  loadingText,
  children,
  className,
}: {
  loading: boolean
  loadingText: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className={cn(
        'w-full h-11 rounded-xl font-semibold text-white',
        'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600',
        'hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500',
        'shadow-lg shadow-violet-900/30 hover:shadow-violet-800/40',
        'hover:scale-[1.01] active:scale-[0.99] transition-all',
        'disabled:opacity-60 disabled:pointer-events-none',
        className
      )}
      size="lg"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          {loadingText}
        </>
      ) : (
        <>
          {children}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  )
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null

  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const score = Object.values(checks).filter(Boolean).length

  const levels = [
    { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' },
    { label: 'Fair', color: 'bg-amber-500', width: 'w-2/4' },
    { label: 'Good', color: 'bg-yellow-400', width: 'w-3/4' },
    { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' },
  ]
  const level = levels[Math.max(0, score - 1)] ?? levels[0]

  return (
    <div className="space-y-1.5">
      <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-300', level.color, level.width)}
        />
      </div>
      <p className="text-xs text-slate-500">
        Strength: <span className="text-slate-400">{level.label}</span>
        {!checks.length && ' · min 8 characters'}
      </p>
    </div>
  )
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string
  linkText: string
  href: string
}) {
  return (
    <p className="text-center text-sm text-slate-400">
      {text}{' '}
      <Link
        href={href}
        className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
      >
        {linkText}
      </Link>
    </p>
  )
}
