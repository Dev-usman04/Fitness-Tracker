"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { deleteGoal, calculateGoalProgress } from "../utils/goals"
import { FiTrash2 } from "react-icons/fi"
import { motion } from "framer-motion"

function GoalItem({ goal, onGoalChange, username }) {
  const [progress, setProgress] = useState({ current: 0, percentage: 0 })
  const [isLoadingProgress, setIsLoadingProgress] = useState(true)

  useEffect(() => {
    const loadProgress = async () => {
      try {
        setIsLoadingProgress(true)
        const progressData = await calculateGoalProgress(goal)
        setProgress(progressData)
      } catch (error) {
        console.error('Error calculating goal progress:', error)
        setProgress({ current: 0, percentage: 0 })
      } finally {
        setIsLoadingProgress(false)
      }
    }
    
    loadProgress()
  }, [goal])
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.title}"?`)) {
      try {
        await deleteGoal(goal._id || goal.id);
        onGoalChange();
        toast.success(`Goal "${goal.title}" deleted successfully! 🗑️`)
      } catch (error) {
        toast.error("Failed to delete goal. Please try again.")
      }
    }
  }
  const getGoalEmoji = (type) => {
    const emojiMap = {
      weekly_workouts: "📅",
      weekly_minutes: "⏱️",
      weekly_calories: "🔥",
      monthly_workouts: "📆",
      workout_streak: "🔥",
    }
    return emojiMap[type] || "🎯"
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getGoalEmoji(goal.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
              <p className="text-sm text-gray-500">
                Created {new Date(goal.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete goal"
          >
            <FiTrash2 className="text-lg" />
          </button>
        </div>
        
        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Progress:</span>
            {isLoadingProgress ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : (
              <span className={`font-semibold ${
                progress.percentage >= 100 ? "text-green-600" : "text-blue-600"
              }`}>
                {progress.current} / {goal.target} ({Math.round(progress.percentage)}%)
              </span>
            )}
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            {isLoadingProgress ? (
              <div className="h-3 bg-gray-300 rounded-full animate-pulse"></div>
            ) : (
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  progress.percentage >= 100
                    ? "bg-green-500"
                    : progress.percentage >= 75
                    ? "bg-blue-500"
                    : progress.percentage >= 50
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(progress.percentage, 100)}%` }}
              ></div>
            )}
          </div>
          
          <div className="text-center">
            {isLoadingProgress ? (
              <p className="text-sm text-gray-500">Calculating progress...</p>
            ) : progress.percentage >= 100 ? (
              <p className="text-green-600 font-semibold">
                🎉 Goal Achieved! Great job {username}!
              </p>
            ) : (
              <p className="text-sm text-gray-600">
                {goal.target - progress.current} more to reach your goal
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default GoalItem
