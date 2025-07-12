// Helper functions for calculating workout streaks

import { getWorkouts } from "./storage"

// Function to calculate current workout streak
export const getCurrentStreak = async () => {
  try {
    const workouts = await getWorkouts()
    
    if (!Array.isArray(workouts) || workouts.length === 0) return 0

    // Get unique workout dates and sort them (newest first)
    const workoutDates = [...new Set(workouts.map((w) => w.date))].sort((a, b) => new Date(b) - new Date(a))

    if (workoutDates.length === 0) return 0

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Get yesterday's date
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    // Check if the most recent workout was today or yesterday
    const latestWorkoutDate = new Date(workoutDates[0])
    latestWorkoutDate.setHours(0, 0, 0, 0)

    // If the latest workout is older than yesterday, streak is 0
    if (latestWorkoutDate < yesterday) {
      return 0
    }

    // Count consecutive days working backwards from the latest workout
    let streak = 0
    const currentDate = new Date(latestWorkoutDate)

    for (const dateStr of workoutDates) {
      const workoutDate = new Date(dateStr)
      workoutDate.setHours(0, 0, 0, 0)

      if (workoutDate.getTime() === currentDate.getTime()) {
        streak++
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        // Gap found, streak ends
        break
      }
    }

    return streak
  } catch (error) {
    console.error('Error calculating streak:', error)
    return 0
  }
}

// Function to get streak history (last 30 days)
export const getStreakHistory = async () => {
  try {
    const workouts = await getWorkouts()
    if (!Array.isArray(workouts)) return []
    
    const history = []

    // Get last 30 days
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const dateStr = date.toISOString().split("T")[0]
      const hasWorkout = workouts.some((workout) => workout.date === dateStr)

      history.push({
        date: dateStr,
        hasWorkout: hasWorkout,
      })
    }

    return history
  } catch (error) {
    console.error('Error getting streak history:', error)
    return []
  }
}

// Function to get longest streak ever
export const getLongestStreak = async () => {
  try {
    const workouts = await getWorkouts()
    
    if (!Array.isArray(workouts) || workouts.length === 0) return 0

    // Get unique workout dates and sort them (oldest first)
    const workoutDates = [...new Set(workouts.map((w) => w.date))].sort((a, b) => new Date(a) - new Date(b))

    let longestStreak = 0
    let currentStreak = 0
    let previousDate = null

    for (const dateStr of workoutDates) {
      const currentDate = new Date(dateStr)

      if (previousDate === null) {
        // First workout
        currentStreak = 1
      } else {
        const daysDiff = Math.floor((currentDate - previousDate) / (1000 * 60 * 60 * 24))

        if (daysDiff === 1) {
          // Consecutive day
          currentStreak++
        } else {
          // Gap found, reset streak
          longestStreak = Math.max(longestStreak, currentStreak)
          currentStreak = 1
        }
      }

      previousDate = currentDate
    }

    // Don't forget to check the final streak
    longestStreak = Math.max(longestStreak, currentStreak)

    return longestStreak
  } catch (error) {
    console.error('Error calculating longest streak:', error)
    return 0
  }
}
