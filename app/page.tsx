'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Brain, Code, FileText, CheckSquare, Search, 
  Sparkles, ArrowRight, Users, Zap, Shield 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -inset-[10px] opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 sticky top-0 z-50 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="bg-gradient-to-br from-primary via-purple-500 to-pink-500 rounded-xl p-2 shadow-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Synapse AI</span>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <Button onClick={() => router.push('/login')} variant="ghost" size="lg" className="text-white hover:bg-white/10">
              Sign In
            </Button>
            <Button onClick={() => router.push('/register')} size="lg" className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white shadow-lg hover:shadow-xl transition-all">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 md:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/30 to-purple-500/30 backdrop-blur-xl text-white px-8 py-3 rounded-full mb-10 border border-white/20 shadow-2xl"
          >
            <Sparkles className="h-5 w-5 animate-pulse text-yellow-300" />
            <span className="text-sm font-bold tracking-wide">Your Intelligent Workspace, Unified</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-7xl md:text-9xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-pink-200 leading-tight drop-shadow-2xl"
          >
            Synapse AI
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-3xl text-slate-200 mb-12 leading-relaxed font-light"
          >
            Neural AI platform powered by <span className="text-primary font-bold">RAG</span>, 
            <span className="text-purple-400 font-bold"> LangChain</span>, and 
            <span className="text-pink-400 font-bold"> Multi-Agent Orchestration</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <Button 
              onClick={() => router.push('/dashboard')} 
              size="lg" 
              className="text-lg h-14 px-10 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white shadow-2xl hover:shadow-primary/50 hover:scale-105 transition-all font-bold"
            >
              Launch Workspace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              onClick={() => router.push('/docs')} 
              size="lg" 
              variant="outline" 
              className="text-lg h-14 px-10 border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 backdrop-blur-xl shadow-xl hover:scale-105 transition-all font-semibold"
            >
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 font-light">Everything you need in one intelligent platform</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="h-full hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl group">
                <CardContent className="p-8">
                  <div className="bg-gradient-to-br from-primary via-purple-500 to-pink-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-slate-300 leading-relaxed text-base">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Built for Everyone
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 font-light">From developers to students, professionals to teams</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            >
              <Card className="h-full border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:shadow-2xl hover:shadow-primary/20 transition-all">
                <CardContent className="p-8">
                  <div className="flex items-start gap-5">
                    <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-3xl font-bold mb-5 text-white">{useCase.title}</h3>
                      <ul className="space-y-3">
                        {useCase.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-slate-300">
                            <Sparkles className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                            <span className="text-base">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 rounded-3xl p-12 text-center text-primary-foreground shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)]" />
          <div className="relative z-10">
            <h2 className="text-5xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
            <p className="text-2xl mb-10 opacity-95">
              Join thousands of users working smarter with Synapse AI
            </p>
            <Button
              onClick={() => router.push('/dashboard')}
              size="lg"
              variant="secondary"
              className="text-lg shadow-xl hover:scale-105 transition-transform px-8 py-6"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Universal AI Workspace. Powered by cutting-edge AI technology.</p>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: <Brain className="h-6 w-6 text-primary" />,
    title: "RAG Knowledge Base",
    description: "Upload documents and code. Your AI learns from your personal knowledge base with intelligent retrieval.",
  },
  {
    icon: <Code className="h-6 w-6 text-primary" />,
    title: "Code Analysis",
    description: "Analyze entire codebases, find bugs, suggest improvements, and generate documentation automatically.",
  },
  {
    icon: <FileText className="h-6 w-6 text-primary" />,
    title: "Document Intelligence",
    description: "Summarize PDFs, extract insights, generate reports, and answer questions from your documents.",
  },
  {
    icon: <CheckSquare className="h-6 w-6 text-primary" />,
    title: "Task Management",
    description: "AI-powered task planning, scheduling, and productivity tracking with smart reminders.",
  },
  {
    icon: <Search className="h-6 w-6 text-primary" />,
    title: "Universal Search",
    description: "Search across all your documents, code, notes, and tasks with semantic understanding.",
  },
  {
    icon: <Users className="h-6 w-6 text-primary" />,
    title: "Multi-Agent System",
    description: "Specialized AI agents for code, documents, research, and productivity work together seamlessly.",
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Real-time Collaboration",
    description: "Work with your team in real-time with AI assistance for everyone.",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Private & Secure",
    description: "Your data stays yours. Local processing options and enterprise-grade security.",
  },
]

const useCases = [
  {
    icon: <Code className="h-8 w-8 text-primary" />,
    title: "For Developers",
    features: [
      "Read and analyze entire codebases",
      "Find bugs and suggest fixes",
      "Auto-generate documentation",
      "Code refactoring assistance",
      "Architecture recommendations",
    ],
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "For Students",
    features: [
      "Summarize textbooks and lectures",
      "Create study notes automatically",
      "Solve assignments with explanations",
      "Generate practice quizzes",
      "Personalized learning paths",
    ],
  },
  {
    icon: <Users className="h-8 w-8 text-primary" />,
    title: "For Professionals",
    features: [
      "Summarize long PDFs and emails",
      "Generate professional reports",
      "Create presentations quickly",
      "Extract action items from meetings",
      "Research assistance",
    ],
  },
  {
    icon: <Brain className="h-8 w-8 text-primary" />,
    title: "For Teams & Companies",
    features: [
      "Automated customer support",
      "Company-wide knowledge base",
      "Document compliance checking",
      "Employee AI assistant",
      "Team productivity insights",
    ],
  },
]
