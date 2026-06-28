'use client'

import { useState, lazy, Suspense } from 'react'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { ChatInterface } from '@/components/dashboard/ChatInterface'
import { ConversationSidebar } from '@/components/dashboard/ConversationSidebar'
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
  <div className="flex flex-col items-center justify-center h-full gap-3">
    <div className="h-10 w-10 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
    <p className="text-sm text-slate-500">Loading...</p>
  </div>
)

type View = 'chat' | 'documents' | 'tasks' | 'code' | 'analytics' | 'settings' | 'insights' | 'collaboration' | 'voice' | 'search' | 'automation' | 'visualization' | 'gamification' | 'code-assistant' | 'realtime' | 'scheduling' | 'knowledge'

const CHAT_PROMPT_KEY = 'synapse_chat_pending_prompt'

const VIEW_TITLES: Record<string, string> = {
  chat: 'AI Chat',
  documents: 'Documents',
  tasks: 'Tasks',
  code: 'Code Analysis',
  analytics: 'Analytics',
  settings: 'Settings',
  insights: 'AI Insights',
  collaboration: 'Collaboration',
  voice: 'Voice Assistant',
  search: 'Advanced Search',
  automation: 'Automation',
  visualization: 'Visualizations',
  gamification: 'Gamification',
  'code-assistant': 'Code Assistant',
  realtime: 'Real-Time Collaboration',
  scheduling: 'Smart Scheduling',
  knowledge: 'Knowledge Base',
}

function DashboardPage() {
  const [currentView, setCurrentView] = useState<View>('chat')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>()
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()
  const [conversationListKey, setConversationListKey] = useState(0)

  const handleNewChat = () => {
    setActiveConversationId(undefined)
    setChatInitialPrompt(undefined)
  }

  const goToChatWithPrompt = (prompt: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(CHAT_PROMPT_KEY, prompt)
    }
    setChatInitialPrompt(prompt)
    setCurrentView('chat')
  }

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return (
          <div className="flex h-full">
            <ConversationSidebar
              activeId={activeConversationId}
              onSelect={(id) => {
                setActiveConversationId(id)
                setChatInitialPrompt(undefined)
              }}
              onNewChat={handleNewChat}
              refreshKey={conversationListKey}
            />
            <div className="flex-1 min-w-0">
              <ChatInterface
                initialPrompt={chatInitialPrompt}
                conversationId={activeConversationId}
                onConversationIdChange={(id) => {
                  setActiveConversationId(id)
                  if (id) setConversationListKey((k) => k + 1)
                }}
                onChatUpdated={() => setConversationListKey((k) => k + 1)}
              />
            </div>
          </div>
        )
      case 'documents':
        return (
          <Suspense fallback={<PanelLoader />}>
            <DocumentsPanel onAnalyzeInChat={goToChatWithPrompt} />
          </Suspense>
        )
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
        return (
          <Suspense fallback={<PanelLoader />}>
            <AdvancedSearchPanel
              onOpenConversation={(id) => {
                setActiveConversationId(id)
                setCurrentView('chat')
              }}
            />
          </Suspense>
        )
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
    <div className="flex h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-grid-white/5 opacity-30" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-fuchsia-600/6 rounded-full blur-[80px]" />
      </div>

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden relative z-10 shrink-0`}>
        <Sidebar currentView={currentView} onViewChange={(view) => setCurrentView(view as View)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10 min-w-0">
        <header className="border-b border-white/8 px-5 py-3.5 flex items-center gap-3 bg-[#0c0c14]/80 backdrop-blur-xl">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hover:bg-white/8 text-slate-400 hover:text-white h-9 w-9 shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-white truncate">
              {VIEW_TITLES[currentView] || currentView}
            </h1>
            {currentView === 'chat' && (
              <p className="text-xs text-slate-500 truncate">ChatGPT-style assistant with memory</p>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-hidden bg-[#0a0a0f]/50">
          {renderView()}
        </main>

        {/* Command Palette - Lazy loaded */}
        <Suspense fallback={null}>
          <CommandPalette
            onNavigate={(view: string) => setCurrentView(view as View)}
            onNewChat={() => {
              setCurrentView('chat')
              handleNewChat()
            }}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default withAuth(DashboardPage)
