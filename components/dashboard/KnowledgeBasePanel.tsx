'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Book, Search, TrendingUp, Star, Clock, Tag, ThumbsUp, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { apiFetch, parseApiError, getAuthToken } from '@/lib/panel-auth'
import { PanelLoadError } from './PanelLoadError'

interface Article {
  id: string
  title: string
  content: string
  tags: string[]
  category: string
  metadata: {
    author: string
    created_at: string
    word_count: number
    reading_time_minutes: number
    views: number
    likes: number
  }
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  article_count: number
  color: string
}

interface SearchResult extends Article {
  relevance_score: number
  excerpt: string
}

/** API list items use `summary`; detail uses `content` — normalize for UI */
function normalizeArticle(raw: Record<string, unknown>): Article {
  const meta = (raw.metadata as Article['metadata']) || {}
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? 'Untitled'),
    content: String(raw.content ?? raw.summary ?? ''),
    tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
    category: String(raw.category ?? 'general'),
    metadata: {
      author: String(meta.author ?? raw.author ?? 'Unknown'),
      created_at: String(meta.created_at ?? raw.created_at ?? ''),
      word_count: Number(meta.word_count ?? 0),
      reading_time_minutes: Number(meta.reading_time_minutes ?? raw.reading_time ?? 5),
      views: Number(meta.views ?? raw.views ?? 0),
      likes: Number(meta.likes ?? raw.likes ?? 0),
    },
  }
}

export function KnowledgeBasePanel() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [trendingArticles, setTrendingArticles] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadKnowledge = async () => {
    if (!getAuthToken()) {
      setLoadError('Please log in to use Knowledge Base.')
      return
    }
    setLoadError(null)
    try {
      const [articlesRes, categoriesRes, trendingRes] = await Promise.all([
        apiFetch('/api/knowledge/articles'),
        apiFetch('/api/knowledge/categories'),
        apiFetch('/api/knowledge/trending?period=week'),
      ])
      if (articlesRes.ok) {
        const data = await articlesRes.json()
        setArticles((data.articles || []).map((a: Record<string, unknown>) => normalizeArticle(a)))
      } else {
        setLoadError(await parseApiError(articlesRes))
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data.categories || [])
      }
      if (trendingRes.ok) {
        const data = await trendingRes.json()
        setTrendingArticles(data.trending || data.articles || [])
      }
    } catch {
      setLoadError('Failed to connect to the server.')
    }
  }

  const searchArticles = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    try {
      const response = await apiFetch('/api/knowledge/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, filters: {} }),
      })

      if (!response.ok) throw new Error(await parseApiError(response))

      const data = await response.json()
      setSearchResults(
        (data.results || []).map((r: Record<string, unknown>) => ({
          ...normalizeArticle(r),
          relevance_score: Number(r.relevance_score ?? 0),
          excerpt: String(r.excerpt ?? r.summary ?? r.content ?? '').slice(0, 200),
        }))
      )
      toast.success(`Found ${data.results?.length || 0} articles`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  useEffect(() => {
    loadKnowledge()
  }, [])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchArticles()
    }
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {loadError && <PanelLoadError message={loadError} onRetry={loadKnowledge} />}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
          Knowledge Base
        </h2>
        <Button>
          <Book className="h-4 w-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              placeholder="Search articles, tutorials, guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchArticles} disabled={isSearching}>
              <Search className="h-4 w-4 mr-2" />
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="browse" className="flex-1">
        <TabsList>
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          {searchResults.length > 0 && (
            <TabsTrigger value="search">Search Results ({searchResults.length})</TabsTrigger>
          )}
        </TabsList>

        {/* Browse */}
        <TabsContent value="browse" className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {articles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{article.title}</h3>
                          <Badge variant="outline">{article.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {(article.content || '').slice(0, 200)}
                          {(article.content || '').length > 200 ? '...' : ''}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.metadata?.reading_time_minutes ?? 5} min read
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {(article.metadata?.views ?? 0).toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            {article.metadata?.likes ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          {(article.tags || []).slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              <Tag className="h-2 w-2 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Categories */}
        <TabsContent value="categories" className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            {categories.map((category, idx) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card 
                  className="hover:shadow-lg transition-all cursor-pointer"
                  style={{ borderColor: category.color }}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <h3>{category.name}</h3>
                        <p className="text-sm font-normal text-muted-foreground mt-1">
                          {category.description}
                        </p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        {category.article_count} articles
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Browse →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Trending */}
        <TabsContent value="trending" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Trending This Week
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {trendingArticles.map((article, idx) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold">
                        #{idx + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{article.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {article.category}
                          </Badge>
                          {article.growth && (
                            <Badge className="bg-green-500/10 text-green-600">
                              <TrendingUp className="h-2 w-2 mr-1" />
                              {article.growth}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-yellow-500">
                          {(article.trending_score * 100).toFixed(0)}
                        </p>
                        <p className="text-xs text-muted-foreground">Score</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <TabsContent value="search" className="mt-4">
            <div className="space-y-3">
              {searchResults.map((result, idx) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{result.title}</h3>
                            <Badge variant="outline">{result.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {result.excerpt}
                          </p>
                          <div className="flex items-center gap-2">
                            {result.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-center px-4">
                          <div className="text-2xl font-bold text-primary">
                            {(result.relevance_score * 100).toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground">Match</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
