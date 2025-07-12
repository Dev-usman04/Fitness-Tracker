"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import GoalItem from "./GoalItem"
import { getGoals, saveGoal, generateId } from "../utils/goals"
import { FaTrophy } from "react-icons/fa";
import { FiPlus, FiX } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"

function Goals({ username }) {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    type: "weekly_workouts",
    target: "",
    timeframe: "week",
  })
  const goalTypes = [
    { value: "weekly_workouts", label: "Weekly Workouts", unit: "workouts" },
    { value: "weekly_minutes", label: "Weekly Minutes", unit: "minutes" },
    { value: "weekly_calories", label: "Weekly Calories", unit: "calories" },
    { value: "monthly_workouts", label: "Monthly Workouts", unit: "workouts" },
    { value: "workout_streak", label: "Workout Streak", unit: "days" },
  ]
  useEffect(() => {
    loadGoals()
  }, [])
  
  const loadGoals = async () => {
    try {
      const savedGoals = await getGoals()
      if (Array.isArray(savedGoals)) {
        setGoals(savedGoals)
      } else {
        setGoals([])
      }
    } catch (error) {
      console.error('Error loading goals:', error)
      setGoals([])
    }
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "type" || name === "target") {
      const goalType = name === "type" ? value : formData.type
      const target = name === "target" ? value : formData.target
      const selectedGoalType = goalTypes.find((gt) => gt.value === goalType)
      if (selectedGoalType && target) {
        const title = `${target} ${selectedGoalType.unit} ${goalType.includes("weekly") ? "per week" : goalType.includes("monthly") ? "per month" : "streak"}`
        setFormData((prev) => ({ ...prev, title }))
      }
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.target) {
      toast.error("Please fill in all required fields")
      return
    }
    const target = Number.parseInt(formData.target)
    if (isNaN(target) || target <= 0) {
      toast.error("Please enter a valid target number")
      return
    }
    const goal = {
      title: formData.title,
      type: formData.type,
      target: target,
      timeframe: formData.timeframe,
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    try {
      await saveGoal(goal)
      setFormData({
        title: "",
        type: "weekly_workouts",
        target: "",
        timeframe: "week",
      })
      setShowForm(false)
      await loadGoals()
      toast.success(`Great ${username}! Your goal "${goal.title}" has been set! 🎯`)
    } catch (error) {
      toast.error("Failed to save goal. Please try again.")
    }
  }
  const handleGoalChange = async () => {
    await loadGoals()
  }
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaTrophy className="text-yellow-500" />
          Your Fitness Goals
        </h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          {showForm ? <FiX /> : <FiPlus />}
          {showForm ? "Cancel" : "Add Goal"}
        </button>
      </div>
      
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Set a New Goal</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {goalTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Number
                  </label>
                  <input
                    type="number"
                    name="target"
                    value={formData.target}
                    onChange={handleInputChange}
                    min="1"
                    required
                    placeholder="e.g., 4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Goal title will be auto-generated"
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Set Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="border-t border-gray-200 pt-6">
        {goals.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700">
            No goals set yet. Add one to stay motivated!
          </div>
        ) : (
          <AnimatePresence>
            {goals.map((goal) => (
              <GoalItem key={goal._id} goal={goal} onGoalChange={handleGoalChange} username={username} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}

export default Goals
