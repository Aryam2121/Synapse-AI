'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Users, Circle, MessageCircle, MousePointer, Edit, Eye } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

interface Participant {
  user_id: string
  username: string
  status: string
  avatar: string
  cursor_position?: { x: number; y: number }
  last_activity: string
}

interface Message {
  user_id: string
  username: string
  message: string
  timestamp: string
  type: string
}

export function RealTimeCollaborationPanel() {
  const [sessionId, setSessionId] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [editorContent, setEditorContent] = useState('')
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
  const wsRef = useRef<WebSocket | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)

  const createSession = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:8000/api/realtime/sessions/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_name: 'Collaboration Session',
          session_type: 'document'
        })
      })

      const data = await response.json()
      setSessionId(data.session_id)
      connectWebSocket(data.session_id)
      
      toast({
        title: 'Session Created!',
        description: `Session ID: ${data.session_id}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create session',
        variant: 'destructive'
      })
    }
  }

  const connectWebSocket = (sid: string) => {
    const token = localStorage.getItem('token')
    const ws = new WebSocket(`ws://localhost:8000/ws/${sid}?token=${token}`)
    
    ws.onopen = () => {
      setIsConnected(true)
      toast({ title: 'Connected to session' })
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'user_joined':
        case 'user_left':
          fetchParticipants()
          setMessages(prev => [...prev, {
            user_id: data.user_id,
            username: data.username,
            message: `${data.username} ${data.type === 'user_joined' ? 'joined' : 'left'} the session`,
            timestamp: new Date().toISOString(),
            type: 'system'
          }])
          break
        
        case 'text_edit':
          setEditorContent(data.content)
          break
        
        case 'cursor_move':
          updateCursor(data.user_id, data.position)
          break
        
        case 'comment':
          setMessages(prev => [...prev, {
            user_id: data.user_id,
            username: data.username,
            message: data.text,
            timestamp: data.timestamp,
            type: 'comment'
          }])
          break
      }
    }

    ws.onclose = () => {
      setIsConnected(false)
      toast({ title: 'Disconnected from session' })
    }

    wsRef.current = ws
  }

  const fetchParticipants = async () => {
    if (!sessionId) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:8000/api/realtime/sessions/${sessionId}/participants`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      setParticipants(data.participants || [])
    } catch (error) {
      console.error('Failed to fetch participants:', error)
    }
  }

  const sendEdit = (content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'text_edit',
        content,
        position: editorRef.current?.selectionStart || 0
      }))
    }
  }

  const sendCursor = (x: number, y: number) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'cursor_move',
        position: { x, y }
      }))
    }
  }

  const updateCursor = (userId: string, position: { x: number; y: number }) => {
    setParticipants(prev => 
      prev.map(p => 
        p.user_id === userId 
          ? { ...p, cursor_position: position }
          : p
      )
    )
  }

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    setEditorContent(content)
    sendEdit(content)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = e.clientX
    const y = e.clientY
    setCursorPosition({ x, y })
    sendCursor(x, y)
  }

  useEffect(() => {
    if (sessionId) {
      const interval = setInterval(fetchParticipants, 5000)
      return () => clearInterval(interval)
    }
  }, [sessionId])

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          Real-Time Collaboration
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "secondary"}>
            <Circle className={`h-2 w-2 mr-1 ${isConnected ? 'fill-green-500' : 'fill-gray-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {!sessionId ? (
            <Button onClick={createSession}>
              <Users className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          ) : (
            <Button variant="outline" size="sm">
              Session: {sessionId.slice(0, 8)}...
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Main Editor */}
        <div className="col-span-9 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Collaborative Editor
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    {participants.length} viewing
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative h-[calc(100%-80px)]" onMouseMove={handleMouseMove}>
              <textarea
                ref={editorRef}
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Start typing... others will see your changes in real-time"
                className="w-full h-full p-4 font-mono text-sm border rounded-md bg-muted/50 resize-none"
                disabled={!isConnected}
              />
              
              {/* Remote Cursors */}
              <AnimatePresence>
                {participants
                  .filter(p => p.cursor_position && p.user_id !== 'current_user')
                  .map((p) => (
                    <motion.div
                      key={p.user_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        left: p.cursor_position!.x,
                        top: p.cursor_position!.y,
                        pointerEvents: 'none'
                      }}
                    >
                      <MousePointer className="h-4 w-4" style={{ color: getColorForUser(p.user_id) }} />
                      <Badge className="text-xs ml-1" style={{ backgroundColor: getColorForUser(p.user_id) }}>
                        {p.username}
                      </Badge>
                    </motion.div>
                  ))}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="col-span-3 space-y-4">
          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2 pr-4">
                  {participants.map((participant) => (
                    <motion.div
                      key={participant.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback style={{ backgroundColor: getColorForUser(participant.user_id) }}>
                            {participant.username.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{participant.username}</p>
                          <p className="text-xs text-muted-foreground">
                            {participant.status === 'active' ? 'Active' : 'Idle'}
                          </p>
                        </div>
                      </div>
                      <Circle 
                        className={`h-2 w-2 ${
                          participant.status === 'active' 
                            ? 'fill-green-500' 
                            : 'fill-gray-400'
                        }`} 
                      />
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <Card className="flex-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Activity Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2 pr-4">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2 rounded-lg text-sm ${
                        msg.type === 'system'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.type === 'system' ? (
                        <p className="text-xs">{msg.message}</p>
                      ) : (
                        <>
                          <p className="font-medium">{msg.username}</p>
                          <p className="text-muted-foreground">{msg.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

const getColorForUser = (userId: string): string => {
  const colors = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
  ]
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}
