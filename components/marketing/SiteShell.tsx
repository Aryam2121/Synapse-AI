'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ── Background ── */
export function SiteBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10">
      <div className="absolute inset-0 bg-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-[#0a0a0f] to-slate-950" />
      <div className="absolute inset-0 bg-grid-white/10 opacity-[0.35]" />
      <div className="absolute inset-0 bg-noise opacity-[0.03]" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[130px] animate-blob" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[110px] animate-blob animation-delay-2000" />
      <div className="absolute top-1/2 right-0 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-[90px] animate-blob animation-delay-4000" />
    </div>
  )
}

/* ── Logo ── */
export function SiteLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'p-2 rounded-xl', icon: 'h-5 w-5', text: 'text-lg' },
    md: { box: 'p-2 rounded-xl', icon: 'h-6 w-6', text: 'text-xl' },
    lg: { box: 'p-3 rounded-2xl', icon: 'h-8 w-8', text: 'text-2xl' },
  }
  const s = sizes[size]
  return (
    <Link href="/" className="inline-flex items-center gap-3 group">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity" />
        <div className={cn('relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 shadow-lg', s.box)}>
          <Brain className={cn('text-white', s.icon)} />
        </div>
      </div>
      <span className={cn('font-bold tracking-tight text-white', s.text)}>Synapse AI</span>
    </Link>
  )
}

/* ── Header ── */
export function SiteHeader() {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navLinks = [
    { label: 'Docs', href: '/docs' },
    { label: 'Sign in', href: '/login' },
  ]

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-white/10 bg-[#0a0a0f]/85 backdrop-blur-2xl shadow-lg shadow-black/20'
          : 'border-white/8 bg-[#0a0a0f]/60 backdrop-blur-xl'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <SiteLogo />
        <nav className="hidden sm:flex items-center gap-2 sm:gap-3">
          {navLinks.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-white/8"
              onClick={() => router.push(link.href)}
            >
              {link.label}
            </Button>
          ))}
          <GradientButton onClick={() => router.push('/register')} size="sm">
            Get started
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </GradientButton>
        </nav>
        <button
          type="button"
          className="sm:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/8"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden border-t border-white/8 bg-[#0a0a0f]/95 backdrop-blur-2xl overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className="justify-start text-slate-300 hover:text-white hover:bg-white/8"
                  onClick={() => { router.push(link.href); setMobileOpen(false) }}
                >
                  {link.label}
                </Button>
              ))}
              <GradientButton
                className="mt-2 w-full"
                onClick={() => { router.push('/register'); setMobileOpen(false) }}
              >
                Get started
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </GradientButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ── Footer ── */
export function SiteFooter() {
  const columns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign in', href: '/login' },
        { label: 'Register', href: '/register' },
        { label: 'Forgot password', href: '/forgot-password' },
      ],
    },
  ]

  return (
    <footer className="border-t border-white/8 mt-auto relative z-10">
      <div className="container mx-auto px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <SiteLogo size="sm" />
            <p className="mt-4 text-sm text-slate-500 leading-relaxed max-w-xs">
              Your intelligent workspace — chat, documents, code, and 17+ AI tools in one place.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-violet-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Built with</h4>
            <ul className="space-y-2.5 text-sm text-slate-500">
              <li>Next.js · React</li>
              <li>Groq · RAG</li>
              <li>Firebase Auth</li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-white/8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} Synapse AI. All rights reserved.</p>
          <p className="text-slate-700">Made for builders, learners, and teams.</p>
        </div>
      </div>
    </footer>
  )
}

/* ── Page wrapper ── */
export function SitePage({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('min-h-screen flex flex-col text-white relative', className)}>
      <SiteBackground />
      {children}
    </div>
  )
}

/* ── Glass card ── */
export function GlassCard({
  children,
  className,
  hover = false,
}: {
  children: React.ReactNode
  className?: string
  hover?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl',
        hover && 'hover:bg-white/[0.07] hover:border-white/15 transition-all duration-300',
        className
      )}
    >
      {children}
    </div>
  )
}

/* ── Gradient border card (auth-style) ── */
export function GradientCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-white/10 shadow-2xl shadow-violet-950/40', className)}>
      <div className="rounded-2xl bg-[#12121a]/90 backdrop-blur-2xl border border-white/5 overflow-hidden">
        <div className="h-0.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        {children}
      </div>
    </div>
  )
}

/* ── Buttons ── */
export function GradientButton({
  children,
  className,
  size = 'default',
  asChild,
  ...props
}: React.ComponentProps<typeof Button> & { size?: 'sm' | 'default' | 'lg' }) {
  const sizeClass = {
    sm: 'h-9 px-4 text-sm',
    default: 'h-11 px-6',
    lg: 'h-14 px-8 text-lg',
  }[size]
  return (
    <Button
      asChild={asChild}
      className={cn(
        'rounded-xl font-semibold text-white border-0',
        'bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600',
        'hover:from-violet-500 hover:via-purple-500 hover:to-fuchsia-500',
        'shadow-lg shadow-violet-900/30 hover:shadow-violet-800/40',
        'hover:scale-[1.02] active:scale-[0.98] transition-all',
        sizeClass,
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export function OutlineButton({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      variant="outline"
      className={cn(
        'rounded-xl h-11 px-6 border-white/15 text-white bg-white/[0.03]',
        'hover:bg-white/10 hover:border-white/25 transition-all',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

/* ── Section heading ── */
export function SectionHeading({
  badge,
  title,
  subtitle,
  align = 'center',
}: {
  badge?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn('mb-14', align === 'center' && 'text-center')}
    >
      {badge && (
        <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest text-violet-400">
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
        {title}
      </h2>
      {subtitle && (
        <p className={cn('mt-4 text-lg text-slate-400 max-w-2xl', align === 'center' && 'mx-auto')}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
