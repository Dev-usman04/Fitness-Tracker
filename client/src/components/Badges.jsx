"use client"

import { useState, useEffect } from "react"
import BadgeItem from "./BadgeItem"
import { getAllBadges, checkAndAwardBadges, getUserBadges } from "../utils/badges"
import { getCurrentStreak } from "../utils/streaks"

function Badges({ username }) {
  // State for badges
  const [allBadges, setAllBadges] = useState([])
  const [userBadges, setUserBadges] = useState([])
  const [currentStreak, setCurrentStreak] = useState(0)

  // Load badges when component mounts
  useEffect(() => {
    loadBadges()
    loadStreak()
    // Check for new badges when component loads
    checkForNewBadges()
  }, [])

  // Function to load all badges and user's earned badges
  const loadBadges = async () => {
    try {
      const badges = await getAllBadges()
      const earned = await getUserBadges()
      if (Array.isArray(badges)) {
        setAllBadges(badges)
      } else {
        setAllBadges([])
      }
      if (Array.isArray(earned)) {
        setUserBadges(earned)
      } else {
        setUserBadges([])
      }
    } catch (error) {
      console.error('Error loading badges:', error)
      setAllBadges([])
      setUserBadges([])
    }
  }

  // Function to load current streak
  const loadStreak = async () => {
    try {
      const streak = await getCurrentStreak()
      setCurrentStreak(streak || 0)
    } catch (error) {
      console.error('Error loading streak:', error)
      setCurrentStreak(0)
    }
  }

  // Function to check for newly earned badges
  const checkForNewBadges = async () => {
    try {
      const newBadges = await checkAndAwardBadges()
      if (Array.isArray(newBadges) && newBadges.length > 0) {
        // Reload badges to show newly earned ones
        await loadBadges()
      }
    } catch (error) {
      console.error('Error checking for new badges:', error)
    }
  }

  // Separate earned and unearned badges
  const earnedBadges = allBadges.filter((badge) => userBadges.some((ub) => ub.badgeId === badge.id))
  const unearnedBadges = allBadges.filter((badge) => !userBadges.some((ub) => ub.badgeId === badge.id))

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">🏅 Your Badges & Achievements</h2>
        <p className="text-gray-600">
          You've earned {earnedBadges.length} out of {allBadges.length} badges!
        </p>
      </div>

      {/* Current Streak Display */}
      <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-lg p-6 text-center">
        <div className="text-4xl mb-2">🔥</div>
        <div className="text-2xl font-bold">{currentStreak} Day Streak</div>
        <div className="text-sm opacity-90">
          {currentStreak === 0
            ? "Start your workout streak today!"
            : currentStreak === 1
              ? "Great start! Keep it going!"
              : `Amazing ${username}! You're on fire!`}
        </div>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🎉 Earned Badges ({earnedBadges.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earnedBadges.map((badge) => {
              const userBadge = userBadges.find((ub) => ub.badgeId === badge.id)
              return <BadgeItem key={badge.id} badge={badge} earnedDate={userBadge?.earnedAt} isEarned={true} />
            })}
          </div>
        </div>
      )}

      {/* Unearned Badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 Badges to Earn ({unearnedBadges.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unearnedBadges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} isEarned={false} />
            ))}
          </div>
        </div>
      )}

      {/* No badges message */}
      {allBadges.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🏅</div>
          <p className="text-lg mb-2">No badges available yet!</p>
          <p>Start working out to unlock achievements.</p>
        </div>
      )}
    </div>
  )
}

export default Badges
