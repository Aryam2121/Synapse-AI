'use client'

import { useState, lazy, Suspense } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ChatInterface } from '@/components/dashboard/ChatInterface'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { withAuth } from '@/components/auth/ProtectedRoute'

// Lazy load panels for better performance
const DocumentsPanel = lazy(() => import('@/components/dashboard/DocumentsPanel').then(m => ({ default: m.DocumentsPanel })))
const TasksPanel = lazy(() => import('@/components/dashboard/TasksPanel').then(m => ({ default: m.TasksPanel })))
const CodePanel = lazy(() => import('@/components/dashboard/CodePanel').then(m => ({ default: m.CodePanel })))
const AnalyticsPanel = lazy(() => import('@/components/dashboard/AnalyticsPanel').then(m => ({ default: m.AnalyticsPanel })))
const SettingsPanel = lazy(() => import('@/components/dashboard/SettingsPanel').then(m => ({ default: m.SettingsPanel })))
const AIInsightsPanel = lazy(() => import('@/components/dashboard/AIInsightsPanel').then(m => ({ default: m.AIInsightsPanel })))
const CollaborationPanel = lazy(() => import('@/components/dashboard/CollaborationPanel').then(m => ({ default: m.CollaborationPanel })))
const VoiceAssistantPanel = lazy(() => import('@/components/dashboard/VoiceAssistantPanel').then(m => ({ default: m.VoiceAssistantPanel })))
const AdvancedSearchPanel = lazy(() => import('@/components/dashboard/AdvancedSearchPanel').then(m => ({ default: m.AdvancedSearchPanel })))
const AutomationPanel = lazy(() => import('@/components/dashboard/AutomationPanel').then(m => ({ default: m.AutomationPanel })))
const VisualizationPanel = lazy(() => import('@/components/dashboard/VisualizationPanel').then(m => ({ default: m.VisualizationPanel })))
const GamificationPanel = lazy(() => import('@/components/dashboard/GamificationPanel').then(m => ({ default: m.GamificationPanel })))
const CodeAssistantPanel = lazy(() => import('@/components/dashboard/CodeAssistantPanel').then(m => ({ default: m.CodeAssistantPanel })))
const RealTimeCollaborationPanel = lazy(() => import('@/components/dashboard/RealTimeCollaborationPanel').then(m => ({ default: m.RealTimeCollaborationPanel })))
const SmartSchedulingPanel = lazy(() => import('@/components/dashboard/SmartSchedulingPanel').then(m => ({ default: m.SmartSchedulingPanel })))
const KnowledgeBasePanel = lazy(() => import('@/components/dashboard/KnowledgeBasePanel').then(m => ({ default: m.KnowledgeBasePanel })))
const CommandPalette = lazy(() => import('@/components/dashboard/CommandPalette').then(m => ({ default: m.CommandPalette })))

// Loading component
const PanelLoader = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

type View = 'chat' | 'documents' | 'tasks' | 'code' | 'analytics' | 'settings' | 'insights' | 'collaboration' | 'voice' | 'search' | 'automation' | 'visualization' | 'gamification' | 'code-assistant' | 'realtime' | 'scheduling' | 'knowledge'

function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface />
      case 'documents':
        return <Suspense fallback={<PanelLoader />}><DocumentsPanel /></Suspense>
      case 'tasks':
        return <Suspense fallback={<PanelLoader />}><TasksPanel /></Suspense>
      case 'code':
        return <Suspense fallback={<PanelLoader />}><CodePanel /></Suspense>
      case 'analytics':
        return <Suspense fallback={<PanelLoader />}><AnalyticsPanel /></Suspense>
      case 'settings':
        return <Suspense fallback={<PanelLoader />}><SettingsPanel /></Suspense>
      case 'insights':
        return <Suspense fallback={<PanelLoader />}><AIInsightsPanel /></Suspense>
      case 'collaboration':
        return <Suspense fallback={<PanelLoader />}><CollaborationPanel /></Suspense>
      case 'voice':
        return <Suspense fallback={<PanelLoader />}><VoiceAssistantPanel /></Suspense>
      case 'search':
        return <Suspense fallback={<PanelLoader />}><AdvancedSearchPanel /></Suspense>
      case 'automation':
        return <Suspense fallback={<PanelLoader />}><AutomationPanel /></Suspense>
      case 'visualization':
        return <Suspense fallback={<PanelLoader />}><VisualizationPanel /></Suspense>
      case 'gamification':
        return <Suspense fallback={<PanelLoader />}><GamificationPanel /></Suspense>
      case 'code-assistant':
        return <Suspense fallback={<PanelLoader />}><CodeAssistantPanel /></Suspense>
      case 'realtime':
        return <Suspense fallback={<PanelLoader />}><RealTimeCollaborationPanel /></Suspense>
      case 'scheduling':
        return <Suspense fallback={<PanelLoader />}><SmartSchedulingPanel /></Suspense>
      case 'knowledge':
        return <Suspense fallback={<PanelLoader />}><KnowledgeBasePanel /></Suspense>
      default:
        return <ChatInterface />
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <CommandPalette onNavigate={(view) => setCurrentView(view as View)} />
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden relative z-10`}>
        <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as View)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 px-8 py-5 flex items-center gap-4 bg-black/20 backdrop-blur-xl shadow-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-white/10 transition-colors text-white h-10 w-10"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-3xl font-black capitalize bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight">{currentView}</h1>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-sm">
          {renderView()}
        </main>

        {/* Command Palette - Lazy loaded */}
        <Suspense fallback={null}>
          <CommandPalette onNavigate={setCurrentView} />
        </Suspense>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
