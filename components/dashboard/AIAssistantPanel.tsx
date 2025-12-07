'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Lightbulb, 
  TrendingUp, 
  Zap, 
  Target, 
  Clock,
  BarChart2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface SmartSuggestion {
  id: string
  type: string
  title: string
  description: string
  priority: number
  estimated_time: number
  impact_score: number
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  estimated_duration: number
}

interface AIInsight {
  type: string
  title: string
  description: string
  actionable: boolean
  data: any
}

export function AIAssistantPanel() {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([])
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [codeQuality, setCodeQuality] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const headers = { Authorization: `Bearer ${token}` }

      const [suggestionsRes, templatesRes, insightsRes, qualityScoreRes] = await Promise.all([
        fetch(`${API_URL}/api/ai-assistant/smart-suggestions`, { headers }),
        fetch(`${API_URL}/api/ai-assistant/workflow-templates`, { headers }),
        fetch(`${API_URL}/api/ai-assistant/ai-insights`, { headers }),
        fetch(`${API_URL}/api/ai-assistant/code-quality-score`, { headers })
      ])

      if (suggestionsRes.ok) setSuggestions((await suggestionsRes.json()).suggestions)
      if (workflowsRes.ok) setWorkflows((await workflowsRes.json()).templates)
      if (insightsRes.ok) setInsights((await insightsRes.json()).insights)
      if (codeQualityRes.ok) setCodeQuality(await codeQualityRes.json())
    } catch (error) {
      console.error('Failed to fetch AI assistant data:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setIsLoading(false)
    }
  }

  const executeWorkflow = async (templateId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${API_URL}/api/ai-assistant/workflow-templates/${templateId}/execute`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        toast.success('Workflow started successfully!', {
          description: 'You\'ll be notified when it completes'
        })
      }
    } catch (error) {
      toast.error('Failed to execute workflow')
    }
  }

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500'
    if (grade.startsWith('B')) return 'text-blue-500'
    if (grade.startsWith('C')) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              AI Assistant
            </h1>
            <p className="text-muted-foreground">
              Intelligent suggestions and workflow automation powered by AI
            </p>
          </div>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            Run Full Analysis
          </Button>
        </div>

        {/* Code Quality Score */}
        {codeQuality && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Code Quality Score</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-4xl font-bold ${getGradeColor(codeQuality.grade)}`}>
                      {codeQuality.grade}
                    </span>
                    <span className="text-2xl text-muted-foreground">
                      {codeQuality.overall_score}/10
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(codeQuality.metrics).map(([key, value]: [string, any]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{key}</span>
                        <span className="font-semibold">{value.score}</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${(value.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="suggestions">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="suggestions">
              <Lightbulb className="h-4 w-4 mr-2" />
              Smart Suggestions
            </TabsTrigger>
            <TabsTrigger value="workflows">
              <Zap className="h-4 w-4 mr-2" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="insights">
              <TrendingUp className="h-4 w-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="space-y-4">
            <div className="grid gap-4">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant={suggestion.priority > 7 ? 'destructive' : 'default'}>
                              Priority {suggestion.priority}/10
                            </Badge>
                            <Badge variant="outline">
                              <Clock className="h-3 w-3 mr-1" />
                              {suggestion.estimated_time}m
                            </Badge>
                            <Badge variant="outline">
                              Impact: {Math.round(suggestion.impact_score * 100)}%
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{suggestion.title}</h3>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {workflows.map((workflow, index) => (
                <motion.div
                  key={workflow.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{workflow.name}</span>
                        <Badge>{workflow.category}</Badge>
                      </CardTitle>
                      <CardDescription>{workflow.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 inline mr-1" />
                          ~{workflow.estimated_duration} minutes
                        </span>
                        <Button onClick={() => executeWorkflow(workflow.id)}>
                          <Zap className="h-4 w-4 mr-2" />
                          Execute
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {insights.map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {insight.type === 'productivity' && <BarChart2 className="h-5 w-5 text-blue-500 mt-1" />}
                            {insight.type === 'pattern' && <Target className="h-5 w-5 text-purple-500 mt-1" />}
                            {insight.type === 'recommendation' && <AlertCircle className="h-5 w-5 text-orange-500 mt-1" />}
                            <div>
                              <CardTitle className="text-lg">{insight.title}</CardTitle>
                              <CardDescription className="mt-1">{insight.description}</CardDescription>
                            </div>
                          </div>
                          {insight.actionable && (
                            <Badge variant="outline">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Actionable
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      {insight.data && Object.keys(insight.data).length > 0 && (
                        <CardContent>
                          <div className="bg-muted rounded-lg p-4 space-y-2">
                            {Object.entries(insight.data).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground capitalize">
                                  {key.replace(/_/g, ' ')}
                                </span>
                                <span className="font-medium">
                                  {typeof value === 'number' ? 
                                    (value < 1 ? `${(value * 100).toFixed(0)}%` : value.toFixed(2)) : 
                                    String(value)
                                  }
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
