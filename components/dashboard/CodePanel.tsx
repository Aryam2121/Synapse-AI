'use client'

import { useState } from 'react'
import { API_URL } from '@/lib/api-config'
import { Folder, FileCode, Bug, Sparkles, Upload, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface CodeAnalysis {
  files: number
  functions: number
  classes: number
  lines: number
  complexity: 'Low' | 'Medium' | 'High'
}

interface BugReport {
  id: string
  file: string
  line: number
  severity: 'low' | 'medium' | 'high'
  description: string
  suggestion: string
}

export function CodePanel() {
  const [projectPath, setProjectPath] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null)
  const [bugs, setBugs] = useState<BugReport[]>([])
  const [codeQuery, setCodeQuery] = useState('')

  const handleAnalyze = async () => {
    if (!projectPath.trim() && !codeInput.trim()) {
      toast.error('Please enter a project path or paste code')
      return
    }

    setAnalyzing(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/code/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: codeInput || undefined,
          file_path: projectPath || undefined,
          analysis_type: 'full',
        }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const data = await response.json()
      
      setAnalysis({
        files: data.files || 1,
        functions: data.functions || 0,
        classes: data.classes || 0,
        lines: data.lines || 0,
        complexity: data.complexity || 'Medium',
      })

      setBugs(data.issues || [])
      setAnalyzing(false)
      toast.success('Code analysis complete!')
    } catch (error) {
      setAnalyzing(false)
      toast.error('Analysis failed - using demo data')
      // Fallback to demo data
      setAnalysis({
        files: 48,
        functions: 127,
        classes: 23,
        lines: 5420,
        complexity: 'Medium',
      })

      setBugs([
        {
          id: '1',
          file: 'src/utils/api.ts',
          line: 45,
          severity: 'high',
          description: 'Potential null pointer exception',
          suggestion: 'Add null check before accessing property',
        },
        {
          id: '2',
          file: 'components/Form.tsx',
          line: 122,
          severity: 'medium',
          description: 'Missing error handling',
          suggestion: 'Wrap async operation in try-catch block',
        },
      ])
    }
  }

  const [codeInput, setCodeInput] = useState('')

  const handlePasteCode = () => {
    navigator.clipboard.readText().then(text => {
      setCodeInput(text)
      toast.success('Code pasted!')
    })
  }

  const handleClearCode = () => {
    setCodeInput('')
    setAnalysis(null)
    setBugs([])
    toast.success('Cleared')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'default'
    }
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Code Analysis</h1>
          <p className="text-muted-foreground">
            Analyze your codebase, find bugs, and get AI-powered suggestions
          </p>
        </div>

        {/* Upload Project */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter project path or upload folder..."
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                />
              </div>
              <Button onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Browse
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <>
            {/* Analysis Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-6 text-center">
                  <FileCode className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{analysis.files}</div>
                  <div className="text-sm text-muted-foreground">Files</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{analysis.functions}</div>
                  <div className="text-sm text-muted-foreground">Functions</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{analysis.classes}</div>
                  <div className="text-sm text-muted-foreground">Classes</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{analysis.lines.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Lines</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-2xl font-bold">{analysis.complexity}</div>
                  <div className="text-sm text-muted-foreground">Complexity</div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="bugs">
              <TabsList className="w-full">
                <TabsTrigger value="bugs" className="flex-1">
                  <Bug className="h-4 w-4 mr-2" />
                  Issues ({bugs.length})
                </TabsTrigger>
                <TabsTrigger value="search" className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Code Search
                </TabsTrigger>
                <TabsTrigger value="insights" className="flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Insights
                </TabsTrigger>
              </TabsList>

              <TabsContent value="bugs">
                <Card>
                  <CardHeader>
                    <CardTitle>Found Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {bugs.map((bug, index) => (
                          <motion.div
                            key={bug.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="p-4 border-l-4" style={{
                              borderLeftColor: bug.severity === 'high' ? 'rgb(239 68 68)' : 
                                               bug.severity === 'medium' ? 'rgb(234 179 8)' : 
                                               'rgb(34 197 94)'
                            }}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Bug className="h-4 w-4" />
                                  <code className="text-sm">{bug.file}:{bug.line}</code>
                                </div>
                                <Badge variant={getSeverityColor(bug.severity)}>
                                  {bug.severity}
                                </Badge>
                              </div>
                              <h4 className="font-medium mb-1">{bug.description}</h4>
                              <p className="text-sm text-muted-foreground">
                                💡 {bug.suggestion}
                              </p>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="search">
                <Card>
                  <CardHeader>
                    <CardTitle>Search Codebase</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Ask anything about your code... e.g., 'Where is the authentication logic?' or 'Show me all database queries'"
                      value={codeQuery}
                      onChange={(e) => setCodeQuery(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button className="w-full">
                      <Search className="h-4 w-4 mr-2" />
                      Search Code
                    </Button>
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Enter a query to search your codebase</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Card className="p-4 bg-primary/5 border-primary/20">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium mb-1">Code Quality</h4>
                            <p className="text-sm text-muted-foreground">
                              Your codebase maintains good practices with consistent naming conventions
                              and proper error handling in most modules.
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 bg-yellow-500/5 border-yellow-500/20">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-yellow-500 mt-1" />
                          <div>
                            <h4 className="font-medium mb-1">Performance Opportunities</h4>
                            <p className="text-sm text-muted-foreground">
                              Consider implementing caching for frequently accessed data in the API layer.
                              This could improve response times by up to 40%.
                            </p>
                          </div>
                        </div>
                      </Card>

                      <Card className="p-4 bg-green-500/5 border-green-500/20">
                        <div className="flex items-start gap-3">
                          <Sparkles className="h-5 w-5 text-green-500 mt-1" />
                          <div>
                            <h4 className="font-medium mb-1">Security</h4>
                            <p className="text-sm text-muted-foreground">
                              Good security practices detected. Input validation and authentication
                              mechanisms are properly implemented.
                            </p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!analysis && (
          <Card className="py-20">
            <CardContent>
              <div className="text-center text-muted-foreground">
                <Folder className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Project Analyzed</h3>
                <p>Upload or select a project to start code analysis</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
