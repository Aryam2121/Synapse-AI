'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowLeft,
  MessageSquare,
  FileText,
  CheckSquare,
  Code,
  Search,
  Zap,
  Users,
  Mic,
  Calendar,
} from 'lucide-react'
import {
  SitePage,
  SiteHeader,
  SiteFooter,
  GlassCard,
  GradientButton,
  OutlineButton,
  SectionHeading,
} from '@/components/marketing/SiteShell'

const sections = [
  { icon: MessageSquare, title: 'AI Chat', description: 'ChatGPT-style assistant with conversation history, streaming, and multi-model support.' },
  { icon: FileText, title: 'Documents & Knowledge', description: 'Upload PDFs, build a RAG knowledge base, and ask questions grounded in your content.' },
  { icon: CheckSquare, title: 'Tasks & Scheduling', description: 'Track tasks with priorities. Smart Scheduling suggests meeting times and focus blocks.' },
  { icon: Code, title: 'Code Assistant', description: 'Analyze code, generate snippets, and get explanations across major languages.' },
  { icon: Search, title: 'Universal Search', description: 'Semantic search across documents, conversations, tasks, and workspace content.' },
  { icon: Zap, title: 'Automation', description: 'Define rules and workflows to automate repetitive tasks across your workspace.' },
  { icon: Users, title: 'Collaboration', description: 'Real-time editing, team presence, and shared sessions for documents.' },
  { icon: Mic, title: 'Voice Assistant', description: 'Hands-free control — create tasks, search, and navigate with speech.' },
  { icon: Calendar, title: 'Analytics & Insights', description: 'Productivity metrics, gamification, and AI-generated work pattern insights.' },
]

const quickStart = [
  { step: 'Create a free account', link: '/register' },
  { step: 'Start the backend: npm run backend (port 8000)', link: null },
  { step: 'Set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local', link: null },
  { step: 'Open the dashboard and explore from the sidebar', link: '/dashboard' },
  { step: 'Upload documents, start a chat, or create your first task', link: null },
]

export default function DocsPage() {
  const router = useRouter()

  return (
    <SitePage>
      <SiteHeader />

      <main className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-4xl relative z-10 flex-1">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent mb-4">
            Documentation
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
            Get started with Synapse AI — RAG-powered chat, multi-agent tools, and real-time collaboration.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-14"
        >
          <GlassCard className="p-7 sm:p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Quick start</h2>
            <ol className="space-y-4">
              {quickStart.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-400 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-violet-400 text-xs font-bold border border-violet-500/20">
                    {i + 1}
                  </span>
                  {item.link ? (
                    <Link href={item.link} className="hover:text-violet-300 transition-colors">
                      {item.step}
                    </Link>
                  ) : (
                    <span>{item.step}</span>
                  )}
                </li>
              ))}
            </ol>
            <GradientButton className="mt-8" onClick={() => router.push('/dashboard')}>
              Open dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </GradientButton>
          </GlassCard>
        </motion.section>

        <SectionHeading badge="Platform" title="Features" align="left" />

        <div className="grid sm:grid-cols-2 gap-4 mb-16">
          {sections.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <GlassCard hover className="p-5 h-full">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-violet-500/15 flex items-center justify-center shrink-0">
                    <s.icon className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">{s.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <GlassCard className="p-8 text-center">
          <p className="text-slate-400 mb-5">Ready to get started?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <OutlineButton onClick={() => router.push('/login')}>Sign in</OutlineButton>
            <GradientButton onClick={() => router.push('/register')}>
              Create free account
              <ArrowRight className="ml-2 h-4 w-4" />
            </GradientButton>
          </div>
        </GlassCard>
      </main>

      <SiteFooter />
    </SitePage>
  )
}
