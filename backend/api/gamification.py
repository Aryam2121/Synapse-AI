from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from .auth import get_current_active_user

router = APIRouter(prefix="/api/gamification", tags=["gamification"])

class Achievement(BaseModel):
    id: str
    name: str
    description: str
    icon: str
    points: int
    unlocked: bool
    unlocked_at: Optional[str] = None
    progress: float
    required: int

class Quest(BaseModel):
    id: str
    title: str
    description: str
    reward_points: int
    reward_badges: List[str]
    difficulty: str
    deadline: Optional[str]
    progress: int
    total: int
    completed: bool

@router.get("/profile")
async def get_gamification_profile(current_user: dict = Depends(get_current_active_user)):
    """
    Get user's gamification profile with level, XP, and stats.
    """
    return {
        "user_id": current_user["sub"],
        "level": 12,
        "xp": 4850,
        "xp_to_next_level": 5000,
        "total_points": 12450,
        "rank": "Master",
        "rank_icon": "👑",
        "stats": {
            "tasks_completed": 247,
            "streak_days": 18,
            "longest_streak": 45,
            "achievements_unlocked": 23,
            "quests_completed": 15,
            "challenges_won": 8
        },
        "next_rank": {
            "name": "Grandmaster",
            "points_required": 15000,
            "progress": 0.83
        }
    }

@router.get("/achievements")
async def get_achievements(current_user: dict = Depends(get_current_active_user)):
    """
    Get all achievements with unlock status and progress.
    """
    achievements = [
        {
            "id": "ach_first_task",
            "name": "Getting Started",
            "description": "Complete your first task",
            "icon": "🎯",
            "category": "basics",
            "points": 10,
            "unlocked": True,
            "unlocked_at": "2025-11-15T10:00:00Z",
            "progress": 1.0,
            "required": 1,
            "rarity": "common"
        },
        {
            "id": "ach_task_master",
            "name": "Task Master",
            "description": "Complete 100 tasks",
            "icon": "🏆",
            "category": "productivity",
            "points": 100,
            "unlocked": True,
            "unlocked_at": "2025-12-01T14:30:00Z",
            "progress": 1.0,
            "required": 100,
            "rarity": "rare"
        },
        {
            "id": "ach_streak_warrior",
            "name": "Streak Warrior",
            "description": "Maintain a 30-day streak",
            "icon": "🔥",
            "category": "consistency",
            "points": 150,
            "unlocked": False,
            "unlocked_at": None,
            "progress": 0.6,
            "required": 30,
            "rarity": "epic"
        },
        {
            "id": "ach_early_bird",
            "name": "Early Bird",
            "description": "Complete tasks before 8 AM for 7 days",
            "icon": "🌅",
            "category": "habits",
            "points": 50,
            "unlocked": False,
            "progress": 0.43,
            "required": 7,
            "rarity": "uncommon"
        },
        {
            "id": "ach_collaboration_king",
            "name": "Collaboration King",
            "description": "Collaborate on 50 shared items",
            "icon": "👥",
            "category": "teamwork",
            "points": 120,
            "unlocked": False,
            "progress": 0.32,
            "required": 50,
            "rarity": "rare"
        },
        {
            "id": "ach_ai_wizard",
            "name": "AI Wizard",
            "description": "Use AI features 500 times",
            "icon": "🧙",
            "category": "innovation",
            "points": 200,
            "unlocked": False,
            "progress": 0.534,
            "required": 500,
            "rarity": "legendary"
        }
    ]
    
    return {
        "achievements": achievements,
        "total": len(achievements),
        "unlocked": sum(1 for a in achievements if a["unlocked"]),
        "categories": ["basics", "productivity", "consistency", "habits", "teamwork", "innovation"]
    }

@router.get("/quests")
async def get_active_quests(current_user: dict = Depends(get_current_active_user)):
    """
    Get active daily/weekly quests with rewards.
    """
    return {
        "daily_quests": [
            {
                "id": "dq_1",
                "title": "Complete 5 tasks today",
                "description": "Finish 5 tasks before midnight",
                "reward_points": 50,
                "reward_badges": ["productive_day"],
                "difficulty": "easy",
                "deadline": (datetime.now() + timedelta(hours=8)).isoformat(),
                "progress": 3,
                "total": 5,
                "completed": False,
                "time_remaining": "8h 23m"
            },
            {
                "id": "dq_2",
                "title": "Use voice commands 3 times",
                "description": "Practice using the voice assistant",
                "reward_points": 30,
                "reward_badges": ["voice_enthusiast"],
                "difficulty": "easy",
                "deadline": (datetime.now() + timedelta(hours=8)).isoformat(),
                "progress": 1,
                "total": 3,
                "completed": False,
                "time_remaining": "8h 23m"
            }
        ],
        "weekly_quests": [
            {
                "id": "wq_1",
                "title": "Maintain 7-day streak",
                "description": "Complete at least one task every day this week",
                "reward_points": 200,
                "reward_badges": ["weekly_warrior", "streak_keeper"],
                "difficulty": "medium",
                "deadline": (datetime.now() + timedelta(days=3)).isoformat(),
                "progress": 4,
                "total": 7,
                "completed": False,
                "time_remaining": "3d 8h"
            },
            {
                "id": "wq_2",
                "title": "Collaborate on 10 items",
                "description": "Share or work on shared items",
                "reward_points": 150,
                "reward_badges": ["team_player"],
                "difficulty": "medium",
                "deadline": (datetime.now() + timedelta(days=3)).isoformat(),
                "progress": 7,
                "total": 10,
                "completed": False,
                "time_remaining": "3d 8h"
            }
        ],
        "special_quests": [
            {
                "id": "sq_1",
                "title": "Holiday Challenge",
                "description": "Complete 50 tasks in December",
                "reward_points": 500,
                "reward_badges": ["december_champion", "holiday_hero"],
                "difficulty": "hard",
                "deadline": "2025-12-31T23:59:59Z",
                "progress": 28,
                "total": 50,
                "completed": False,
                "time_remaining": "27d"
            }
        ]
    }

