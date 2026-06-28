'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Brain, Code, FileText, CheckSquare, Search,
  Sparkles, ArrowRight, Users, Zap, Shield, MessageSquare,
} from 'lucide-react'
import {
  SitePage,
  SiteHeader,
  SiteFooter,
  GlassCard,
  GradientCard,
  GradientButton,
  OutlineButton,
  SectionHeading,
} from '@/components/marketing/SiteShell'
import { HeroPreview } from '@/components/marketing/HeroPreview'
import { StatsBar, HowItWorks, Testimonials } from '@/components/marketing/HomeSections'

const SUGGESTIONS = [
  'Summarize my documents',
  'Debug this Python code',
  'Plan my week with tasks',
  'Search my knowledge base',
]

const features = [
  { icon: Brain, title: 'RAG Knowledge Base', description: 'Upload documents and code. Your AI learns from your personal knowledge base with intelligent retrieval.' },
  { icon: Code, title: 'Code Analysis', description: 'Analyze codebases, find bugs, suggest improvements, and generate documentation automatically.' },
  { icon: FileText, title: 'Document Intelligence', description: 'Summarize PDFs, extract insights, generate reports, and answer questions from your documents.' },
  { icon: CheckSquare, title: 'Task Management', description: 'AI-powered task planning, scheduling, and productivity tracking with smart reminders.' },
  { icon: Search, title: 'Universal Search', description: 'Search across documents, code, notes, and tasks with semantic understanding.' },
  { icon: Users, title: 'Multi-Agent System', description: 'Specialized AI agents for code, documents, research, and productivity work together.' },
  { icon: Zap, title: 'Real-time Collaboration', description: 'Work with your team in real-time with AI assistance for everyone.' },
  { icon: Shield, title: 'Private & Secure', description: 'Your data stays yours. Google or email sign-in with enterprise-grade security.' },
]

const useCases = [
  { icon: Code, title: 'Developers', features: ['Analyze entire codebases', 'Find bugs and suggest fixes', 'Auto-generate documentation', 'Architecture recommendations'] },
  { icon: FileText, title: 'Students', features: ['Summarize textbooks and lectures', 'Create study notes automatically', 'Practice quizzes & explanations', 'Personalized learning paths'] },
  { icon: Users, title: 'Professionals', features: ['Summarize long PDFs and emails', 'Generate professional reports', 'Extract action items from meetings', 'Research assistance'] },
  { icon: Brain, title: 'Teams & Companies', features: ['Company-wide knowledge base', 'Automated customer support', 'Document compliance checking', 'Team productivity insights'] },
]

export default function Home() {
  const router = useRouter()

  return (
    <SitePage>
      <SiteHeader />

      {/* Hero */}
      <section className="container mx-auto px-4 sm:px-6 pt-20 pb-24 md:pt-28 md:pb-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-200 text-sm mb-8"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            Your Intelligent Workspace, Unified
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            <span className="bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent">
              Synapse AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Neural AI platform with{' '}
            <span className="text-violet-400 font-medium">RAG</span>,{' '}
            <span className="text-purple-400 font-medium">multi-agent orchestration</span>, and{' '}
            <span className="text-fuchsia-400 font-medium">17+ workspace tools</span> — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <GradientButton size="lg" onClick={() => router.push('/register')}>
              Start free
              <ArrowRight className="ml-2 h-5 w-5" />
            </GradientButton>
            <OutlineButton size="lg" className="h-14 text-base" onClick={() => router.push('/login')}>
              Sign in
            </OutlineButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500"
          >
            {['Google sign-in', 'Free to start', 'RAG powered', 'Real-time chat'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                {t}
              </span>
            ))}
          </motion.div>

          <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => router.push('/register')}
                className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-slate-400 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
              >
                {s}
              </button>
            ))}
          </div>

          <HeroPreview />
        </div>
      </section>

      <StatsBar />

      <HowItWorks />

      {/* Features */}
      <section id="features" className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <SectionHeading
          badge="Features"
          title="Everything you need"
          subtitle="One intelligent platform for chat, documents, code, tasks, and collaboration."
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard hover className="h-full p-6 group">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <SectionHeading
          badge="Use cases"
          title="Built for everyone"
          subtitle="From solo developers to entire teams."
        />
        <div className="grid md:grid-cols-2 gap-5">
          {useCases.map((uc, i) => (
            <motion.div
              key={uc.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -12 : 12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <GlassCard className="p-7 h-full">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                    <uc.icon className="h-6 w-6 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-4">For {uc.title}</h3>
                    <ul className="space-y-2.5">
                      {uc.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-sm text-slate-400">
                          <MessageSquare className="h-3.5 w-3.5 text-violet-500 mt-0.5 shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      <Testimonials />

      {/* CTA */}
      <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <GradientCard>
            <div className="px-8 py-14 sm:px-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-white/5 opacity-50" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to transform your workflow?
                </h2>
                <p className="text-slate-400 mb-8 max-w-lg mx-auto">
                  Join Synapse AI and unlock chat, documents, automation, and more — free to start.
                </p>
                <GradientButton size="lg" onClick={() => router.push('/register')}>
                  Create free account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </GradientButton>
              </div>
            </div>
          </GradientCard>
        </motion.div>
      </section>

      <SiteFooter />
    </SitePage>
  )
}
