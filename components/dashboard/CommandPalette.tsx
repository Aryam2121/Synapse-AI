'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Command, X, FileText, MessageSquare, CheckSquare, Code, Settings } from 'lucide-react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: string
  type: 'chat' | 'document' | 'task' | 'code' | 'setting'
  title: string
  description: string
  timestamp?: string
  url?: string
}

interface CommandPaletteProps {
  onNavigate: (view: string) => void
}

export function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }

      if (isOpen) {
        if (e.key === 'Escape') {
          setIsOpen(false)
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && results[selectedIndex]) {
          e.preventDefault()
          handleSelect(results[selectedIndex])
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, results, selectedIndex])

  // Search functionality
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchResults = performSearch(query)
    setResults(searchResults)
    setSelectedIndex(0)
  }, [query])

  const performSearch = (searchQuery: string): SearchResult[] => {
    const lowerQuery = searchQuery.toLowerCase()
    const allResults: SearchResult[] = []

    // Quick actions
    const quickActions = [
      { id: 'new-chat', type: 'chat' as const, title: 'New Chat', description: 'Start a new conversation' },
      { id: 'upload-doc', type: 'document' as const, title: 'Upload Document', description: 'Upload and process a new document' },
      { id: 'create-task', type: 'task' as const, title: 'Create Task', description: 'Add a new task' },
      { id: 'analyze-code', type: 'code' as const, title: 'Analyze Code', description: 'Run code analysis' },
    ]

    // Navigation shortcuts
    const navigation = [
      { id: 'nav-chat', type: 'chat' as const, title: 'Go to Chat', description: 'Navigate to chat interface' },
      { id: 'nav-docs', type: 'document' as const, title: 'Go to Documents', description: 'Navigate to documents panel' },
      { id: 'nav-tasks', type: 'task' as const, title: 'Go to Tasks', description: 'Navigate to tasks panel' },
      { id: 'nav-code', type: 'code' as const, title: 'Go to Code', description: 'Navigate to code analysis' },
      { id: 'nav-analytics', type: 'chat' as const, title: 'Go to Analytics', description: 'View analytics dashboard' },
      { id: 'nav-settings', type: 'setting' as const, title: 'Go to Settings', description: 'Open settings' },
    ]

    // Filter results
    quickActions.forEach((action) => {
      if (action.title.toLowerCase().includes(lowerQuery) || action.description.toLowerCase().includes(lowerQuery)) {
        allResults.push(action)
      }
    })

    navigation.forEach((nav) => {
      if (nav.title.toLowerCase().includes(lowerQuery) || nav.description.toLowerCase().includes(lowerQuery)) {
        allResults.push(nav)
      }
    })

    return allResults
  }

  const handleSelect = (result: SearchResult) => {
    if (result.id.startsWith('nav-')) {
      const view = result.id.replace('nav-', '')
      onNavigate(view === 'docs' ? 'documents' : view)
    }
    setIsOpen(false)
    setQuery('')
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'chat': return MessageSquare
      case 'document': return FileText
      case 'task': return CheckSquare
      case 'code': return Code
      case 'setting': return Settings
      default: return Search
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-5 w-5 text-muted-foreground mr-2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search or type a command..."
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            autoFocus
          />
          <div className="flex items-center gap-1 ml-2 text-xs text-muted-foreground">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>
        </div>

        <ScrollArea className="max-h-96">
          {query && results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No results found for &quot;{query}&quot;</p>
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => {
                const Icon = getIcon(result.type)
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      index === selectedIndex
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    }`}
                  >
                    <div className="p-2 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{result.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{result.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Quick Actions</h3>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">Ctrl+K</kbd>
                    <span>Open command palette</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">Ctrl+N</kbd>
                    <span>New chat</span>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-muted rounded">Ctrl+/</kbd>
                    <span>View keyboard shortcuts</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
