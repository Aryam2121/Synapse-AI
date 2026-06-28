'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  Sparkles,
  Bot,
  User,
  Copy,
  RotateCcw,
  Trash2,
  Download,
  Check,
  Square,
  FileText,
  Loader2,
  Pencil,
  X,
  MessageSquarePlus,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { TypingIndicator } from '@/components/ui/typing-indicator'
import { API_URL, API_ENDPOINTS } from '@/lib/api-config'
import { deleteConversation } from '@/components/dashboard/ConversationSidebar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  agent?: string
  attachments?: string[]
}

const CHAT_PROMPT_KEY = 'synapse_chat_pending_prompt'
const CHAT_MODEL_KEY = 'synapse_chat_model'

interface ChatModelOption {
  id: string
  name: string
  description?: string
}

interface ChatInterfaceProps {
  initialPrompt?: string
  conversationId?: string
  onConversationIdChange?: (id: string | undefined) => void
  onChatUpdated?: () => void
}

export function ChatInterface({
  initialPrompt,
  conversationId: externalConversationId,
  onConversationIdChange,
  onChatUpdated,
}: ChatInterfaceProps = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [attachedFiles, setAttachedFiles] = useState<File[]>([])
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false)
  const [conversationId, setConversationId] = useState<string | undefined>(externalConversationId)
  const [backendReady, setBackendReady] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [chatModels, setChatModels] = useState<ChatModelOption[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const setConvId = (id: string | undefined) => {
    setConversationId(id)
    onConversationIdChange?.(id)
  }

  useEffect(() => {
    setConversationId(externalConversationId)
  }, [externalConversationId])

  useEffect(() => {
    if (!externalConversationId) {
      setMessages([])
      return
    }
    const loadThread = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) return
      try {
        const res = await fetch(API_ENDPOINTS.CONVERSATION_MESSAGES(externalConversationId), {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        setMessages(
          (data.messages || []).map(
            (m: { id: string; role: string; content: string; created_at?: string }) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
              timestamp: m.created_at ? new Date(m.created_at) : new Date(),
              agent: m.role === 'assistant' ? 'Synapse AI' : undefined,
            })
          )
        )
      } catch {
        /* ignore */
      }
    }
    loadThread()
  }, [externalConversationId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const pending =
      initialPrompt ||
      (typeof window !== 'undefined' ? sessionStorage.getItem(CHAT_PROMPT_KEY) : null)
    if (pending) {
      setInput(pending)
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(CHAT_PROMPT_KEY)
      }
    }
  }, [initialPrompt])

  useEffect(() => {
    const loadModels = async () => {
      const token = localStorage.getItem('auth_token')
      const saved = typeof window !== 'undefined' ? localStorage.getItem(CHAT_MODEL_KEY) : null
      try {
        const res = await fetch(API_ENDPOINTS.CHAT_MODELS, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (res.ok) {
          const data = await res.json()
          const list = (data.models || []) as ChatModelOption[]
          setChatModels(list)
          const def = saved || data.default || list[0]?.id || ''
          setSelectedModel(def)
          if (def && typeof window !== 'undefined') localStorage.setItem(CHAT_MODEL_KEY, def)
        } else if (saved) {
          setSelectedModel(saved)
        }
      } catch {
        if (saved) setSelectedModel(saved)
      }
    }
    loadModels()
  }, [])

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    if (typeof window !== 'undefined') localStorage.setItem(CHAT_MODEL_KEY, modelId)
  }

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

  const uploadAttachments = async (files: File[], token: string): Promise<string[]> => {
    const ids: string[] = []
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API_URL}/api/documents/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const detail = typeof err.detail === 'string' ? err.detail : `Failed to upload ${file.name}`
        throw new Error(detail)
      }
      const data = await res.json()
      if (data.document_id) ids.push(data.document_id)
    }
    return ids
  }

  const runChat = async (
    messageContent: string,
    documentIds: string[],
    options?: { skipUserBubble?: boolean; attachmentNames?: string[] }
  ) => {
    const token = localStorage.getItem('auth_token')
    if (!token) throw new Error('Please log in to use chat')

    if (!options?.skipUserBubble) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
        attachments: options?.attachmentNames,
      }
      setMessages((prev) => [...prev, userMessage])
    }

    const assistantId = `assistant-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: 'assistant', content: '', timestamp: new Date(), agent: 'Synapse AI' },
    ])

    setIsLoading(true)
    setIsStreaming(true)
    abortRef.current = new AbortController()

    try {
      const response = await fetch(API_ENDPOINTS.CHAT_STREAM, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: messageContent,
          conversation_id: conversationId,
          document_ids: documentIds.length > 0 ? documentIds : undefined,
          model: selectedModel || undefined,
        }),
        signal: abortRef.current.signal,
      })

      if (!response.ok) {
        const errorText = await response.text()
        let detail = errorText
        try {
          const parsed = JSON.parse(errorText) as { detail?: string }
          if (typeof parsed.detail === 'string') detail = parsed.detail
        } catch {
          /* raw */
        }
        throw new Error(detail)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('Streaming not supported')

      const decoder = new TextDecoder()
      let buffer = ''
      let agentUsed = 'Synapse AI'

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const data = JSON.parse(payload) as {
              content?: string
              conversation_id?: string
              agent_used?: string
              error?: string
            }
            if (data.error) throw new Error(data.error)
            if (data.conversation_id) setConvId(data.conversation_id)
            if (data.agent_used) agentUsed = data.agent_used
            if (data.content) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: m.content + data.content, agent: agentUsed } : m
                )
              )
            }
          } catch (e) {
            if (e instanceof Error && e.message !== payload) throw e
          }
        }
      }

      setBackendReady(true)
      onChatUpdated?.()
    } catch (error: unknown) {
      const err = error as Error
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.content
              ? { ...m, content: '_Response stopped._' }
              : m
          )
        )
        return
      }
      setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `**Error:** ${err.message || 'Something went wrong'}`,
        timestamp: new Date(),
        agent: 'System',
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  const handleStop = () => {
    abortRef.current?.abort()
  }

  const truncateFromMessage = async (messageId: string) => {
    const token = localStorage.getItem('auth_token')
    if (!token || !conversationId) return
    const res = await fetch(API_ENDPOINTS.CONVERSATION_TRUNCATE(conversationId, messageId), {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(typeof err.detail === 'string' ? err.detail : 'Could not edit message')
    }
  }

  const handleSend = async () => {
    const hasText = input.trim().length > 0
    const hasFiles = attachedFiles.length > 0
    if ((!hasText && !hasFiles) || isLoading || isUploadingAttachments) return

    const attachmentNames = attachedFiles.map((f) => f.name)
    const messageContent = hasText
      ? input.trim()
      : `Please analyze the attached file(s): ${attachmentNames.join(', ')}`

    const filesToUpload = [...attachedFiles]
    const editId = editingMessageId
    setInput('')
    setAttachedFiles([])
    setEditingMessageId(null)

    try {
      const token = localStorage.getItem('auth_token')
      if (!token) throw new Error('Please log in to use chat')

      if (editId && conversationId) {
        const idx = messages.findIndex((m) => m.id === editId)
        await truncateFromMessage(editId)
        setMessages((prev) => (idx >= 0 ? prev.slice(0, idx) : prev))
      }

      let documentIds: string[] = []
      if (filesToUpload.length > 0) {
        setIsUploadingAttachments(true)
        try {
          documentIds = await uploadAttachments(filesToUpload, token)
        } finally {
          setIsUploadingAttachments(false)
        }
      }

      await runChat(messageContent, documentIds, { attachmentNames })
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message || 'Failed to send')
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
    if (isLoading) return
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUserMessage) return
    setMessages((prev) => {
      const copy = [...prev]
      if (copy.length && copy[copy.length - 1].role === 'assistant') copy.pop()
      return copy
    })
    try {
      await runChat(lastUserMessage.content, [], { skipUserBubble: true })
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Regenerate failed')
    }
  }

  const handleClearChat = () => {
    setMessages([])
    setConvId(undefined)
    toast.success('New chat')
  }

  const handleDeleteConversation = async () => {
    if (!conversationId) {
      handleClearChat()
      return
    }
    if (!window.confirm('Delete this conversation permanently? This cannot be undone.')) return

    setIsLoading(true)
    const result = await deleteConversation(conversationId)
    setIsLoading(false)

    if (result.ok) {
      setMessages([])
      setConvId(undefined)
      onConversationIdChange?.(undefined)
      onChatUpdated?.()
      toast.success('Chat deleted')
    } else {
      toast.error(result.error || 'Could not delete chat')
    }
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
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      <ScrollArea className="flex-1 custom-scrollbar" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[45vh] text-center px-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 border border-violet-500/20 flex items-center justify-center mb-5">
                <Sparkles className="h-7 w-7 text-violet-300" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">How can I help you today?</h2>
              <p className="text-sm text-slate-400 max-w-md mb-8">
                Ask anything, attach documents, or paste code. Conversations are saved in the sidebar.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {[
                  'Summarize my documents',
                  'Help me debug code',
                  'Create a task list',
                  'Explain a complex topic',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setInput(prompt)}
                    className="text-left text-sm px-4 py-3 rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 hover:text-white hover:border-violet-500/30 hover:bg-violet-500/10 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-4 ${message.role === 'user' ? 'bg-violet-600/10 border border-violet-500/15 rounded-2xl p-4' : 'bg-white/[0.02] border border-white/5 rounded-2xl p-4'}`}
              >
                <Avatar className={`h-8 w-8 shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600' 
                    : 'bg-gradient-to-br from-emerald-600 to-teal-600'
                }`}>
                  <AvatarFallback className="bg-transparent text-white">
                    {message.role === 'user' ? (
                      <User className="h-5 w-5" />
                    ) : (
                      <Bot className="h-5 w-5" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className={`flex-1 min-w-0 ${message.role === 'user' ? '' : 'pb-2'}`}>
                  {message.agent && (
                    <div className="flex items-center gap-1 text-xs mb-2 opacity-70">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      <span className="font-medium">{message.agent}</span>
                    </div>
                  )}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {message.attachments.map((name) => (
                        <span
                          key={name}
                          className="inline-flex items-center gap-1 text-xs bg-black/20 px-2 py-0.5 rounded"
                        >
                          <FileText className="h-3 w-3" />
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="chat-prose prose prose-sm dark:prose-invert max-w-none">
                    {message.content ? (
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
                    ) : message.role === 'assistant' && isLoading ? (
                      <TypingIndicator />
                    ) : null}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
                    <div className="text-xs opacity-50">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    <div className="flex gap-1">
                      {message.role === 'user' && !isLoading && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setEditingMessageId(message.id)
                            setInput(message.content)
                            toast.info('Edit your message below, then send')
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
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
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      <div className="border-t border-white/8 p-4 bg-[#0c0c14]/90 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto space-y-2">
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
                disabled={isLoading || messages.length === 0}
                className="h-8 text-xs"
              >
                <MessageSquarePlus className="h-3 w-3 mr-1" />
                New chat
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteConversation}
                disabled={isLoading}
                className="h-8 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete chat
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

          {editingMessageId && (
            <div className="flex items-center justify-between text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
              <span>Editing message — sending will replace this and following replies</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2"
                onClick={() => {
                  setEditingMessageId(null)
                  setInput('')
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          <div className="flex items-center gap-2 px-1">
            {chatModels.length > 0 && selectedModel && (
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="h-8 w-[200px] text-xs bg-white/[0.04] border-white/10">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {chatModels.map((m) => (
                    <SelectItem key={m.id} value={m.id} className="text-xs">
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/20 focus-within:border-violet-500/30 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
            {/* Attachments Preview */}
            {attachedFiles.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded text-xs">
                    <FileText className="h-3 w-3" />
                    <span>{file.name}</span>
                    <button type="button" onClick={() => removeAttachment(i)} className="hover:text-destructive" aria-label={`Remove ${file.name}`}>×</button>
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
                accept=".pdf,.doc,.docx,.txt,.md"
                aria-label="Attach document"
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
              
              <div className="flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    editingMessageId
                      ? 'Edit your message...'
                      : 'Message Synapse AI... (Shift+Enter for new line)'
                  }
                  className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 bg-transparent text-base"
                  disabled={isLoading}
                />
              </div>
              {isStreaming ? (
                <Button
                  onClick={handleStop}
                  size="icon"
                  variant="destructive"
                  className="h-10 w-10 rounded-xl"
                  title="Stop generating"
                >
                  <Square className="h-4 w-4 fill-current" />
                </Button>
              ) : (
                <Button
                  onClick={handleSend}
                  disabled={(!input.trim() && attachedFiles.length === 0) || isLoading || isUploadingAttachments}
                  size="icon"
                  className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 h-10 w-10 rounded-xl disabled:opacity-40 shadow-md shadow-violet-900/30"
                  title={isUploadingAttachments ? 'Uploading file...' : 'Send'}
                >
                  {isUploadingAttachments || isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
            {attachedFiles.length > 0 && !isUploadingAttachments && (
              <p className="text-xs text-slate-400 px-3 pb-2">
                {attachedFiles.length} file(s) attached — will be included when you send
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
