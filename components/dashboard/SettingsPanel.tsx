'use client'

import { useState, useEffect } from 'react'
import { Moon, Sun, Bell, Lock, Database, Zap, Save, User2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsPanel() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    notifications: true,
    autoSave: true,
    dataCollection: false,
    aiModel: 'llama3.1',
    temperature: 0.7,
  })
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: ''
  })
  const [usageStats, setUsageStats] = useState<any>(null)

  useEffect(() => {
    fetchSettings()
    fetchProfile()
    fetchUsageStats()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('http://localhost:8000/api/settings/preferences', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setSettings({
          notifications: data.notifications,
          autoSave: data.auto_save,
          dataCollection: data.data_collection,
          aiModel: data.ai_model,
          temperature: data.temperature
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('http://localhost:8000/api/settings/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setProfile({
          name: data.name,
          email: data.email,
          bio: data.bio || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const fetchUsageStats = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('http://localhost:8000/api/settings/usage-stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setUsageStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
    }
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('http://localhost:8000/api/settings/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })
      
      if (res.ok) {
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Error saving settings')
    }
  }

  const handleProfileSave = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const res = await fetch('http://localhost:8000/api/settings/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      })
      
      if (res.ok) {
        toast.success('Profile updated successfully!')
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('Error updating profile')
    }
  }

  return (
    <div className="h-full p-6 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Synapse AI experience
          </p>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="w-full">
            <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
            <TabsTrigger value="ai" className="flex-1">AI Configuration</TabsTrigger>
            <TabsTrigger value="privacy" className="flex-1">Privacy</TabsTrigger>
            <TabsTrigger value="storage" className="flex-1">Storage</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how Synapse AI looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <div className="text-sm text-muted-foreground">
                      Choose your preferred theme
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('light')}
                    >
                      <Sun className="h-4 w-4 mr-2" />
                      Light
                    </Button>
                    <Button
                      variant={theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTheme('dark')}
                    >
                      <Moon className="h-4 w-4 mr-2" />
                      Dark
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Notifications</Label>
                    <div className="text-sm text-muted-foreground">
                      Receive notifications about your activities
                    </div>
                  </div>
                  <Switch
                    id="notifications"
                    checked={settings.notifications}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, notifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoSave">Auto Save</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically save your work
                    </div>
                  </div>
                  <Switch
                    id="autoSave"
                    checked={settings.autoSave}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, autoSave: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input 
                    id="bio" 
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself"
                  />
                </div>
                <Button onClick={handleProfileSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Configuration</CardTitle>
                <CardDescription>Configure your AI assistant behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <select
                    id="aiModel"
                    className="w-full p-2 border rounded-md bg-background"
                    value={settings.aiModel}
                    onChange={(e) => setSettings({ ...settings, aiModel: e.target.value })}
                  >
                    <option value="llama3.1">Llama 3.1 (FREE - Ollama)</option>
                    <option value="mistral">Mistral (FREE - Ollama)</option>
                    <option value="codellama">Code Llama (FREE - Ollama)</option>
                    <option value="gpt-4">GPT-4 (OpenAI - Requires API key)</option>
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI)</option>
                    <option value="claude-3">Claude 3 (Anthropic)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
                  <input
                    type="range"
                    id="temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) =>
                      setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground">
                    Lower = more focused, Higher = more creative
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                  />
                  <div className="text-xs text-muted-foreground">
                    Your API key is encrypted and stored securely
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropic-key">Anthropic API Key</Label>
                  <Input
                    id="anthropic-key"
                    type="password"
                    placeholder="sk-ant-..."
                  />
                </div>

                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Control your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dataCollection">Usage Analytics</Label>
                    <div className="text-sm text-muted-foreground">
                      Help improve Synapse AI by sharing anonymous usage data
                    </div>
                  </div>
                  <Switch
                    id="dataCollection"
                    checked={settings.dataCollection}
                    onCheckedChange={(checked) =>
                      setSettings({ ...settings, dataCollection: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Lock className="h-4 w-4" />
                    Data Encryption
                  </div>
                  <p className="text-sm text-muted-foreground">
                    All your data is encrypted at rest and in transit using AES-256 encryption
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Database className="h-4 w-4" />
                    Local Processing
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enable local AI processing to keep your data completely private
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Local Models
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button variant="destructive" size="sm">
                    Delete All Data
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Permanently delete all your data from our servers
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Storage & Data Management</CardTitle>
                <CardDescription>Manage your storage and vector database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-muted-foreground">2.4 GB / 10 GB</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: '24%' }}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Vector Database</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="pinecone">Pinecone (Cloud)</option>
                    <option value="chroma">Chroma (Local)</option>
                    <option value="weaviate">Weaviate</option>
                    <option value="qdrant">Qdrant</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Choose where to store your embeddings and RAG data
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Clear Cache</div>
                      <div className="text-xs text-muted-foreground">
                        Free up space by clearing temporary files
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Clear
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">Rebuild Vector Index</div>
                      <div className="text-xs text-muted-foreground">
                        Rebuild your RAG knowledge base from scratch
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Rebuild
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