@router.get("/leaderboard")
async def get_leaderboard(
    timeframe: str = "weekly",
    current_user: dict = Depends(get_current_active_user)
):
    """
    Get leaderboard rankings (daily/weekly/monthly/all-time).
    """
    return {
        "timeframe": timeframe,
        "your_rank": 7,
        "leaderboard": [
            {
                "rank": 1,
                "user_id": "user_alice",
                "username": "Alice Chen",
                "avatar": "👩‍💼",
                "points": 2450,
                "level": 15,
                "badge": "🥇",
                "trend": "up"
            },
            {
                "rank": 2,
                "user_id": "user_bob",
                "username": "Bob Smith",
                "avatar": "👨‍💻",
                "points": 2380,
                "level": 14,
                "badge": "🥈",
                "trend": "same"
            },
            {
                "rank": 3,
                "user_id": "user_carol",
                "username": "Carol Johnson",
                "avatar": "👩‍🎨",
                "points": 2250,
                "level": 14,
                "badge": "🥉",
                "trend": "up"
            },
            {
                "rank": 7,
                "user_id": current_user["sub"],
                "username": "You",
                "avatar": "🎯",
                "points": 1850,
                "level": 12,
                "badge": "⭐",
                "trend": "up",
                "is_current_user": True
            }
        ],
        "total_participants": 247
    }

@router.get("/rewards")
async def get_available_rewards(current_user: dict = Depends(get_current_active_user)):
    """
    Get rewards that can be redeemed with points.
    """
    return {
        "available_points": 4850,
        "rewards": [
            {
                "id": "reward_theme",
                "name": "Premium Theme",
                "description": "Unlock exclusive dark mode theme",
                "cost": 500,
                "type": "cosmetic",
                "icon": "🎨",
                "available": True
            },
            {
                "id": "reward_automation",
                "name": "Extra Automation Slot",
                "description": "Add one more automation rule",
                "cost": 1000,
                "type": "feature",
                "icon": "⚡",
                "available": True
            },
            {
                "id": "reward_storage",
                "name": "Storage Upgrade",
                "description": "Increase storage by 5GB",
                "cost": 1500,
                "type": "upgrade",
                "icon": "💾",
                "available": True
            },
            {
                "id": "reward_title",
                "name": "Master Title",
                "description": "Display 'Master' title on profile",
                "cost": 2000,
                "type": "cosmetic",
                "icon": "👑",
                "available": True
            },
            {
                "id": "reward_legendary",
                "name": "Legendary Status",
                "description": "Exclusive legendary badge and perks",
                "cost": 10000,
                "type": "prestige",
                "icon": "💎",
                "available": False
            }
        ]
    }

@router.post("/rewards/{reward_id}/redeem")
async def redeem_reward(
    reward_id: str,
    current_user: dict = Depends(get_current_active_user)
):
    """
    Redeem a reward using accumulated points.
    """
    return {
        "reward_id": reward_id,
        "redeemed": True,
        "points_spent": 1000,
        "points_remaining": 3850,
        "message": "Reward unlocked successfully! 🎉"
    }

@router.get("/challenges")
async def get_challenges(current_user: dict = Depends(get_current_active_user)):
    """
    Get community challenges and competitions.
    """
    return {
        "active_challenges": [
            {
                "id": "chal_productivity",
                "name": "Productivity Sprint",
                "description": "Most tasks completed in 24 hours",
                "type": "competition",
                "participants": 89,
                "prize": "500 XP + Exclusive Badge",
                "ends_in": "14h 32m",
                "your_rank": 12,
                "your_score": 45
            },
            {
                "id": "chal_streak",
                "name": "Streak Masters",
                "description": "Longest current streak wins",
                "type": "competition",
                "participants": 156,
                "prize": "1000 XP + Premium Theme",
                "ends_in": "6d 8h",
                "your_rank": 23,
                "your_score": 18
            }
        ]
    }

@router.post("/claim-daily-bonus")
async def claim_daily_bonus(current_user: dict = Depends(get_current_active_user)):
    """
    Claim daily login bonus with streak multiplier.
    """
    streak = 18
    base_bonus = 50
    streak_multiplier = min(streak * 0.1, 2.0)
    total_bonus = int(base_bonus * (1 + streak_multiplier))
    
    return {
        "bonus_claimed": total_bonus,
        "streak_days": streak,
        "multiplier": f"{streak_multiplier:.1f}x",
        "next_bonus_in": "23h 45m",
        "message": f"Daily bonus claimed! +{total_bonus} XP 🎁"
    }

@router.get("/stats/weekly")
async def get_weekly_stats(current_user: dict = Depends(get_current_active_user)):
    """
    Get weekly gamification statistics and progress.
    """
    return {
        "week": "Dec 1-7, 2025",
        "xp_earned": 1250,
        "points_earned": 3400,
        "achievements_unlocked": 3,
        "quests_completed": 8,
        "rank_improvement": +2,
        "highlights": [
            "Unlocked 'Task Master' achievement 🏆",
            "Completed 7-day streak! 🔥",
            "Moved up to rank #7 in leaderboard 📈"
        ],
        "comparison": {
            "vs_last_week": "+45% XP",
            "vs_average": "+23% above average"
        }
    }
