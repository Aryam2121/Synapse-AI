'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Filter, TrendingUp, FileText, MessageSquare, Code, CheckSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { apiFetch, parseApiError, getAuthToken } from '@/lib/panel-auth'
import { PanelLoadError } from './PanelLoadError'

interface SearchResult {
  id: string
  type: string
  title: string
  content: string
  relevance_score: number
  highlights: string[]
  metadata: Record<string, any>
  timestamp: string
}

interface AdvancedSearchPanelProps {
  onOpenConversation?: (conversationId: string) => void
}

export function AdvancedSearchPanel({ onOpenConversation }: AdvancedSearchPanelProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions()
    }
  }, [query])

  const fetchSuggestions = async () => {
    try {
      const response = await apiFetch(
        `/api/search/suggestions?prefix=${encodeURIComponent(query)}`
      )
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch {
      /* optional */
    }
  }

  const performSearch = async (searchQuery: string = query) => {
    if (!searchQuery.trim()) return

    if (!getAuthToken()) {
      setLoadError('Please log in to search.')
      return
    }
    setIsSearching(true)
    setLoadError(null)
    try {
      const response = await apiFetch('/api/search/semantic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          filters: activeFilters.length > 0 ? { types: activeFilters } : null,
          limit: 20,
        }),
      })

      if (!response.ok) throw new Error(await parseApiError(response))

      const data = await response.json()
      const list = data.results || []
      setResults(list)
      toast.success(`Found ${data.total ?? list.length} results`)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Search failed'
      setLoadError(msg)
      toast.error(msg)
    } finally {
      setIsSearching(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'chat':
        return <MessageSquare className="h-4 w-4" />
      case 'code':
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'bg-blue-500'
      case 'document':
        return 'bg-green-500'
      case 'chat':
        return 'bg-purple-500'
      case 'code':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    )
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {loadError && <PanelLoadError message={loadError} onRetry={() => performSearch()} />}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Advanced Search
        </h2>
        <Badge variant="outline" className="text-sm">
          AI Semantic Search
        </Badge>
      </div>

      {/* Search Bar */}
      <Card className="border-2 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search across all your workspace... (e.g., 'tasks due this week')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && performSearch()}
                className="pl-10 h-12 text-lg"
              />
              
              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && query.length >= 2 && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-10">
                  <CardContent className="p-2">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        className="w-full text-left p-2 hover:bg-muted rounded-md transition-colors"
                        onClick={() => {
                          setQuery(suggestion)
                          performSearch(suggestion)
                          setSuggestions([])
                        }}
                      >
                        <Search className="inline h-3 w-3 mr-2" />
                        {suggestion}
                      </button>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
            <Button
              size="lg"
              className="px-8"
              onClick={() => performSearch()}
              disabled={isSearching || !query.trim()}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mt-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium mr-2">Filter by:</span>
            {['task', 'document', 'chat', 'code'].map((type) => (
              <Button
                key={type}
                variant={activeFilters.includes(type) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleFilter(type)}
                className="capitalize"
              >
                {getTypeIcon(type)}
                <span className="ml-1">{type}s</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs defaultValue="all" className="flex-1">
        <TabsList>
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="chats">Conversations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <ScrollArea className="h-[600px]">
            {results.length === 0 && !isSearching && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Start Searching</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Search your saved chats, uploaded documents, and tasks.
                    Try &quot;resume&quot;, a task title, or words from a past conversation.
                  </p>
                </CardContent>
              </Card>
            )}

            {isSearching && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            <div className="space-y-3">
              {results.map((result, idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => {
                      const convId = result.metadata?.conversation_id as string | undefined
                      if (result.type === 'chat' && convId && onOpenConversation) {
                        onOpenConversation(convId)
                        toast.success(`Opening: ${result.title}`)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(result.type)} bg-opacity-10`}>
                          {getTypeIcon(result.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{result.title}</h3>
                            <Badge variant="outline" className="capitalize">
                              {result.type}
                            </Badge>
                            <Badge variant="secondary" className="ml-auto">
                              {Math.round(result.relevance_score * 100)}% match
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {result.content}
                          </p>
                          
                          {result.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {result.highlights.map((highlight, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(result.timestamp).toLocaleDateString()}</span>
                            {result.metadata.priority && (
                              <span className="capitalize">Priority: {result.metadata.priority}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="tasks">
          <p className="text-muted-foreground">Task-specific results will appear here</p>
        </TabsContent>

        <TabsContent value="documents">
          <p className="text-muted-foreground">Document-specific results will appear here</p>
        </TabsContent>

        <TabsContent value="chats">
          <p className="text-muted-foreground">Conversation-specific results will appear here</p>
        </TabsContent>
      </Tabs>

      {/* Trending Searches */}
      {results.length === 0 && !isSearching && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trending Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {['project deadlines', 'team meetings', 'code reviews', 'analytics reports'].map((trend) => (
                <Button
                  key={trend}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setQuery(trend)
                    performSearch(trend)
                  }}
                >
                  {trend}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
