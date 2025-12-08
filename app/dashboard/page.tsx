'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ChatInterface } from '@/components/dashboard/ChatInterface'
import { DocumentsPanel } from '@/components/dashboard/DocumentsPanel'
import { TasksPanel } from '@/components/dashboard/TasksPanel'
import { CodePanel } from '@/components/dashboard/CodePanel'
import { AnalyticsPanel } from '@/components/dashboard/AnalyticsPanel'
import { SettingsPanel } from '@/components/dashboard/SettingsPanel'
import { AIInsightsPanel } from '@/components/dashboard/AIInsightsPanel'
import { CollaborationPanel } from '@/components/dashboard/CollaborationPanel'
import { VoiceAssistantPanel } from '@/components/dashboard/VoiceAssistantPanel'
import { AdvancedSearchPanel } from '@/components/dashboard/AdvancedSearchPanel'
import { AutomationPanel } from '@/components/dashboard/AutomationPanel'
import { VisualizationPanel } from '@/components/dashboard/VisualizationPanel'
import { GamificationPanel } from '@/components/dashboard/GamificationPanel'
import { CodeAssistantPanel } from '@/components/dashboard/CodeAssistantPanel'
import { RealTimeCollaborationPanel } from '@/components/dashboard/RealTimeCollaborationPanel'
import { SmartSchedulingPanel } from '@/components/dashboard/SmartSchedulingPanel'
import { KnowledgeBasePanel } from '@/components/dashboard/KnowledgeBasePanel'
import { CommandPalette } from '@/components/dashboard/CommandPalette'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { withAuth } from '@/components/auth/ProtectedRoute'

type View = 'chat' | 'documents' | 'tasks' | 'code' | 'analytics' | 'settings' | 'insights' | 'collaboration' | 'voice' | 'search' | 'automation' | 'visualization' | 'gamification' | 'code-assistant' | 'realtime' | 'scheduling' | 'knowledge'

function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatInterface />
      case 'documents':
        return <DocumentsPanel />
      case 'tasks':
        return <TasksPanel />
      case 'code':
        return <CodePanel />
      case 'analytics':
        return <AnalyticsPanel />
      case 'settings':
        return <SettingsPanel />
      case 'insights':
        return <AIInsightsPanel />
      case 'collaboration':
        return <CollaborationPanel />
      case 'voice':
        return <VoiceAssistantPanel />
      case 'search':
        return <AdvancedSearchPanel />
      case 'automation':
        return <AutomationPanel />
      case 'visualization':
        return <VisualizationPanel />
      case 'gamification':
        return <GamificationPanel />
      case 'code-assistant':
        return <CodeAssistantPanel />
      case 'realtime':
        return <RealTimeCollaborationPanel />
      case 'scheduling':
        return <SmartSchedulingPanel />
      case 'knowledge':
        return <KnowledgeBasePanel />
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
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
