'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  Share2,
  MessageCircle,
  Plus,
  UserPlus,
  Activity,
  FileText,
  CheckSquare,
  AtSign,
  Circle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface Workspace {
  id: string
  name: string
  description: string
  members: string[]
  activity_count: number
  last_activity: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  last_seen: string
  current_activity?: string
}

export function CollaborationPanel() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [mentions, setMentions] = useState<any[]>([])
  const [selectedWorkspace, setSelectedWorkspace] = useState<string | null>(null)

  useEffect(() => {
    fetchCollaborationData()
  }, [])

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceActivity(selectedWorkspace)
    }
  }, [selectedWorkspace])

  const fetchCollaborationData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const headers = { Authorization: `Bearer ${token}` }

      const [workspacesRes, membersRes, mentionsRes] = await Promise.all([
        fetch(`${API_URL}/api/collaboration/workspaces`, { headers }),
        fetch(`${API_URL}/api/collaboration/team-members`, { headers }),
        fetch(`${API_URL}/api/collaboration/mentions`, { headers })
      ])

      if (workspacesRes.ok) {
        const data = await workspacesRes.json()
        setWorkspaces(data.workspaces)
        if (data.workspaces.length > 0) {
          setSelectedWorkspace(data.workspaces[0].id)
        }
      }
      if (membersRes.ok) setTeamMembers((await membersRes.json()).members)
      if (mentionsRes.ok) setMentions((await mentionsRes.json()).mentions)
    } catch (error) {
      console.error('Failed to fetch collaboration data:', error)
    }
  }

  const fetchWorkspaceActivity = async (workspaceId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${API_URL}/api/collaboration/workspaces/${workspaceId}/activity`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        setActivities(data.activities)
      }
    } catch (error) {
      console.error('Failed to fetch activity:', error)
    }
  }

  const createWorkspace = () => {
    toast.info('Create workspace dialog would open here')
  }

  const inviteMembers = () => {
    toast.info('Invite members dialog would open here')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'fill-green-500 text-green-500'
      case 'busy': return 'fill-yellow-500 text-yellow-500'
      case 'offline': return 'fill-gray-400 text-gray-400'
      default: return 'fill-gray-400 text-gray-400'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment': return MessageCircle
      case 'document': return FileText
      case 'task': return CheckSquare
      default: return Activity
    }
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Team Collaboration
            </h1>
            <p className="text-muted-foreground">
              Work together in shared workspaces with real-time collaboration
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={inviteMembers}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Team
            </Button>
            <Button onClick={createWorkspace}>
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workspaces */}
            <Card>
              <CardHeader>
                <CardTitle>Shared Workspaces</CardTitle>
                <CardDescription>Collaborative spaces for your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {workspaces.map((workspace) => (
                  <div
                    key={workspace.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedWorkspace === workspace.id ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedWorkspace(workspace.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{workspace.name}</h3>
                        <p className="text-sm text-muted-foreground">{workspace.description}</p>
                      </div>
                      <Badge variant="outline">{workspace.members.length} members</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>
                        <Activity className="h-3 w-3 inline mr-1" />
                        {workspace.activity_count} activities
                      </span>
                      <span>Last active {workspace.last_activity}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  {selectedWorkspace ? 'Activity in selected workspace' : 'Select a workspace to view activity'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {activities.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type)
                      return (
                        <motion.div
                          key={activity.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-primary/10 h-fit">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{activity.user}</span>
                              <span className="text-sm text-muted-foreground">{activity.action}</span>
                              <span className="font-medium text-sm">{activity.target}</span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.preview}
                            </p>
                            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Team Members</span>
                  <Badge>{teamMembers.filter(m => m.status === 'online').length} online</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent transition-colors">
                        <div className="relative">
                          <Avatar>
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <Circle 
                            className={`absolute -bottom-1 -right-1 h-4 w-4 ${getStatusColor(member.status)}`}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.role}</p>
                          {member.current_activity && (
                            <p className="text-xs text-primary mt-1">{member.current_activity}</p>
                          )}
                          {!member.current_activity && (
                            <p className="text-xs text-muted-foreground">{member.last_seen}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Mentions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AtSign className="h-5 w-5" />
                    Mentions
                  </span>
                  <Badge variant="destructive">
                    {mentions.filter(m => !m.read).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mentions.map((mention) => (
                    <div
                      key={mention.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all ${
                        !mention.read ? 'bg-primary/5 border-primary/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-medium text-sm">{mention.author}</span>
                        <span className="text-xs text-muted-foreground">{mention.timestamp}</span>
                      </div>
                      <p className="text-sm mb-2">{mention.content}</p>
                      <p className="text-xs text-muted-foreground">{mention.location}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
