'use client'

import { motion } from 'framer-motion'
import { Upload, MessageSquare, Sparkles, Star } from 'lucide-react'
import { GlassCard, SectionHeading } from './SiteShell'

const stats = [
  { value: '17+', label: 'AI tools' },
  { value: 'RAG', label: 'Knowledge base' },
  { value: 'Groq', label: 'Fast inference' },
  { value: 'Free', label: 'To start' },
]

const steps = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload & connect',
    description: 'Sign in with Google or email. Upload PDFs, docs, and code to your workspace.',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'AI learns your context',
    description: 'RAG indexes your content so every answer is grounded in what you actually uploaded.',
  },
  {
    icon: MessageSquare,
    step: '03',
    title: 'Chat, automate, collaborate',
    description: 'Use 17+ panels — chat, tasks, search, scheduling, and real-time collab in one place.',
  },
]

const testimonials = [
  {
    quote: 'Finally one workspace for docs, code, and chat. The RAG answers actually cite my uploads.',
    name: 'Alex M.',
    role: 'Software engineer',
  },
  {
    quote: 'Smart scheduling and task panels keep my week organized. Google sign-in took seconds.',
    name: 'Priya K.',
    role: 'Product manager',
  },
  {
    quote: 'Uploaded lecture PDFs and got study summaries in minutes. Perfect for students.',
    name: 'Jordan L.',
    role: 'Grad student',
  },
]

export function StatsBar() {
  return (
    <section className="relative z-10 border-y border-white/8 bg-white/[0.02]">
      <div className="container mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
      <SectionHeading
        badge="How it works"
        title="Up and running in minutes"
        subtitle="No complex setup — create an account and start chatting with your data."
      />
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="relative"
          >
            <GlassCard className="p-6 h-full">
              <span className="text-xs font-mono text-violet-500/80 mb-4 block">{s.step}</span>
              <div className="h-11 w-11 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mb-4">
                <s.icon className="h-5 w-5 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.description}</p>
            </GlassCard>
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-gradient-to-r from-violet-500/50 to-transparent" />
            )}
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section className="container mx-auto px-4 sm:px-6 py-20 relative z-10">
      <SectionHeading
        badge="Community"
        title="Loved by builders & learners"
        subtitle="See why teams choose Synapse AI as their daily workspace."
      />
      <div className="grid md:grid-cols-3 gap-5 max-w-6xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <GlassCard hover className="p-6 h-full flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-5 pt-4 border-t border-white/8">
                <p className="text-sm font-medium text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
