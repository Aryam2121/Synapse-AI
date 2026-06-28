'use client'

import {
  Brain, MessageSquare, FileText, CheckSquare, Code, BarChart3,
  Settings, LogOut, Sparkles, Users, Mic, Search, Zap, PieChart,
  Trophy, Code2, Users2, Calendar, Book,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { NotificationCenter } from './NotificationCenter'

interface SidebarProps {
  currentView: string
  onViewChange: (view: string) => void
}

const menuItems = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'code', label: 'Code Analysis', icon: Code },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'insights', label: 'AI Insights', icon: Sparkles },
  { id: 'collaboration', label: 'Collaboration', icon: Users },
  { id: 'voice', label: 'Voice Assistant', icon: Mic },
  { id: 'search', label: 'Advanced Search', icon: Search },
  { id: 'automation', label: 'Automation', icon: Zap },
  { id: 'visualization', label: 'Visualizations', icon: PieChart },
  { id: 'gamification', label: 'Gamification', icon: Trophy },
  { id: 'code-assistant', label: 'Code Assistant', icon: Code2 },
  { id: 'realtime', label: 'Real-Time Collab', icon: Users2 },
  { id: 'scheduling', label: 'Smart Scheduling', icon: Calendar },
  { id: 'knowledge', label: 'Knowledge Base', icon: Book },
]

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <div className="h-full bg-[#0c0c14]/95 border-r border-white/8 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="shrink-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl p-2 shadow-lg shadow-violet-900/30">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-sm bg-gradient-to-r from-white to-violet-200 bg-clip-text text-transparent truncate">
              Synapse AI
            </span>
          </div>
          <NotificationCenter />
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-violet-600/90 to-purple-600/90 text-white shadow-md shadow-violet-900/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/6'
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <Separator className="bg-white/8" />

      {/* Bottom */}
      <div className="p-3 space-y-1">
        <button
          type="button"
          onClick={() => onViewChange('settings')}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors',
            currentView === 'settings'
              ? 'bg-white/10 text-white'
              : 'text-slate-400 hover:text-white hover:bg-white/6'
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </button>

        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1 rounded-xl bg-white/[0.03] border border-white/6">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-xs font-semibold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email || ''}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
