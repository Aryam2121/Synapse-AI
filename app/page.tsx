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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary rounded-lg p-2">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Synapse AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => router.push('/login')} variant="ghost" size="lg">
              Sign In
            </Button>
            <Button onClick={() => router.push('/register')} size="lg">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/20 to-purple-500/20 backdrop-blur-sm text-primary px-6 py-2 rounded-full mb-8 border border-primary/20"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-semibold">Your Intelligent Workspace, Unified</span>
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-500 to-pink-500 animate-gradient">
            Synapse AI
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Neural AI platform powered by <span className="text-primary font-semibold">RAG</span>, 
            <span className="text-primary font-semibold"> LangChain</span>, and 
            <span className="text-primary font-semibold"> Multi-Agent Orchestration</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/dashboard')} size="lg" className="text-lg">
              Launch Workspace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button onClick={() => router.push('/docs')} size="lg" variant="outline" className="text-lg">
              Learn More
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground">Everything you need in one intelligent platform</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm group">
                <CardContent className="p-6">
                  <div className="bg-gradient-to-br from-primary/20 to-purple-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">Built for Everyone</h2>
          <p className="text-xl text-muted-foreground">From developers to students, professionals to teams</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      {useCase.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold mb-3">{useCase.title}</h3>
                      <ul className="space-y-2">
                        {useCase.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 text-muted-foreground">
                            <Sparkles className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                            <span>{feature}</span>
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
