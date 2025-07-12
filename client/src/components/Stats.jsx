"use client"

import { useState, useEffect } from "react"
import { getWorkouts } from "../utils/storage"

function Stats({ refreshTrigger = 0 }) {
  // State to store chart data and workouts
  const [chartData, setChartData] = useState({
    labels: [],
    durations: [],
    calories: [],
  })
  const [workouts, setWorkouts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [internalRefreshTrigger, setInternalRefreshTrigger] = useState(0)

  // Load and process workout data when component mounts or when refresh is triggered
  useEffect(() => {
    loadWorkoutData()
  }, [refreshTrigger, internalRefreshTrigger])

  // Function to manually refresh data
  const refreshData = () => {
    setInternalRefreshTrigger(prev => prev + 1)
  }

  // Function to load workout data
  const loadWorkoutData = async () => {
    try {
      setIsLoading(true)
      const workoutData = await getWorkouts()
      if (Array.isArray(workoutData)) {
        setWorkouts(workoutData)
        processWorkoutData(workoutData)
      } else {
        setWorkouts([])
        setChartData({ labels: [], durations: [], calories: [] })
      }
    } catch (error) {
      console.error('Error loading workout data:', error)
      setWorkouts([])
      setChartData({ labels: [], durations: [], calories: [] })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to process workout data for charts
  const processWorkoutData = (workoutData) => {
    if (!Array.isArray(workoutData)) return

    // Get the last 6 weeks of data
    const weeks = getLast6Weeks()
    const weeklyData = weeks.map((week) => {
      // Filter workouts for this week
      const weekWorkouts = workoutData.filter((workout) => {
        const workoutDate = new Date(workout.date)
        return workoutDate >= week.start && workoutDate <= week.end
      })

      // Calculate totals for this week
      const totalDuration = weekWorkouts.reduce((sum, workout) => sum + workout.duration, 0)
      const totalCalories = weekWorkouts.reduce((sum, workout) => sum + (workout.calories || 0), 0)

      return {
        label: week.label,
        duration: totalDuration,
        calories: totalCalories,
      }
    })

    // Update chart data state
    setChartData({
      labels: weeklyData.map((week) => week.label),
      durations: weeklyData.map((week) => week.duration),
      calories: weeklyData.map((week) => week.calories),
    })
  }

  // Function to get the last 6 weeks
  const getLast6Weeks = () => {
    const weeks = []
    const today = new Date()

    for (let i = 5; i >= 0; i--) {
      // Calculate start of week (Monday)
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay() + 1 - i * 7)
      weekStart.setHours(0, 0, 0, 0)

      // Calculate end of week (Sunday)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      // Create label for the week
      const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`

      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: label,
      })
    }

    return weeks
  }

  // Calculate total stats
  const totalWorkouts = Array.isArray(workouts) ? workouts.length : 0
  const totalDuration = Array.isArray(workouts) ? workouts.reduce((sum, workout) => sum + workout.duration, 0) : 0
  const totalCalories = Array.isArray(workouts) ? workouts.reduce((sum, workout) => sum + (workout.calories || 0), 0) : 0
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0

  // Find max values for chart scaling
  const maxDuration = Math.max(...chartData.durations, 1)
  const maxCalories = Math.max(...chartData.calories, 1)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Your Fitness Stats</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800">📊 Your Fitness Stats</h2>
        <button
          onClick={refreshData}
          disabled={isLoading}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          <span>🔄</span>
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{totalWorkouts}</div>
          <div className="text-sm text-gray-600">Total Workouts</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{totalDuration}</div>
          <div className="text-sm text-gray-600">Total Minutes</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{totalCalories}</div>
          <div className="text-sm text-gray-600">Total Calories</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{averageDuration}</div>
          <div className="text-sm text-gray-600">Avg Minutes</div>
        </div>
      </div>

      {/* Charts */}
      {totalWorkouts > 0 ? (
        <div className="space-y-8">
          {/* Duration Chart */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Workout Duration (Last 6 Weeks)</h3>
            <div className="space-y-3">
              {chartData.labels.map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${(chartData.durations[index] / maxDuration) * 100}%`,
                        minWidth: chartData.durations[index] > 0 ? "20px" : "0",
                      }}
                    >
                      {chartData.durations[index] > 0 && (
                        <span className="text-white text-xs font-medium">{chartData.durations[index]}m</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calories Chart */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Calories Burned (Last 6 Weeks)</h3>
            <div className="space-y-3">
              {chartData.labels.map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{label}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                    <div
                      className="bg-orange-500 h-6 rounded-full flex items-center justify-end pr-2"
                      style={{
                        width: `${(chartData.calories[index] / maxCalories) * 100}%`,
                        minWidth: chartData.calories[index] > 0 ? "20px" : "0",
                      }}
                    >
                      {chartData.calories[index] > 0 && (
                        <span className="text-white text-xs font-medium">{chartData.calories[index]}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Show message when no workout data exists
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-2">No workout data to display</p>
          <p>Start logging workouts to see your progress charts!</p>
        </div>
      )}
    </div>
  )
}

export default Stats
