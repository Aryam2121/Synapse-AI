'use client'

import { useState } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Download,
  FileJson,
  FileText,
  FileSpreadsheet,
  Clock,
  CheckCircle,
  Calendar
} from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export function DataExportPanel() {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['conversations'])
  const [format, setFormat] = useState('json')
  const [isExporting, setIsExporting] = useState(false)

  const dataTypes = [
    { id: 'conversations', label: 'Conversations', description: 'All chat history with AI agents' },
    { id: 'documents', label: 'Documents', description: 'Uploaded and processed documents' },
    { id: 'tasks', label: 'Tasks', description: 'All tasks and their status' },
    { id: 'code_analyses', label: 'Code Analyses', description: 'Code quality reports and insights' },
  ]

  const formats = [
    { value: 'json', label: 'JSON', icon: FileJson, description: 'Machine-readable format' },
    { value: 'csv', label: 'CSV', icon: FileSpreadsheet, description: 'Spreadsheet-compatible' },
    { value: 'markdown', label: 'Markdown', icon: FileText, description: 'Human-readable documentation' },
    { value: 'pdf', label: 'PDF', icon: FileText, description: 'Professional report format' },
  ]

  const templates = [
    {
      id: 'weekly-report',
      name: 'Weekly Activity Report',
      description: 'Last week\'s activities in markdown',
      popular: true
    },
    {
      id: 'backup-all',
      name: 'Complete Backup',
      description: 'Full backup of all data',
      popular: true
    },
    {
      id: 'project-summary',
      name: 'Project Summary',
      description: 'Project overview document',
      popular: false
    }
  ]

  const exportHistory = [
    {
      id: 'export-1',
      format: 'json',
      types: ['conversations', 'tasks'],
      date: '2024-12-03T10:00:00Z',
      size: '1.5 MB',
      status: 'completed'
    },
    {
      id: 'export-2',
      format: 'markdown',
      types: ['conversations'],
      date: '2024-12-02T15:30:00Z',
      size: '0.8 MB',
      status: 'completed'
    }
  ]

  const handleExport = async () => {
    if (selectedTypes.length === 0) {
      toast.error('Please select at least one data type')
      return
    }

    setIsExporting(true)
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${API_URL}/api/export/full-export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          format,
          data_types: selectedTypes,
          include_metadata: true
        })
      })

      if (res.ok) {
        const data = await res.json()
        toast.success('Export created successfully!', {
          description: 'Your download will start shortly',
          action: {
            label: 'Download',
            onClick: () => window.open(data.download_url, '_blank')
          }
        })
      } else {
        toast.error('Export failed')
      }
    } catch (error) {
      toast.error('Failed to create export')
    } finally {
      setIsExporting(false)
    }
  }

  const toggleType = (typeId: string) => {
    setSelectedTypes(prev =>
      prev.includes(typeId)
        ? prev.filter(t => t !== typeId)
        : [...prev, typeId]
    )
  }

  const getFormatIcon = (format: string) => {
    const fmt = formats.find(f => f.value === format)
    return fmt ? fmt.icon : FileJson
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Download className="h-8 w-8 text-primary" />
            Data Export & Backup
          </h1>
          <p className="text-muted-foreground">
            Export your data in various formats for backup, analysis, or migration
          </p>
        </div>

        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Create Export</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Data Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Data</CardTitle>
                  <CardDescription>Choose what to include in your export</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dataTypes.map((type) => (
                    <div key={type.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={type.id}
                        checked={selectedTypes.includes(type.id)}
                        onCheckedChange={() => toggleType(type.id)}
                      />
                      <div className="space-y-1 leading-none">
                        <Label htmlFor={type.id} className="font-medium cursor-pointer">
                          {type.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Format Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Format</CardTitle>
                  <CardDescription>Choose your preferred file format</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={format} onValueChange={setFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formats.map((fmt) => (
                        <SelectItem key={fmt.value} value={fmt.value}>
                          <div className="flex items-center gap-2">
                            <fmt.icon className="h-4 w-4" />
                            {fmt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {formats.map((fmt) => (
                    fmt.value === format && (
                      <motion.div
                        key={fmt.value}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-muted rounded-lg"
                      >
                        <p className="text-sm text-muted-foreground">{fmt.description}</p>
                      </motion.div>
                    )
                  ))}

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleExport}
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Creating Export...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Create Export
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Export Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Secure Export</p>
                      <p className="text-sm text-muted-foreground">End-to-end encrypted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">7-Day Access</p>
                      <p className="text-sm text-muted-foreground">Download anytime</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Schedule Exports</p>
                      <p className="text-sm text-muted-foreground">Automatic backups</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{template.name}</span>
                      {template.popular && <Badge variant="secondary">Popular</Badge>}
                    </CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {exportHistory.map((exp, index) => {
              const Icon = getFormatIcon(exp.format)
              return (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {exp.types.join(', ')} export
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{new Date(exp.date).toLocaleDateString()}</span>
                              <span>•</span>
                              <span>{exp.size}</span>
                              <span>•</span>
                              <Badge variant="outline" className="capitalize">
                                {exp.format}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
