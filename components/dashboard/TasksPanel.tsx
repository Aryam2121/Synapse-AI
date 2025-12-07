'use client'

import { useState } from 'react'
import { API_URL } from '@/lib/api-config'
import { Plus, Check, Trash2, Calendar, Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { formatRelativeTime } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  createdAt: Date
}

export function TasksPanel() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Review code documentation',
      description: 'Update API documentation for the new features',
      completed: false,
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000),
      createdAt: new Date(),
    },
    {
      id: '2',
      title: 'Prepare presentation',
      description: 'Create slides for the team meeting',
      completed: false,
      priority: 'medium',
      createdAt: new Date(),
    },
    {
      id: '3',
      title: 'Complete research paper',
      description: 'Finalize the introduction section',
      completed: true,
      priority: 'low',
      createdAt: new Date(Date.now() - 86400000),
    },
  ])

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    dueDate: '',
  })

  const [dialogOpen, setDialogOpen] = useState(false)

  const handleAddTask = async () => {
    if (!newTask.title.trim()) {
      toast.error('Please enter a task title')
      return
    }

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          due_date: newTask.dueDate || null,
        }),
      })

      if (!response.ok) throw new Error('Failed to create task')

      const data = await response.json()
      const task: Task = {
        id: data.id,
        title: newTask.title,
        description: newTask.description,
        completed: false,
        priority: newTask.priority,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
        createdAt: new Date(),
      }

      setTasks((prev) => [task, ...prev])
      setNewTask({ title: '', description: '', priority: 'medium', dueDate: '' })
      setDialogOpen(false)
      toast.success('Task created!')
    } catch (error) {
      toast.error('Failed to create task')
    }
  }

  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      )
      toast.success(task.completed ? 'Task marked as incomplete' : 'Task completed!')
    } catch (error) {
      toast.error('Failed to update task')
    }
  }

  const handleDeleteTask = async (id: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error('Failed to delete task')

      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast.success('Task deleted')
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleBulkDelete = async () => {
    const completedTasks = tasks.filter(t => t.completed)
    if (completedTasks.length === 0) {
      toast.error('No completed tasks to delete')
      return
    }

    for (const task of completedTasks) {
      await handleDeleteTask(task.id)
    }
  }

  const handleMarkAllComplete = () => {
    tasks.filter(t => !t.completed).forEach(t => handleToggleTask(t.id))
  }

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high':
        return 'text-red-500'
      case 'medium':
        return 'text-yellow-500'
      case 'low':
        return 'text-green-500'
    }
  }

  const TaskItem = ({ task }: { task: Task }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Card className="p-4 hover:bg-accent transition-colors">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={task.completed}
            onCheckedChange={() => handleToggleTask(task.id)}
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${task.completed ? 'line-through opacity-60' : ''}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
                <span className="capitalize">{task.priority}</span>
              </div>
              {task.dueDate && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatRelativeTime(task.dueDate)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteTask(task.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </Card>
    </motion.div>
  )

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and boost productivity with AI assistance
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="h-4 w-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Task title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleAddTask} className="w-full">
                  Create Task
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{tasks.length}</div>
              <div className="text-sm text-muted-foreground">Total Tasks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{activeTasks.length}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="active">
              <TabsList className="w-full">
                <TabsTrigger value="active" className="flex-1">
                  Active ({activeTasks.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1">
                  Completed ({completedTasks.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {activeTasks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No active tasks. Great job!</p>
                      </div>
                    ) : (
                      activeTasks.map((task) => <TaskItem key={task.id} task={task} />)
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="completed">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {completedTasks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Check className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No completed tasks yet</p>
                      </div>
                    ) : (
                      completedTasks.map((task) => <TaskItem key={task.id} task={task} />)
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
