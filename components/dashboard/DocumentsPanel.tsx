'use client'

import { useState } from 'react'
import { API_URL } from '@/lib/api-config'
import { Upload, FileText, Trash2, Download, Eye, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { formatDate, getFileIcon } from '@/lib/utils'

interface Document {
  id: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
}

export function DocumentsPanel() {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Project Documentation.pdf',
      size: 2048000,
      type: 'application/pdf',
      uploadedAt: new Date(),
      status: 'ready',
    },
    {
      id: '2',
      name: 'Meeting Notes.docx',
      size: 512000,
      type: 'application/docx',
      uploadedAt: new Date(),
      status: 'ready',
    },
  ])
  const [searchQuery, setSearchQuery] = useState('')

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
          // Upload to backend
          const formData = new FormData()
          formData.append('file', file)
          
          const response = await fetch(`${API_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
            body: formData,
          })
          
          if (!response.ok) throw new Error('Upload failed')
          
          const data = await response.json()
          
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id ? { ...doc, status: 'ready', id: data.document_id } : doc
            )
          )
          toast.success(`${file.name} processed successfully!`)
        } catch (error) {
          setDocuments((prev) =>
            prev.map((doc) =>
              doc.id === newDoc.id ? { ...doc, status: 'error' } : doc
            )
          )
          toast.error(`Failed to upload ${file.name}`)
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
          'Authorization': `Bearer ${token}`,
        },
      })
      
      if (response.ok) {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id))
        toast.success('Document deleted')
      } else {
        toast.error('Failed to delete document')
      }
    } catch (error) {
      toast.error('Failed to delete document')
    }
  }
  
  const handleDownload = (doc: Document) => {
    toast.success(`Downloading ${doc.name}...`)
  }
  
  const handleView = (doc: Document) => {
    toast.info(`Opening ${doc.name}...`)
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Documents</h1>
          <p className="text-muted-foreground text-lg">
            \ud83d\udcda Upload and manage your documents. AI will analyze and learn from them.
          </p>
        </motion.div>

        {/* Upload Area */}
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
              <p className="text-xs text-muted-foreground">
                Supports PDF, DOCX, TXT, MD, and more
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Documents List */}
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
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{getFileIcon(doc.name)}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{doc.name}</h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                              <span>{formatFileSize(doc.size)}</span>
                              <span>•</span>
                              <span>{formatDate(doc.uploadedAt)}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
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

        {/* Stats */}
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
              <div className="text-sm text-muted-foreground">Processed</div>
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
