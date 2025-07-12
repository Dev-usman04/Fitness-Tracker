// Helper functions for managing badges and achievements

import axios from 'axios';
import { getAuthToken } from './auth';
import { getWorkouts } from './storage';
import { getCurrentStreak } from './streaks';

const API_URL = '/api/badges';

// All available badges with their criteria
const ALL_BADGES = [
  {
    id: "first_workout",
    name: "Getting Started",
    description: "Complete your first workout",
    icon: "🎯",
    rarity: "common",
    criteria: { type: "workout_count", value: 1 },
  },
  {
    id: "workout_5",
    name: "Consistent",
    description: "Complete 5 workouts",
    icon: "💪",
    rarity: "common",
    criteria: { type: "workout_count", value: 5 },
  },
  {
    id: "workout_10",
    name: "Dedicated",
    description: "Complete 10 workouts",
    icon: "🏃‍♂️",
    rarity: "rare",
    criteria: { type: "workout_count", value: 10 },
  },
  {
    id: "workout_25",
    name: "Committed",
    description: "Complete 25 workouts",
    icon: "🏋️‍♂️",
    rarity: "rare",
    criteria: { type: "workout_count", value: 25 },
  },
  {
    id: "workout_50",
    name: "Fitness Enthusiast",
    description: "Complete 50 workouts",
    icon: "🔥",
    rarity: "epic",
    criteria: { type: "workout_count", value: 50 },
  },
  {
    id: "streak_3",
    name: "On Fire",
    description: "Maintain a 3-day workout streak",
    icon: "🔥",
    rarity: "common",
    criteria: { type: "streak", value: 3 },
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day workout streak",
    icon: "⚡",
    rarity: "rare",
    criteria: { type: "streak", value: 7 },
  },
  {
    id: "streak_14",
    name: "Unstoppable",
    description: "Maintain a 14-day workout streak",
    icon: "🚀",
    rarity: "epic",
    criteria: { type: "streak", value: 14 },
  },
  {
    id: "streak_30",
    name: "Legend",
    description: "Maintain a 30-day workout streak",
    icon: "👑",
    rarity: "legendary",
    criteria: { type: "streak", value: 30 },
  },
  {
    id: "calories_1000",
    name: "Calorie Crusher",
    description: "Burn 1,000 total calories",
    icon: "🔥",
    rarity: "common",
    criteria: { type: "total_calories", value: 1000 },
  },
  {
    id: "calories_5000",
    name: "Inferno",
    description: "Burn 5,000 total calories",
    icon: "🌋",
    rarity: "rare",
    criteria: { type: "total_calories", value: 5000 },
  },
  {
    id: "calories_10000",
    name: "Furnace",
    description: "Burn 10,000 total calories",
    icon: "🔥",
    rarity: "epic",
    criteria: { type: "total_calories", value: 10000 },
  },
  {
    id: "minutes_60",
    name: "Hour Power",
    description: "Complete 60 total minutes of exercise",
    icon: "⏰",
    rarity: "common",
    criteria: { type: "total_minutes", value: 60 },
  },
  {
    id: "minutes_300",
    name: "Time Master",
    description: "Complete 300 total minutes of exercise",
    icon: "⏱️",
    rarity: "rare",
    criteria: { type: "total_minutes", value: 300 },
  },
  {
    id: "minutes_1000",
    name: "Endurance King",
    description: "Complete 1,000 total minutes of exercise",
    icon: "👑",
    rarity: "epic",
    criteria: { type: "total_minutes", value: 1000 },
  },
  {
    id: "early_bird",
    name: "Early Bird",
    description: "Complete a workout before 8 AM",
    icon: "🌅",
    rarity: "rare",
    criteria: { type: "early_workout", value: 8 },
  },
  {
    id: "variety_seeker",
    name: "Variety Seeker",
    description: "Try 3 different workout types",
    icon: "🎨",
    rarity: "rare",
    criteria: { type: "workout_variety", value: 3 },
  },
]

export const getAllBadges = () => {
  // This can remain static if ALL_BADGES is not user-specific
  return ALL_BADGES;
};

export const getUserBadges = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error loading badges from API:', error);
    return [];
  }
};

export const saveBadge = async (badgeId) => {
  try {
    const token = getAuthToken();
    const response = await axios.post(API_URL, { badgeId }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving badge to API:', error);
    throw new Error('Failed to save badge');
  }
};

export const deleteBadge = async (badgeId) => {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${badgeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting badge from API:', error);
    throw new Error('Failed to delete badge');
  }
};

// Function to check if user has earned a specific badge
const hasBadge = async (badgeId) => {
  const userBadges = await getUserBadges();
  return userBadges.some((badge) => badge.badgeId === badgeId);
}

// Function to check and award new badges
export const checkAndAwardBadges = async () => {
  try {
    const workouts = await getWorkouts()
    if (!Array.isArray(workouts)) return []
    
    const newBadges = []

    // Calculate current stats
    const totalWorkouts = workouts.length
    const totalCalories = workouts.reduce((sum, workout) => sum + (workout.calories || 0), 0)
    const totalMinutes = workouts.reduce((sum, workout) => sum + workout.duration, 0)
    const currentStreak = await getCurrentStreak()
    const workoutTypes = [...new Set(workouts.map((w) => w.type))].length

    // Check each badge
    for (const badge of ALL_BADGES) {
      // Skip if user already has this badge
      if (await hasBadge(badge.id)) continue

      let earned = false

      switch (badge.criteria.type) {
        case "workout_count":
          earned = totalWorkouts >= badge.criteria.value
          break

        case "streak":
          earned = currentStreak >= badge.criteria.value
          break

        case "total_calories":
          earned = totalCalories >= badge.criteria.value
          break

        case "total_minutes":
          earned = totalMinutes >= badge.criteria.value
          break

        case "early_workout":
          // Check if any workout was logged with early morning time (this is simplified)
          // In a real app, you'd track workout time, not just date
          earned = workouts.some((workout) => {
            // For demo purposes, we'll award this badge randomly to some users
            return Math.random() < 0.1 // 10% chance
          })
          break

        case "workout_variety":
          earned = workoutTypes >= badge.criteria.value
          break

        default:
          earned = false
      }

      if (earned) {
        await saveBadge(badge.id)
        newBadges.push(badge)
      }
    }

    return newBadges
  } catch (error) {
    console.error('Error checking and awarding badges:', error)
    return []
  }
}

// Function to get badge progress (for future use)
export const getBadgeProgress = async (badgeId) => {
  try {
    const badge = ALL_BADGES.find((b) => b.id === badgeId)
    if (!badge) return null

    const workouts = await getWorkouts()
    if (!Array.isArray(workouts)) return null
    
    let current = 0

    switch (badge.criteria.type) {
      case "workout_count":
        current = workouts.length
        break

      case "streak":
        current = await getCurrentStreak()
        break

      case "total_calories":
        current = workouts.reduce((sum, workout) => sum + (workout.calories || 0), 0)
        break

      case "total_minutes":
        current = workouts.reduce((sum, workout) => sum + workout.duration, 0)
        break

      case "workout_variety":
        current = [...new Set(workouts.map((w) => w.type))].length
        break

      default:
        current = 0
    }

    return {
      current: current,
      target: badge.criteria.value,
      percentage: Math.min((current / badge.criteria.value) * 100, 100),
    }
  } catch (error) {
    console.error('Error getting badge progress:', error)
    return null
  }
}
