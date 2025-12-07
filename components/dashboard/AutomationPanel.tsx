'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Zap, Play, Clock, Settings, PlayCircle, Plus, Edit, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: { type: string; config: any }
  enabled: boolean
  executions: number
  success_rate: number
  last_run: string
}

interface Workflow {
  id: string
  name: string
  description: string
  steps: number
  enabled: boolean
  executions: number
  avg_duration: string
  success_rate: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  trigger: string
  actions_count: number
  popularity: number
}

export function AutomationPanel() {
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAutomations()
  }, [])

  const fetchAutomations = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const [rulesRes, workflowsRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/api/automation/rules`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/automation/workflows`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/automation/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      const [rulesData, workflowsData, templatesData] = await Promise.all([
        rulesRes.json(),
        workflowsRes.json(),
        templatesRes.json()
      ])

      setRules(rulesData.rules || [])
      setWorkflows(workflowsData.workflows || [])
      setTemplates(templatesData.templates || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load automations',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testRule = async (ruleId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/automation/test-rule/${ruleId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const data = await response.json()
      
      toast({
        title: 'Test Complete',
        description: `Would execute ${data.actions_to_execute} actions`
      })
    } catch (error) {
      toast({
        title: 'Test Failed',
        description: 'Failed to test rule',
        variant: 'destructive'
      })
    }
  }

  const executeWorkflow = async (workflowId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/automation/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input_data: {} })
      })
      
      const data = await response.json()
      
      toast({
        title: 'Workflow Started',
        description: `Execution ID: ${data.execution_id}`
      })
    } catch (error) {
      toast({
        title: 'Execution Failed',
        description: 'Failed to start workflow',
        variant: 'destructive'
      })
    }
  }

  const getTriggerBadge = (triggerType: string) => {
    const colors: Record<string, string> = {
      schedule: 'bg-blue-500',
      event: 'bg-green-500',
      webhook: 'bg-purple-500'
    }
    return colors[triggerType] || 'bg-gray-500'
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Automation & Workflows
        </h2>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Automation
        </Button>
      </div>

      <Tabs defaultValue="rules" className="flex-1">
        <TabsList>
          <TabsTrigger value="rules">Automation Rules</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Automation Rules */}
        <TabsContent value="rules" className="space-y-4 mt-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Zap className="h-8 w-8 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {rules.length} Active Automation Rules
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Automate repetitive tasks and streamline your workflow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <ScrollArea className="h-[600px]">
            <div className="space-y-3 pr-4">
              {rules.map((rule, idx) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className={`${rule.enabled ? 'border-primary/30' : 'opacity-60'}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            {rule.name}
                            <Badge className={getTriggerBadge(rule.trigger.type)}>
                              {rule.trigger.type}
                            </Badge>
                            {rule.enabled ? (
                              <Badge variant="default" className="bg-green-500">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Disabled</Badge>
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {rule.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => testRule(rule.id)}>
                            <Play className="h-3 w-3 mr-1" />
                            Test
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Executions</p>
                          <p className="font-semibold text-lg">{rule.executions}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-semibold text-lg">
                            {Math.round(rule.success_rate * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Last Run</p>
                          <p className="font-semibold">
                            {new Date(rule.last_run).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Workflows */}
        <TabsContent value="workflows" className="space-y-4 mt-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <PlayCircle className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold">
                    {workflows.length} Multi-Step Workflows
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complex processes with branching logic and conditions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflows.map((workflow, idx) => (
              <motion.div
                key={workflow.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{workflow.name}</span>
                      {workflow.enabled && (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {workflow.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Steps:</span>
                      <Badge variant="outline">{workflow.steps}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Executions:</span>
                      <span className="font-semibold">{workflow.executions}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Avg Duration:</span>
                      <span className="font-semibold">{workflow.avg_duration}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Success Rate:</span>
                      <span className="font-semibold">
                        {Math.round(workflow.success_rate * 100)}%
                      </span>
                    </div>
                    <Button
                      className="w-full gap-2"
                      onClick={() => executeWorkflow(workflow.id)}
                    >
                      <PlayCircle className="h-4 w-4" />
                      Execute Workflow
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Templates */}
        <TabsContent value="templates" className="space-y-4 mt-4">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Settings className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Pre-built Automation Templates
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get started quickly with ready-to-use automation templates
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-2 capitalize">
                          {template.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Badge variant="secondary">
                        {template.popularity}% popular
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Trigger:</span>
                      <Badge className={getTriggerBadge(template.trigger)}>
                        {template.trigger}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Actions:</span>
                      <span className="font-semibold">{template.actions_count}</span>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
