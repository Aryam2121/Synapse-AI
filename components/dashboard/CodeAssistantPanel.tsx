'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Code, Sparkles, CheckCircle, AlertTriangle, Lightbulb, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

export function CodeAssistantPanel() {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [analysis, setAnalysis] = useState<any>(null)
  const [generatedCode, setGeneratedCode] = useState('')
  const [prompt, setPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeCode = async () => {
    if (!code.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter code to analyze',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/code/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language })
      })

      const data = await response.json()
      setAnalysis(data)
      
      toast({
        title: 'Analysis Complete',
        description: `Found ${data.issues.length} issues`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to analyze code',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateCode = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description',
        variant: 'destructive'
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/code/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, language })
      })

      const data = await response.json()
      setGeneratedCode(data.code)
      
      toast({
        title: 'Code Generated!',
        description: data.explanation
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate code',
        variant: 'destructive'
      })
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4" />
      case 'medium': return <AlertTriangle className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          AI Code Assistant
        </h2>
        <Badge variant="outline" className="text-sm">
          <Sparkles className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <Tabs defaultValue="analyze" className="flex-1">
        <TabsList>
          <TabsTrigger value="analyze">Analyze Code</TabsTrigger>
          <TabsTrigger value="generate">Generate Code</TabsTrigger>
          <TabsTrigger value="explain">Explain Code</TabsTrigger>
          <TabsTrigger value="refactor">Refactor</TabsTrigger>
        </TabsList>

        {/* Analyze Tab */}
        <TabsContent value="analyze" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Code Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                  <option value="go">Go</option>
                </select>
                <Button onClick={analyzeCode} disabled={isAnalyzing} className="gap-2">
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Code
                    </>
                  )}
                </Button>
              </div>

              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-64 p-4 font-mono text-sm border rounded-md bg-muted/50"
              />

              {analysis && (
                <div className="space-y-4">
                  {/* Score Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{analysis.score.overall}</p>
                        <p className="text-sm text-muted-foreground">Overall</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{analysis.score.security}</p>
                        <p className="text-sm text-muted-foreground">Security</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{analysis.score.performance}</p>
                        <p className="text-sm text-muted-foreground">Performance</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{analysis.metrics.cyclomatic_complexity}</p>
                        <p className="text-sm text-muted-foreground">Complexity</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Issues */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Issues Found ({analysis.issues.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-64">
                        <div className="space-y-3 pr-4">
                          {analysis.issues.map((issue: any, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className={`p-3 rounded-lg border ${getSeverityColor(issue.severity)}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={getSeverityColor(issue.severity)}>
                                  {getSeverityIcon(issue.severity)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge variant="outline" className="capitalize">
                                      {issue.severity}
                                    </Badge>
                                    <Badge variant="secondary">Line {issue.line}</Badge>
                                    <Badge variant="outline" className="capitalize">
                                      {issue.category}
                                    </Badge>
                                  </div>
                                  <p className="font-medium mb-1">{issue.message}</p>
                                  <p className="text-sm text-muted-foreground">
                                    💡 {issue.suggestion}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>

                  {/* Suggestions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Suggestions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((suggestion: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-1" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generate Code from Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">What do you want to build?</label>
                <Input
                  placeholder="e.g., Create a REST API endpoint that fetches user data"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="java">Java</option>
                </select>
                <Button onClick={generateCode} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate Code
                </Button>
              </div>

              {generatedCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Generated Code:</label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode)
                        toast({ title: 'Copied to clipboard!' })
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <pre className="p-4 bg-muted/50 rounded-lg overflow-x-auto">
                    <code className="text-sm">{generatedCode}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Explain Tab */}
        <TabsContent value="explain" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Explanation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Paste code to get AI-powered explanations with step-by-step breakdown
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Refactor Tab */}
        <TabsContent value="refactor" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Refactoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Automatically improve code quality with AI-suggested refactoring
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
