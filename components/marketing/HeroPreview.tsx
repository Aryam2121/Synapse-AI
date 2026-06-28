'use client'

import { motion } from 'framer-motion'
import { Bot, Sparkles, Send } from 'lucide-react'

/** Decorative dashboard preview for the landing hero */
export function HeroPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      className="mt-16 max-w-3xl mx-auto"
    >
      <div className="animate-float">
      <div className="rounded-2xl p-[1px] bg-gradient-to-b from-white/20 via-violet-500/20 to-transparent shadow-2xl shadow-violet-950/50">
        <div className="rounded-2xl bg-[#12121a]/95 backdrop-blur-xl border border-white/5 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <span className="text-xs text-slate-500 ml-2">Synapse AI — Workspace</span>
          </div>
          <div className="p-5 space-y-4 min-h-[200px]">
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-600/30 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-violet-300" />
              </div>
              <div className="rounded-xl rounded-tl-sm bg-white/[0.04] border border-white/8 px-4 py-3 text-sm text-slate-300 max-w-[85%]">
                Hi! I can help with documents, code, tasks, and research. What would you like to work on?
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="rounded-xl rounded-tr-sm bg-violet-600/20 border border-violet-500/20 px-4 py-3 text-sm text-violet-100 max-w-[75%]">
                Summarize my uploaded PDF and list action items
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-600/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/8 px-4 py-3 text-sm text-slate-400 max-w-[85%]">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
              <span className="flex-1 text-sm text-slate-600">Message Synapse AI...</span>
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 flex items-center justify-center">
                <Send className="h-3.5 w-3.5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  )
}
