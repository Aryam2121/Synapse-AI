'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Upload, FileText, Trash2, Download, Search, Sparkles, MessageSquare, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { formatDate, getFileIcon } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

interface Document {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
}

interface AnalyzeResult {
  summary: string
  insights: string
  word_count: number
  filename: string
}

interface DocumentsPanelProps {
  onAnalyzeInChat?: (prompt: string) => void
}

export function DocumentsPanel({ onAnalyzeInChat }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [analyzingId, setAnalyzingId] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null)

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await fetch(`${API_URL}/api/documents`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!response.ok) return
        const data = await response.json()
        const list = (data.documents || []).map(
          (doc: {
            id: string
            filename?: string
            name?: string
            size?: number
            file_type?: string
            created_at?: string
            status?: string
          }) => ({
            id: doc.id,
            name: doc.filename || doc.name || 'Document',
            size: doc.size || 0,
            type: doc.file_type || 'application/octet-stream',
            uploadedAt: doc.created_at ? new Date(doc.created_at) : new Date(),
            status: (doc.status as Document['status']) || 'ready',
          })
        )
        setDocuments(list)
      } catch {
        // Keep empty list if API unavailable
      }
    }
    loadDocuments()
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles) => {
      const token = localStorage.getItem('auth_token')

      for (const file of acceptedFiles) {
        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          status: 'processing',
        }
        setDocuments((prev) => [newDoc, ...prev])

        try {
          const formData = new FormData()
          formData.append('file', file)

          const response = await fetch(`${API_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          })

          if (!response.ok) {
            const err = await response.json().catch(() => ({}))
            const detail = typeof err.detail === 'string' ? err.detail : 'Upload failed'
            throw new Error(detail)
          }

          const data = await response.json()

          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id ? { ...doc, status: 'ready', id: data.document_id } : doc
            )
          )
          const ragNote = data.rag_indexed
            ? ' Indexed for Chat search.'
            : ' Use Analyze below to learn from it.'
          toast.success(`${file.name} uploaded.${ragNote}`)
        } catch (error) {
          setDocuments((prev) =>
            prev.map((doc) => (doc.id === newDoc.id ? { ...doc, status: 'error' } : doc))
          )
          const message = error instanceof Error ? error.message : 'Upload failed'
          toast.error(`Failed to upload ${file.name}: ${message}`)
        }
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
  })

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/documents/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        if (analysis) setAnalysis(null)
        toast.success('Document deleted')
      } else {
        toast.error('Failed to delete document')
      }
    } catch {
      toast.error('Failed to delete document')
    }
  }

  const handleAnalyze = async (doc: Document) => {
    if (doc.status !== 'ready') return
    setAnalyzingId(doc.id)
    setAnalysis(null)

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/documents/${doc.id}/analyze`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const detail = typeof data.detail === 'string' ? data.detail : 'Analysis failed'
        throw new Error(detail)
      }

      setAnalysis({
        summary: data.summary,
        insights: data.insights,
        word_count: data.word_count,
        filename: data.filename || doc.name,
      })
      toast.success('Analysis complete')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed'
      toast.error(message)
    } finally {
      setAnalyzingId(null)
    }
  }

  const openInChat = (docName: string) => {
    const prompt = `I uploaded "${docName}". Please answer questions about it and help me learn the key ideas.`
    if (onAnalyzeInChat) {
      onAnalyzeInChat(prompt)
      toast.info('Opening Chat — press Send to start')
    } else {
      toast.info('Open Chat in the sidebar to ask questions about your documents.')
    }
  }

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="h-full p-6 overflow-auto bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Documents
          </h1>
          <p className="text-muted-foreground text-lg">
            Upload files here, then use <strong>Analyze</strong> to summarize and learn, or{' '}
            <strong>Chat</strong> to ask questions about them.
          </p>
        </motion.div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">How to learn from your upload</p>
                <p className="text-sm text-muted-foreground">
                  1. Wait for status <Badge variant="default" className="mx-1">ready</Badge>
                  2. Click <strong>Analyze</strong> for a summary and takeaways
                  3. Use <strong>Ask in Chat</strong> for Q&amp;A anytime
                </p>
              </div>
            </div>
            {onAnalyzeInChat && (
              <Button variant="outline" size="sm" onClick={() => onAnalyzeInChat('Help me understand my uploaded documents.')}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Chat
              </Button>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <Card className="border-primary/40">
            <CardHeader className="flex flex-row items-start justify-between gap-2">
              <div>
                <CardTitle className="text-lg">Analysis: {analysis.filename}</CardTitle>
                <CardDescription>{analysis.word_count.toLocaleString()} words extracted</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setAnalysis(null)} aria-label="Close analysis">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Key takeaways &amp; questions</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <ReactMarkdown>{analysis.insights}</ReactMarkdown>
                </div>
              </div>
              {onAnalyzeInChat && (
                <Button onClick={() => openInChat(analysis.filename)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Continue in Chat
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop files here' : 'Upload Documents'}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drag & drop files here, or click to browse
              </p>
              <p className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT, MD</p>
            </div>
          </CardContent>
        </Card>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Documents ({filteredDocs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredDocs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No documents found</p>
                  </div>
                ) : (
                  filteredDocs.map((doc, index) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-4 hover:bg-accent transition-colors">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-4xl">{getFileIcon(doc.name)}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{doc.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>{formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                doc.status === 'ready'
                                  ? 'default'
                                  : doc.status === 'processing'
                                    ? 'secondary'
                                    : 'destructive'
                              }
                            >
                              {doc.status}
                            </Badge>
                            <Button
                              size="sm"
                              disabled={doc.status !== 'ready' || analyzingId === doc.id}
                              onClick={() => handleAnalyze(doc)}
                            >
                              {analyzingId === doc.id ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4 mr-1" />
                              )}
                              Analyze
                            </Button>
                            {onAnalyzeInChat && doc.status === 'ready' && (
                              <Button variant="outline" size="sm" onClick={() => openInChat(doc.name)}>
                                <MessageSquare className="h-4 w-4 mr-1" />
                                Ask in Chat
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" title="Download (coming soon)">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-sm text-muted-foreground">Total Documents</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {documents.filter((d) => d.status === 'ready').length}
              </div>
              <div className="text-sm text-muted-foreground">Ready to analyze</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
              </div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
