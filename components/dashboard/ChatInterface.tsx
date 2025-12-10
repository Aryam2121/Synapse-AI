'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Sparkles, Bot, User, Copy, RotateCcw, Trash2, Download, Check, Mic, StopCircle, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { API_URL } from '@/lib/api-config'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agent?: string
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 **Welcome to Synapse AI!**\n\nI\'m your intelligent assistant powered by advanced AI. I can help you with:\n\n✨ **Document Intelligence** - Analyze, summarize, and extract insights\n💻 **Code Analysis** - Review, debug, and improve your code\n✅ **Task Management** - Plan, organize, and track your work\n🔍 **Research Assistant** - Find information and answer questions\n📊 **Data Insights** - Analyze and visualize your data\n\n⚠️ **Note:** First message may take 30-60s as the backend wakes up (Render free tier).\n\nWhat would you like to work on today?',
      timestamp: new Date(),
      agent: 'Synapse AI',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [backendReady, setBackendReady] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Wake up backend on mount
  useEffect(() => {
    const wakeBackend = async () => {
      try {
        console.log('Waking up backend...')
        const response = await fetch(`${API_URL}/health`, { 
          method: 'GET',
          signal: AbortSignal.timeout(10000) // 10s timeout for health check
        })
        if (response.ok) {
          console.log('Backend is ready!')
          setBackendReady(true)
        }
      } catch (error) {
        console.log('Backend is waking up, may take 30-60s...')
        // Retry after 5 seconds
        setTimeout(wakeBackend, 5000)
      }
    }
    wakeBackend()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    const messageContent = input
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Get auth token
      const token = localStorage.getItem('auth_token')
      
      if (!token) {
        throw new Error('Please log in to use chat')
      }

      // Show warning if backend might be cold starting
      if (!backendReady) {
        const warmupMessage: Message = {
          id: Date.now().toString() + '-warmup',
          role: 'assistant',
          content: '⏳ **Backend is starting up...**\n\nRender free tier requires 30-60 seconds to wake up from sleep. Please wait...',
          timestamp: new Date(),
          agent: 'System',
        }
        setMessages((prev) => [...prev, warmupMessage])
      }

      // Call backend API with extended timeout for cold starts
      console.log('Sending chat request to backend:', API_URL)
      const controller = new AbortController()
      const timeout = backendReady ? 60000 : 120000 // 2 minutes for cold start
      const timeoutId = setTimeout(() => {
        console.log('Request timeout - aborting')
        controller.abort()
      }, timeout)
      
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageContent,
        }),
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Backend error:', errorText)
        throw new Error(`Failed to get response: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      
      // Remove warmup message if it exists
      setMessages((prev) => prev.filter(m => !m.id.includes('-warmup')))
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        agent: data.agent_used,
      }
      
      setMessages((prev) => [...prev, aiMessage])
      setBackendReady(true) // Backend is definitely ready now
    } catch (error: any) {
      console.error('Chat error:', error)
      
      // Remove warmup message if it exists
      setMessages((prev) => prev.filter(m => !m.id.includes('-warmup')))
      
      let errorContent = '❌ **Error:** '
      
      if (error.name === 'AbortError') {
        if (backendReady) {
          errorContent += 'Request timeout (60s)\n\nGroq API is not responding. Possible reasons:\n\n1. **Groq API Key Not Set on Render**\n   - Check environment variables in Render dashboard\n   - Should be: GROQ_API_KEY=gsk_0ashmi...\n\n2. **Groq API Rate Limited**\n   - Check your Groq dashboard usage\n\n3. **Backend Processing Issue**\n   - Check Render logs for errors\n\n**Debug:** Visit ' + API_URL + '/api/config-check'
        } else {
          errorContent += 'Backend cold start timeout (2 minutes)\n\nRender free tier is taking too long to wake up.\n\n**Solutions:**\n- Wait another minute and try again\n- Check Render dashboard for deployment status\n- Verify backend is not crashed\n\n**Backend URL:** ' + API_URL
        }
      } else if (error.message.includes('Failed to fetch')) {
        errorContent += 'Cannot connect to backend\n\n**Check:**\n- Backend URL: ' + API_URL + '\n- Render service is running\n- Internet connection active\n- No firewall blocking\n\n**Visit:** ' + API_URL + '/health'
      } else if (error.message.includes('401')) {
        errorContent += 'Authentication failed\n\nYour session expired. Please log out and log back in.'
      } else {
        errorContent += error.message + '\n\n**Troubleshooting:**\n1. Check Render logs for backend errors\n2. Verify GROQ_API_KEY environment variable\n3. Visit: ' + API_URL + '/api/config-check\n4. Check Groq dashboard for API usage'
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        agent: 'System',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content)
    setCopiedId(id)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleRegenerate = async () => {
    if (messages.length < 2) return
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()
    if (lastUserMessage) {
      // Remove last AI response
      setMessages(prev => prev.slice(0, -1))
      // Resend last user message
      setInput(lastUserMessage.content)
      setTimeout(() => handleSend(), 100)
    }
  }

  const handleClearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: '👋 **Welcome back!** How can I help you today?',
        timestamp: new Date(),
        agent: 'Synapse AI',
      },
    ])
    toast.success('Chat cleared')
  }

  const handleExportChat = () => {
    const chatText = messages
      .map(m => `[${m.timestamp.toLocaleTimeString()}] ${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synapse-chat-${Date.now()}.txt`
    a.click()
    toast.success('Chat exported!')
  }

  const handleVoiceInput = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const mediaRecorder = new MediaRecorder(stream)
        mediaRecorderRef.current = mediaRecorder
        
        const chunks: BlobPart[] = []
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
        
        mediaRecorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'audio/webm' })
          toast.success('Voice recorded! (Transcription coming soon)')
          stream.getTracks().forEach(track => track.stop())
        }
        
        mediaRecorder.start()
        setIsRecording(true)
        toast.info('Recording... Click again to stop')
      } catch (error) {
        toast.error('Microphone access denied')
      }
    } else {
      mediaRecorderRef.current?.stop()
      setIsRecording(false)
    }
  }

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachedFiles(prev => [...prev, ...files])
    toast.success(`${files.length} file(s) attached`)
  }

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index))
    toast.success('Attachment removed')
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900/50 via-slate-800/30 to-slate-900/50 backdrop-blur-sm">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-8 custom-scrollbar" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className={`h-10 w-10 shadow-lg ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500' 
                    : 'bg-gradient-to-br from-primary to-purple-600'
                }`}>
                  <AvatarFallback className="bg-transparent text-white">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <Card
                  className={`flex-1 max-w-[80%] p-5 shadow-2xl transition-all duration-300 hover:shadow-primary/20 border-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary via-purple-500 to-pink-500 text-white'
                      : 'bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl text-slate-100'
                  }`}
                >
                  {message.agent && (
                    <div className="flex items-center gap-1 text-xs mb-2 opacity-70">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span className="font-medium">{message.agent}</span>
                    </div>
                  )}
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        code(props) {
                          const { children, className, ...rest } = props
                          const match = /language-(\w+)/.exec(className || '')
                          return match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...rest}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                    <div className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleCopy(message.content, message.id)}
                    >
                      {copiedId === message.id ? (
                        <Check className="h-3 w-3 mr-1" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedId === message.id ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <Avatar className="h-10 w-10 bg-gradient-to-br from-primary to-purple-600 shadow-lg">
                <AvatarFallback className="bg-transparent text-white">
                  <Bot className="h-5 w-5 animate-pulse" />
                </AvatarFallback>
              </Avatar>
              <Card className="p-4 bg-gradient-to-br from-card to-card/50 backdrop-blur-xl border-border/50 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4 bg-gradient-to-t from-background to-background/50 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Action Buttons */}
          <div className="flex items-center justify-between px-2">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerate}
                disabled={isLoading || messages.length < 2}
                className="h-8 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Regenerate
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                disabled={isLoading}
                className="h-8 text-xs"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportChat}
              disabled={messages.length < 2}
              className="h-8 text-xs"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>

          <Card className="p-3 shadow-xl border-2 border-border/50 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
            {/* Attachments Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-xs">
                    <Image className="h-3 w-3" />
                    <span>{file.name}</span>
                    <button onClick={() => removeAttachment(i)} className="hover:text-destructive">×</button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-2 items-end">
              <input
                type="file"
                id="file-upload"
                multiple
                className="hidden"
                onChange={handleFileAttach}
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="hover:bg-primary/10 transition-colors"
                disabled={isLoading}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Paperclip className="h-5 w-5" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                className={`hover:bg-primary/10 transition-colors ${isRecording ? 'text-destructive animate-pulse' : ''}`}
                disabled={isLoading}
                onClick={handleVoiceInput}
              >
                {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="✨ Ask anything... (Shift+Enter for new line)"
                  className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 bg-transparent text-base"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg h-10 w-10 transition-all hover:scale-105"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground px-2">
              <span className="flex items-center gap-2">
                <Sparkles className="h-3 w-3" />
                <span>Powered by Synapse AI</span>
                {isRecording && <span className="text-destructive animate-pulse">● Recording</span>}
              </span>
              <span>{input.length} / 4000</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
