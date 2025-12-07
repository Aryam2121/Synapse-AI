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
    <div className="flex h-screen bg-background">
      <CommandPalette onNavigate={(view) => setCurrentView(view as View)} />
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden`}>
        <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as View)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border/50 px-6 py-4 flex items-center gap-4 bg-gradient-to-r from-card to-card/95 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-primary/10 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold capitalize bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{currentView}</h1>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
