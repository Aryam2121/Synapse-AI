'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Lightbulb, TrendingUp, AlertTriangle, CheckCircle, 
  Clock, Target, Zap, Award, Brain, Flame 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Recommendation {
  id: string
  type: string
  title: string
  description: string
  impact: string
  action_items: string[]
  confidence: number
}

export function AIInsightsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [usagePatterns, setUsagePatterns] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)
  const [predictions, setPredictions] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [])

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      
      const [recsRes, patternsRes, summaryRes, predsRes] = await Promise.all([
        fetch('http://localhost:8000/api/insights/ai-recommendations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/insights/usage-patterns', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/insights/smart-summaries?period=week', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:8000/api/insights/predictive-analytics', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (recsRes.ok) {
        const data = await recsRes.json()
        setRecommendations(data.recommendations)
      }
      
      if (patternsRes.ok) {
        const data = await patternsRes.json()
        setUsagePatterns(data)
      }

      if (summaryRes.ok) {
        const data = await summaryRes.json()
        setSummary(data)
      }

      if (predsRes.ok) {
        const data = await predsRes.json()
        setPredictions(data)
      }

    } catch (error) {
      toast.error('Failed to load insights')
    } finally {
      setIsLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return AlertTriangle
      case 'medium': return TrendingUp
      case 'low': return Lightbulb
      default: return CheckCircle
    }
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
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            AI-Powered Insights
          </h1>
          <p className="text-muted-foreground">
            Personalized recommendations and predictive analytics
          </p>
        </div>

        {/* Weekly Summary Card */}
        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  {summary.period} Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">{summary.summary}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.achievements && summary.achievements.map((achievement: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-background/50 rounded-lg">
                      <div className="p-2 bg-primary/20 rounded-lg">
                        {achievement.icon === 'trophy' && <Award className="h-5 w-5 text-primary" />}
                        {achievement.icon === 'flame' && <Flame className="h-5 w-5 text-orange-500" />}
                        {achievement.icon === 'zap' && <Zap className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div>
                        <div className="font-medium">{achievement.title}</div>
                        <div className="text-sm text-muted-foreground">{achievement.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="recommendations" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
          </TabsList>

          <TabsContent value="recommendations" className="space-y-4">
            {recommendations.map((rec, index) => {
              const ImpactIcon = getImpactIcon(rec.impact)
              return (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getImpactColor(rec.impact)}/20`}>
                            <ImpactIcon className={`h-5 w-5 text-${rec.impact === 'high' ? 'red' : rec.impact === 'medium' ? 'yellow' : 'blue'}-500`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{rec.title}</CardTitle>
                            <CardDescription className="mt-1">{rec.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {Math.round(rec.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Action Items:</div>
                        <ul className="space-y-1">
                          {rec.action_items.map((item, i) => (
                            <li key={i} className="text-sm flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            {usagePatterns && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Daily Activity Pattern</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Peak Hours</div>
                        <div className="font-medium">{usagePatterns.daily_pattern.peak_hours.join(', ')}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Most Used Feature</div>
                        <div className="font-medium capitalize">{usagePatterns.daily_pattern.most_used_feature}</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-muted-foreground mb-2">Feature Distribution</div>
                      {Object.entries(usagePatterns.daily_pattern.feature_distribution).map(([feature, percentage]: [string, any]) => (
                        <div key={feature} className="mb-2">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="capitalize">{feature}</span>
                            <span>{percentage}%</span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold">{usagePatterns.weekly_trends.avg_daily_sessions}</div>
                        <div className="text-sm text-muted-foreground">Avg Daily Sessions</div>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <div className="text-2xl font-bold">{usagePatterns.weekly_trends.efficiency_score}</div>
                        <div className="text-sm text-muted-foreground">Efficiency Score</div>
                      </div>
                      <div className="p-4 bg-blue-500/10 rounded-lg">
                        <div className="text-2xl font-bold">{usagePatterns.weekly_trends.total_time_saved}</div>
                        <div className="text-sm text-muted-foreground">Time Saved</div>
                      </div>
                      <div className="p-4 bg-purple-500/10 rounded-lg">
                        <div className="text-2xl font-bold capitalize">{usagePatterns.weekly_trends.most_productive_day}</div>
                        <div className="text-sm text-muted-foreground">Most Productive</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            {predictions && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Next Week Forecast
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Estimated Tasks</div>
                        <div className="text-2xl font-bold">{predictions.predictions.next_week_workload.estimated_tasks}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Complexity</div>
                        <Badge variant="outline" className="capitalize">
                          {predictions.predictions.next_week_workload.complexity_level}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Recommended Focus</div>
                      <p className="text-sm text-muted-foreground capitalize">
                        {predictions.predictions.next_week_workload.recommended_focus}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Burnout Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm">Risk Level</span>
                          <span className="text-sm font-medium">{predictions.predictions.burnout_risk.level}</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              predictions.predictions.burnout_risk.score < 30 ? 'bg-green-500' :
                              predictions.predictions.burnout_risk.score < 70 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${predictions.predictions.burnout_risk.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {predictions.predictions.burnout_risk.recommendation}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Skill Development
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Emerging Strength</div>
                        <div className="font-medium capitalize">{predictions.predictions.skill_development.emerging_strength}</div>
                      </div>
                      <div className="p-3 bg-blue-500/10 rounded-lg">
                        <div className="text-sm text-muted-foreground">Improvement Area</div>
                        <div className="font-medium capitalize">{predictions.predictions.skill_development.improvement_area}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Learning Suggestions</div>
                      <ul className="space-y-1">
                        {predictions.predictions.skill_development.learning_suggestions.map((suggestion: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-yellow-500" />
                            {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
