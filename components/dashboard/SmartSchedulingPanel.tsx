'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar, Clock, Zap, TrendingUp, Users, Brain, Target, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

interface TimeSlot {
  start_time: string
  end_time: string
  suitability_score: number
  participant_availability: string[]
  reasoning: string[]
  productivity_impact: string
  timezone_friendly: boolean
}

interface FocusBlock {
  date: string
  start_time: string
  end_time: string
  duration_minutes: number
  quality_score: number
  type: string
  recommended_tasks: string[]
}

interface TimeAnalytics {
  period: string
  breakdown: {
    category: string
    hours: number
    percentage: number
    trend: string
  }[]
  metrics: {
    focus_score: number
    fragmentation_index: number
    meeting_efficiency: number
    work_life_balance: number
  }
  insights: string[]
  recommendations: string[]
}

export function SmartSchedulingPanel() {
  const [meetingTitle, setMeetingTitle] = useState('')
  const [duration, setDuration] = useState(60)
  const [suggestions, setSuggestions] = useState<TimeSlot[]>([])
  const [focusBlocks, setFocusBlocks] = useState<FocusBlock[]>([])
  const [analytics, setAnalytics] = useState<TimeAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchFocusBlocks = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/scheduling/focus-time-suggestions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setFocusBlocks(data.upcoming_focus_blocks || [])
    } catch (error) {
      console.error('Failed to fetch focus blocks:', error)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/scheduling/time-analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  const suggestMeetingTimes = async () => {
    if (!meetingTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a meeting title',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/scheduling/suggest-meeting-times', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: meetingTitle,
          duration_minutes: duration,
          participants: ['user1', 'user2'],
          preferred_time: 'morning',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
      })

      const data = await response.json()
      setSuggestions(data.suggestions || [])
      
      toast({
        title: 'Suggestions Ready!',
        description: `Found ${data.suggestions.length} optimal time slots`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to get suggestions',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFocusBlocks()
    fetchAnalytics()
  }, [])

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return 'text-green-500 bg-green-500/10'
    if (score >= 0.70) return 'text-blue-500 bg-blue-500/10'
    if (score >= 0.50) return 'text-yellow-500 bg-yellow-500/10'
    return 'text-red-500 bg-red-500/10'
  }

  const getMetricColor = (value: number) => {
    if (value >= 0.80) return 'text-green-500'
    if (value >= 0.60) return 'text-blue-500'
    if (value >= 0.40) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Smart Scheduling
        </h2>
        <Badge variant="outline" className="text-sm">
          <Brain className="h-3 w-3 mr-1" />
          AI-Powered
        </Badge>
      </div>

      <Tabs defaultValue="suggest" className="flex-1">
        <TabsList>
          <TabsTrigger value="suggest">Meeting Suggestions</TabsTrigger>
          <TabsTrigger value="focus">Focus Time</TabsTrigger>
          <TabsTrigger value="analytics">Time Analytics</TabsTrigger>
        </TabsList>

        {/* Meeting Suggestions */}
        <TabsContent value="suggest" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Find Optimal Meeting Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Meeting Title</label>
                  <Input
                    placeholder="e.g., Team Sync"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                  />
                </div>
              </div>

              <Button onClick={suggestMeetingTimes} disabled={isLoading} className="w-full gap-2">
                <Zap className="h-4 w-4" />
                {isLoading ? 'Finding Times...' : 'Suggest Times'}
              </Button>

              {suggestions.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="font-semibold">Suggested Time Slots</h3>
                  {suggestions.map((slot, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">
                                  {new Date(slot.start_time).toLocaleString()} - {new Date(slot.end_time).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="space-y-1">
                                {slot.reasoning.map((reason, i) => (
                                  <p key={i} className="text-sm text-muted-foreground flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    {reason}
                                  </p>
                                ))}
                              </div>
                              <div className="flex items-center gap-2 mt-3">
                                <Badge variant="outline">
                                  <Users className="h-3 w-3 mr-1" />
                                  {slot.participant_availability.length} available
                                </Badge>
                                <Badge variant="secondary">
                                  {slot.productivity_impact}
                                </Badge>
                                {slot.timezone_friendly && (
                                  <Badge className="bg-green-500/10 text-green-600">
                                    Timezone-friendly
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className={`px-4 py-2 rounded-lg ${getScoreColor(slot.suitability_score)}`}>
                              <p className="text-2xl font-bold">{(slot.suitability_score * 100).toFixed(0)}%</p>
                              <p className="text-xs">Suitability</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Focus Time */}
        <TabsContent value="focus" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Focus Blocks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {focusBlocks.map((block, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">
                                  {new Date(block.date).toLocaleDateString()}
                                </span>
                                <Badge variant="outline">{block.type.replace('_', ' ')}</Badge>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                <Clock className="h-3 w-3" />
                                {block.start_time} - {block.end_time} ({block.duration_minutes} min)
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm font-medium">Recommended for:</p>
                                {block.recommended_tasks.map((task, i) => (
                                  <p key={i} className="text-sm text-muted-foreground pl-4">
                                    • {task}
                                  </p>
                                ))}
                              </div>
                            </div>
                            <div className={`px-3 py-2 rounded-lg ${getScoreColor(block.quality_score)}`}>
                              <p className="text-xl font-bold">{(block.quality_score * 100).toFixed(0)}%</p>
                              <p className="text-xs">Quality</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Analytics */}
        <TabsContent value="analytics" className="space-y-4 mt-4">
          {analytics && (
            <>
              {/* Metrics Cards */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className={`text-3xl font-bold ${getMetricColor(analytics.metrics.focus_score)}`}>
                      {(analytics.metrics.focus_score * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Focus Score</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className={`text-3xl font-bold ${getMetricColor(1 - analytics.metrics.fragmentation_index)}`}>
                      {(analytics.metrics.fragmentation_index * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Fragmentation</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className={`text-3xl font-bold ${getMetricColor(analytics.metrics.meeting_efficiency)}`}>
                      {(analytics.metrics.meeting_efficiency * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Meeting Efficiency</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className={`text-3xl font-bold ${getMetricColor(analytics.metrics.work_life_balance)}`}>
                      {(analytics.metrics.work_life_balance * 100).toFixed(0)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Work-Life Balance</p>
                  </CardContent>
                </Card>
              </div>

              {/* Time Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Time Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.breakdown.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.category}</span>
                            <Badge variant={item.trend.startsWith('+') ? 'default' : 'secondary'}>
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {item.trend}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.hours}h ({item.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percentage}%` }}
                            transition={{ duration: 0.5, delay: idx * 0.1 }}
                            className="bg-primary h-2 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {analytics.recommendations.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
                      >
                        <Zap className="h-4 w-4 text-yellow-500 mt-1" />
                        <p className="text-sm">{rec}</p>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
