'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Brain,
  Sparkles,
  MessageSquare,
  FileText,
  Zap,
  Shield,
  ArrowLeft,
} from 'lucide-react'
import { SiteBackground } from '@/components/marketing/SiteShell'

const features = [
  { icon: MessageSquare, text: 'ChatGPT-style AI assistant with memory' },
  { icon: FileText, text: 'Upload docs & build your knowledge base' },
  { icon: Zap, text: 'Automate tasks across your workspace' },
  { icon: Shield, text: 'Secure auth — email or Google sign-in' },
]

interface AuthLayoutProps {
  mode: 'login' | 'register'
  title: string
  subtitle: string
  children: React.ReactNode
  footer: React.ReactNode
  bottomNote?: React.ReactNode
}

export function AuthLayout({
  mode,
  title,
  subtitle,
  children,
  footer,
  bottomNote,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#0a0a0f] text-white overflow-hidden relative">
      <SiteBackground />

      {/* Left hero — desktop only */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative z-10 flex-col justify-between p-12 xl:p-16 border-r border-white/5"
      >
        <div>
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl blur-md opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl p-2.5 shadow-xl">
                <Brain className="h-8 w-8 text-white" />
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight">Synapse AI</span>
          </Link>

          <div className="mt-16 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-violet-200">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {mode === 'login' ? 'Welcome back' : 'Join the workspace'}
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
              {mode === 'login' ? (
                <>
                  Your intelligent
                  <span className="block bg-gradient-to-r from-violet-300 via-purple-200 to-fuchsia-300 bg-clip-text text-transparent">
                    workspace awaits
                  </span>
                </>
              ) : (
                <>
                  Start building with
                  <span className="block bg-gradient-to-r from-violet-300 via-purple-200 to-fuchsia-300 bg-clip-text text-transparent">
                    AI that knows you
                  </span>
                </>
              )}
            </h1>
            <p className="text-lg text-slate-400 max-w-md leading-relaxed">
              RAG-powered chat, document intelligence, task automation, and multi-agent tools — all in one place.
            </p>
          </div>

          <ul className="mt-12 space-y-4">
            {features.map((f, i) => (
              <motion.li
                key={f.text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3 text-slate-300"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  <f.icon className="h-4 w-4 text-violet-400" />
                </span>
                <span className="text-sm">{f.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-8 pt-8">
          <div>
            <p className="text-2xl font-bold text-white">17+</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">AI Tools</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-white">RAG</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Powered</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-white">Free</p>
            <p className="text-xs text-slate-500 uppercase tracking-wider">To start</p>
          </div>
        </div>
      </motion.aside>

      {/* Right form panel */}
      <div className="flex-1 relative z-10 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl p-2">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold">Synapse AI</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </header>

        <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-[440px]"
          >
            {/* Gradient border card */}
            <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-white/10 shadow-2xl shadow-violet-950/50">
              <div className="rounded-2xl bg-[#12121a]/90 backdrop-blur-2xl border border-white/5 overflow-hidden">
                {/* Card top accent */}
                <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />

                <div className="px-7 sm:px-8 pt-8 pb-7 sm:pb-8">
                  <div className="mb-7">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {title}
                    </h2>
                    <p className="mt-2 text-slate-400 text-sm sm:text-base">{subtitle}</p>
                  </div>

                  {children}

                  <div className="mt-8 pt-6 border-t border-white/8">{footer}</div>
                </div>
              </div>
            </div>

            {bottomNote && <div className="mt-5">{bottomNote}</div>}

            <p className="mt-6 text-center lg:hidden">
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-slate-300 inline-flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0f] gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-violet-500 rounded-full blur-xl opacity-40 animate-pulse" />
        <div className="relative h-12 w-12 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
      </div>
      <p className="text-sm text-slate-500">Loading your session...</p>
    </div>
  )
}
