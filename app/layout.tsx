import './globals.css'
import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Synapse AI - Your Intelligent Workspace',
  description: 'Neural AI platform powered by RAG, LangChain, and multi-agent orchestration',
  keywords: ['AI', 'Synapse', 'Neural Network', 'RAG', 'LangChain', 'Productivity', 'Intelligence'],
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={`${jakarta.className} ${inter.variable} ${jakarta.variable} antialiased`}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
          <ShadcnToaster />
        </Providers>
      </body>
    </html>
  )
}
