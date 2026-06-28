import Link from 'next/link'
import { ArrowLeft, Home } from 'lucide-react'
import {
  SitePage,
  SiteHeader,
  SiteFooter,
  GlassCard,
  GradientButton,
} from '@/components/marketing/SiteShell'

export default function NotFound() {
  return (
    <SitePage>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-20 relative z-10">
        <GlassCard className="max-w-md w-full p-10 text-center">
          <p className="text-7xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-2">
            404
          </p>
          <h1 className="text-xl font-semibold text-white mb-2">Page not found</h1>
          <p className="text-sm text-slate-400 mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <GradientButton asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go home
              </Link>
            </GradientButton>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-11 px-6 rounded-xl border border-white/15 text-sm text-slate-300 hover:bg-white/8 transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </div>
        </GlassCard>
      </main>
      <SiteFooter />
    </SitePage>
  )
}
