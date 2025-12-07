'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, TrendingUp, Clock, MessageSquare, FileText, Code } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface AnalyticsData {
  metrics: {
    total_conversations: number
    conversations_growth: number
    documents_processed: number
    documents_growth: number
    tasks_completed: number
    tasks_growth: number
    code_analyses: number
    code_growth: number
  }
  activity_data: Array<{ name: string; chats: number; documents: number; tasks: number }>
  agent_usage: Array<{ name: string; value: number; color: string }>
  productivity: Array<{ week: string; tasksCompleted: number; documentsProcessed: number }>
}

export function AnalyticsPanel() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [timeSaved, setTimeSaved] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const [overviewRes, timeSavedRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/analytics/time-saved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (overviewRes.ok && timeSavedRes.ok) {
        const analytics = await overviewRes.json()
        const timeSaved = await timeSavedRes.json()
        setAnalyticsData(analytics)
        setTimeSaved(timeSaved)
      } else {
        toast.error('Failed to fetch analytics')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast.error('Error loading analytics')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !analyticsData) {
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
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics & Insights</h1>
          <p className="text-muted-foreground">
            Track your productivity and AI usage patterns
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{analyticsData.metrics.total_conversations}</div>
                <div className="text-sm text-muted-foreground">Total Conversations</div>
                <div className="text-xs text-green-500 mt-1">+{analyticsData.metrics.conversations_growth}% from last week</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="h-8 w-8 text-purple-500" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{analyticsData.metrics.documents_processed}</div>
                <div className="text-sm text-muted-foreground">Documents Processed</div>
                <div className="text-xs text-green-500 mt-1">+{analyticsData.metrics.documents_growth}% from last week</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Code className="h-8 w-8 text-blue-500" />
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">{analyticsData.metrics.code_analyses}</div>
                <div className="text-sm text-muted-foreground">Code Analyses</div>
                <div className="text-xs text-green-500 mt-1">+{analyticsData.metrics.code_growth}% from last week</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
                <div className="text-2xl font-bold">{timeSaved?.total_hours || 0}h</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
                <div className="text-xs text-green-500 mt-1">≈ {timeSaved?.total_days || 0} days</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <Tabs defaultValue="activity">
          <TabsList className="w-full">
            <TabsTrigger value="activity" className="flex-1">
              <BarChart3 className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex-1">
              Agent Usage
            </TabsTrigger>
            <TabsTrigger value="productivity" className="flex-1">
              Productivity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={analyticsData.activity_data}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="chats" fill="#3b82f6" name="Chats" />
                    <Bar dataKey="documents" fill="#8b5cf6" name="Documents" />
                    <Bar dataKey="tasks" fill="#10b981" name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Agent Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.agent_usage}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analyticsData.agent_usage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Agents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analyticsData.agent_usage.map((agent, index) => (
                    <div key={agent.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{agent.name}</span>
                        <span className="text-sm text-muted-foreground">{agent.value}%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${agent.value}%`,
                            backgroundColor: agent.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="productivity">
            <Card>
              <CardHeader>
                <CardTitle>Productivity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={analyticsData.productivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="week" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tasksCompleted"
                      stroke="#10b981"
                      strokeWidth={2}
                      name="Tasks Completed"
                    />
                    <Line
                      type="monotone"
                      dataKey="documentsProcessed"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      name="Documents Processed"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
