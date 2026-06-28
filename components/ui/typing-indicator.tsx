export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/8">
      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  )
}
