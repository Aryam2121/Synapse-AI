'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BarChart3, TrendingUp, PieChart, Activity, Gauge } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface KPI {
  name: string
  value: number
  change: number
  trend: string
  period: string
}

export function VisualizationPanel() {
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [kpis, setKpis] = useState<KPI[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      const [dashRes, kpiRes] = await Promise.all([
        fetch(`${API_URL}/api/visualization/dashboard/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/api/visualization/metrics/summary`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const [dashData, kpiData] = await Promise.all([
        dashRes.json(),
        kpiRes.json()
      ])

      setDashboardData(dashData)
      setKpis(kpiData.kpis || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load visualizations',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderWidget = (widget: any) => {
    const chartOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
      },
    }

    switch (widget.type) {
      case 'line':
      case 'area':
        return (
          <div className="h-64">
            <Line data={widget.data} options={chartOptions} />
          </div>
        )
      case 'bar':
        return (
          <div className="h-64">
            <Bar data={widget.data} options={chartOptions} />
          </div>
        )
      case 'doughnut':
        return (
          <div className="h-64 flex items-center justify-center">
            <div className="w-64 h-64">
              <Doughnut data={widget.data} options={chartOptions} />
            </div>
          </div>
        )
      case 'gauge':
        return (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={widget.data.color === 'green' ? '#10b981' : '#3b82f6'}
                  strokeWidth="10"
                  strokeDasharray={`${(widget.data.value / widget.data.max) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">{widget.data.value}</div>
                  <div className="text-sm text-muted-foreground">/ {widget.data.max}</div>
                </div>
              </div>
            </div>
          </div>
        )
      default:
        return <div className="text-muted-foreground">Unsupported chart type</div>
    }
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
          Data Visualization
        </h2>
        <Badge variant="outline" className="text-sm">
          Real-time Analytics
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{kpi.name}</p>
                  {kpi.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <Activity className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold">{kpi.value}</h3>
                  <Badge
                    variant={kpi.trend === 'up' ? 'default' : 'secondary'}
                    className={kpi.trend === 'up' ? 'bg-green-500' : 'bg-red-500'}
                  >
                    {kpi.change > 0 ? '+' : ''}{kpi.change}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.period}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="flex-1">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="productivity">Productivity</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData?.widgets?.slice(0, 6).map((widget: any, idx: number) => (
              <motion.div
                key={widget.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {widget.type === 'line' && <BarChart3 className="h-5 w-5" />}
                      {widget.type === 'doughnut' && <PieChart className="h-5 w-5" />}
                      {widget.type === 'gauge' && <Gauge className="h-5 w-5" />}
                      {widget.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderWidget(widget)}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="productivity" className="mt-4">
          <div className="grid grid-cols-1 gap-6">
            {dashboardData?.widgets
              ?.filter((w: any) => w.id.includes('task') || w.id.includes('productivity'))
              .map((widget: any) => (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                  </CardHeader>
                  <CardContent>{renderWidget(widget)}</CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dashboardData?.widgets
              ?.filter((w: any) => w.id.includes('time') || w.id.includes('distribution'))
              .map((widget: any) => (
                <Card key={widget.id}>
                  <CardHeader>
                    <CardTitle>{widget.title}</CardTitle>
                  </CardHeader>
                  <CardContent>{renderWidget(widget)}</CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Collaboration Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Team activity heatmap visualization</p>
                <p className="text-sm mt-2">Shows peak collaboration hours and patterns</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
