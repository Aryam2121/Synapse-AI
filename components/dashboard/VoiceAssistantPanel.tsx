'use client'

import { useState, useEffect, useRef } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Mic, MicOff, Volume2, PlayCircle, History, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from '@/components/ui/use-toast'

interface VoiceCommand {
  id: string
  transcription: string
  action: string
  timestamp: string
  success: boolean
}

export function VoiceAssistantPanel() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [history, setHistory] = useState<VoiceCommand[]>([])
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [isLoading, setIsLoading] = useState(false)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/voice/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      setHistory(data.history || [])
    } catch (error) {
      console.error('Failed to fetch voice history:', error)
    }
  }

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in your browser.',
        variant: 'destructive'
      })
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      const current = event.resultIndex
      const transcript = event.results[current][0].transcript
      setTranscript(transcript)

      if (event.results[current].isFinal) {
        processVoiceCommand(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      toast({
        title: 'Error',
        description: 'Failed to process voice command',
        variant: 'destructive'
      })
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const processVoiceCommand = async (text: string) => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/voice/command`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transcription: text })
      })

      const result = await response.json()
      
      toast({
        title: 'Command Processed',
        description: `Action: ${result.action} (${Math.round(result.confidence * 100)}% confidence)`
      })

      // Add to history
      setHistory(prev => [{
        id: `vc_${Date.now()}`,
        transcription: text,
        action: result.action,
        timestamp: new Date().toISOString(),
        success: true
      }, ...prev])

      // Execute the action based on result.action
      executeAction(result)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process command',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const executeAction = (result: any) => {
    // Implement actual action execution based on result.action
    switch (result.action) {
      case 'create_task':
        // Navigate to tasks or show task creation modal
        break
      case 'search':
        // Trigger search with parameters
        break
      case 'navigate':
        // Navigate to specified destination
        break
      default:
        // Handle as chat message
        break
    }
  }

  const speakText = async (text: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_URL}/api/voice/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, voice: selectedVoice, speed: 1.0 })
      })

      const data = await response.json()
      
      // In production, play the audio
      toast({
        title: 'Text-to-Speech',
        description: `Generated audio (${data.duration}s)`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate speech',
        variant: 'destructive'
      })
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_task':
        return '✓'
      case 'search':
        return '🔍'
      case 'navigate':
        return '→'
      default:
        return '💬'
    }
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Voice Assistant
        </h2>
        <Badge variant="outline" className="text-sm">
          AI-Powered Speech
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Input Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <motion.div
                animate={isListening ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Button
                  size="lg"
                  className={`h-32 w-32 rounded-full ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gradient-to-r from-primary to-purple-600'
                  }`}
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                >
                  {isListening ? (
                    <MicOff className="h-12 w-12" />
                  ) : (
                    <Mic className="h-12 w-12" />
                  )}
                </Button>
              </motion.div>
            </div>

            <AnimatePresence>
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 bg-muted rounded-lg"
                >
                  <p className="text-sm text-muted-foreground mb-1">Transcription:</p>
                  <p className="text-lg">{transcript}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <p className="text-sm font-medium">Try saying:</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>• "Create a task called Review documentation"</p>
                <p>• "Search for project files"</p>
                <p>• "Open analytics dashboard"</p>
                <p>• "Show me tasks due this week"</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <label className="text-sm font-medium mb-2 block">Voice Settings</label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="alloy">Alloy (Neutral)</option>
                <option value="echo">Echo (Male)</option>
                <option value="nova">Nova (Female)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Command History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {history.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No voice commands yet</p>
                  <p className="text-sm mt-2">Start speaking to see your history</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((cmd) => (
                    <motion.div
                      key={cmd.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-card border rounded-lg hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getActionIcon(cmd.action)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {cmd.transcription}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {cmd.action}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(cmd.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {cmd.success && (
                          <Badge variant="default" className="bg-green-500">
                            ✓
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => speakText("Hello! How can I help you today?")}
            >
              <Volume2 className="h-4 w-4" />
              Test Voice
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => processVoiceCommand("Show me today's tasks")}
            >
              Today's Tasks
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => processVoiceCommand("Open analytics")}
            >
              Analytics
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={fetchHistory}
            >
              <History className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
