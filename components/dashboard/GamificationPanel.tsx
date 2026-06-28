'use client'

import { useState, useEffect } from 'react'
import { API_URL } from '@/lib/api-config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Star, Target, Zap, Award, TrendingUp, Gift, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { apiFetch, parseApiError, getAuthToken } from '@/lib/panel-auth'
import { PanelLoadError } from './PanelLoadError'

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  unlocked: boolean
  progress: number
  required: number
  rarity: string
}

interface Quest {
  id: string
  title: string
  description: string
  reward_points: number
  difficulty: string
  progress: number
  total: number
  time_remaining: string
}

export function GamificationPanel() {
  const [profile, setProfile] = useState<any>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [quests, setQuests] = useState<any>(null)
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [rewards, setRewards] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    fetchGamificationData()
  }, [])

  const fetchGamificationData = async () => {
    if (!getAuthToken()) {
      setLoadError('Please log in to use Gamification.')
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setLoadError(null)
    try {
      const [profileRes, achievementsRes, questsRes, leaderboardRes, rewardsRes] = await Promise.all([
        apiFetch('/api/gamification/profile'),
        apiFetch('/api/gamification/achievements'),
        apiFetch('/api/gamification/quests'),
        apiFetch('/api/gamification/leaderboard?timeframe=weekly'),
        apiFetch('/api/gamification/rewards'),
      ])

      if (profileRes.ok) setProfile(await profileRes.json())
      else setLoadError(await parseApiError(profileRes))

      if (achievementsRes.ok) {
        const achievementsData = await achievementsRes.json()
        setAchievements(achievementsData.achievements || [])
      }
      if (questsRes.ok) setQuests(await questsRes.json())
      if (leaderboardRes.ok) {
        const leaderboardData = await leaderboardRes.json()
        setLeaderboard(leaderboardData.leaderboard || [])
      }
      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json()
        setRewards(rewardsData.rewards || [])
      }
    } catch {
      setLoadError('Failed to connect to the server. Is the backend running on port 8000?')
      toast.error('Failed to load gamification data')
    } finally {
      setIsLoading(false)
    }
  }

  const claimDailyBonus = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/gamification/claim-daily-bonus`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(await parseApiError(response))
      const data = await response.json()

      toast.success(data.message || 'Daily bonus claimed!')
      
      fetchGamificationData()
    } catch (error) {
      toast.error('Failed to claim bonus')
    }
  }

  const redeemReward = async (rewardId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${API_URL}/api/gamification/rewards/${rewardId}/redeem`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) throw new Error(await parseApiError(response))
      const data = await response.json()

      toast.success(data.message || 'Reward unlocked!')
      
      fetchGamificationData()
    } catch (error) {
      toast.error('Failed to redeem reward')
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-yellow-500 border-yellow-500'
      case 'epic': return 'text-purple-500 border-purple-500'
      case 'rare': return 'text-blue-500 border-blue-500'
      case 'uncommon': return 'text-green-500 border-green-500'
      default: return 'text-gray-500 border-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full p-6 space-y-6 overflow-auto">
      {loadError && <PanelLoadError message={loadError} onRetry={fetchGamificationData} />}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          Gamification
        </h2>
        <Button onClick={claimDailyBonus} className="gap-2">
          <Gift className="h-4 w-4" />
          Claim Daily Bonus
        </Button>
      </div>

      {/* Profile Card */}
      {profile && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-purple-500/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">{profile.rank_icon}</div>
                <div>
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    Level {profile.level}
                    <Badge className="bg-gradient-to-r from-primary to-purple-600">
                      {profile.rank}
                    </Badge>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.xp} / {profile.xp_to_next_level} XP
                  </p>
                  <Progress value={(profile.xp / profile.xp_to_next_level) * 100} className="mt-2 w-64" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{profile.stats.tasks_completed}</p>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{profile.stats.streak_days}🔥</p>
                  <p className="text-sm text-muted-foreground">Streak</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{profile.stats.achievements_unlocked}</p>
                  <p className="text-sm text-muted-foreground">Achievements</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="achievements" className="flex-1">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="quests">Quests</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        {/* Achievements */}
        <TabsContent value="achievements" className="space-y-4 mt-4">
          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`${achievement.unlocked ? 'border-primary/50' : 'opacity-60'} ${getRarityColor(achievement.rarity)}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{achievement.icon}</div>
                          <div>
                            <CardTitle className="text-lg">{achievement.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                            <Badge variant="outline" className={`mt-2 capitalize ${getRarityColor(achievement.rarity)}`}>
                              {achievement.rarity}
                            </Badge>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg">
                          {achievement.points} XP
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{Math.round(achievement.progress * 100)}%</span>
                        </div>
                        <Progress value={achievement.progress * 100} />
                        {achievement.unlocked && (
                          <p className="text-xs text-green-500 flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            Unlocked!
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Quests */}
        <TabsContent value="quests" className="space-y-4 mt-4">
          {quests && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Quests
                </h3>
                <div className="space-y-3">
                  {quests.daily_quests?.map((quest: Quest) => (
                    <Card key={quest.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{quest.title}</h4>
                            <p className="text-sm text-muted-foreground">{quest.description}</p>
                          </div>
                          <Badge variant="secondary">{quest.reward_points} XP</Badge>
                        </div>
                        <Progress value={(quest.progress / quest.total) * 100} className="mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{quest.progress} / {quest.total}</span>
                          <span>⏱️ {quest.time_remaining}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Weekly Quests
                </h3>
                <div className="space-y-3">
                  {quests.weekly_quests?.map((quest: Quest) => (
                    <Card key={quest.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold">{quest.title}</h4>
                            <p className="text-sm text-muted-foreground">{quest.description}</p>
                          </div>
                          <Badge className="bg-purple-500">{quest.reward_points} XP</Badge>
                        </div>
                        <Progress value={(quest.progress / quest.total) * 100} className="mb-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>{quest.progress} / {quest.total}</span>
                          <span>⏱️ {quest.time_remaining}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Leaderboard */}
        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Weekly Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((user, idx) => (
                  <motion.div
                    key={user.user_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      user.is_current_user ? 'bg-primary/10 border-2 border-primary' : 'bg-card'
                    }`}
                  >
                    <div className="text-2xl font-bold w-8 text-center">
                      {user.rank <= 3 ? user.badge : user.rank}
                    </div>
                    <div className="text-3xl">{user.avatar}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{user.username}</p>
                      <p className="text-sm text-muted-foreground">Level {user.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{user.points} XP</p>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className={`h-3 w-3 ${user.trend === 'up' ? 'text-green-500' : 'text-gray-500'}`} />
                        <span className="text-muted-foreground">{user.trend}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards" className="mt-4">
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg">
            <p className="text-lg font-semibold">
              Available Points: <span className="text-primary">{profile?.total_points || 0}</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={!reward.available ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{reward.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-lg capitalize">
                      {reward.type}
                    </Badge>
                    <Button
                      onClick={() => redeemReward(reward.id)}
                      disabled={!reward.available || (profile?.total_points || 0) < reward.cost}
                      className="gap-2"
                    >
                      <Star className="h-4 w-4" />
                      {reward.cost} Points
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
