'use client'

import { Brain, MessageSquare, FileText, CheckSquare, Code, BarChart3, Settings, LogOut, Sparkles, Users, Mic, Search, Zap, PieChart, Trophy, Code2, Users2, Calendar, Book } from 'lucide-react'
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
    <div className="h-full bg-gradient-to-b from-card via-card to-card/95 border-r border-border/50 backdrop-blur-xl flex flex-col">
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-purple-600 rounded-xl p-2.5 shadow-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Synapse AI</span>
          </div>
          <NotificationCenter />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start transition-all duration-200",
                isActive && "bg-gradient-to-r from-primary to-purple-600 text-primary-foreground shadow-lg scale-105",
                !isActive && "hover:bg-primary/10 hover:translate-x-1"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={cn("h-5 w-5 mr-3", isActive && "animate-pulse")} />
              <span className="font-medium">{item.label}</span>
            </Button>
          )
        })}
      </nav>

      <Separator />

      {/* Bottom Section */}
      <div className="p-3 space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => onViewChange('settings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2 p-2">
          <Avatar>
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || 'user@example.com'}</p>
          </div>
        </div>

        <Separator className="my-2" />

        <Button 
          variant="ghost" 
          className="w-full justify-start text-destructive hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}
