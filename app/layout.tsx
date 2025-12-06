import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Synapse AI - Your Intelligent Workspace, Unified',
  description: 'Neural AI platform powered by RAG, LangChain, and multi-agent orchestration',
  keywords: ['AI', 'Synapse', 'Neural Network', 'RAG', 'LangChain', 'Productivity', 'Intelligence'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
