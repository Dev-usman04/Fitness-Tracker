"use client"

import { useState, useEffect } from "react"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Login from "./components/Login"
import "./App.css" // Import your custom styles
import WorkoutForm from "./components/WorkoutForm"
import WorkoutList from "./components/WorkoutList"
import Stats from "./components/Stats"
import Goals from "./components/Goals"
import Badges from "./components/Badges"
import Reminders from "./components/Reminders"
import { getCurrentUser, logout } from "./utils/auth"
import { initializeReminderSystem } from "./utils/reminders"
import { FaDumbbell } from "react-icons/fa";
import { FiLogOut, FiUser } from "react-icons/fi"
import { motion } from "framer-motion"

function App() {
  // State to track which tab is currently active
  const [activeTab, setActiveTab] = useState("log")

  // State to track if we're editing a workout (stores the workout being edited)
  const [editingWorkout, setEditingWorkout] = useState(null)

  // State to track if user is logged in and store user info
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [workoutChangeTrigger, setWorkoutChangeTrigger] = useState(0)

  // Check if user is already logged in when app loads
  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
    setIsLoading(false)

    // Initialize reminder system when user is logged in
    if (currentUser) {
      initializeReminderSystem().catch(error => {
        console.error('Error initializing reminder system:', error)
      })
    }
  }, [])

  // Function to handle successful login
  const handleLogin = (userData) => {
    setUser(userData)
    // Initialize reminder system after login
    initializeReminderSystem().catch(error => {
      console.error('Error initializing reminder system:', error)
    })
  }

  // Function to handle logout
  const handleLogout = () => {
    logout()
    setUser(null)
    setActiveTab("log") // Reset to default tab
    setEditingWorkout(null) // Clear any editing state
  }

  // Function to switch between tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    // Clear editing state when switching tabs
    setEditingWorkout(null)
  }

  // Function to handle when user wants to edit a workout
  const handleEditWorkout = (workout) => {
    setEditingWorkout(workout)
    setActiveTab("log") // Switch to log tab to show the form
  }

  // Function to clear editing state (called after save or cancel)
  const handleClearEdit = () => {
    setEditingWorkout(null)
  }

  // Helper to get token from localStorage
  const getToken = () => localStorage.getItem("token")

  // Function to handle when a workout is saved/updated/deleted
  const handleWorkoutChange = () => {
    setWorkoutChangeTrigger((prev) => prev + 1)
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if user is not authenticated
  if (!user) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </>
    )
  }

  // Main app interface (shown when user is logged in)
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <FaDumbbell className="text-2xl" />
                  <h1 className="text-xl font-bold">Fitness Tracker</h1>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm">{user.username}</span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <FiUser className="text-sm" />
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <FiLogOut className="text-lg" />
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
              <div className="flex w-full">
                {[
                  { id: "log", label: "📝 Log Workout" },
                  { id: "reminders", label: "⏰ Reminders" },
                  { id: "goals", label: "🎯 Goals" },
                  { id: "badges", label: "🏅 Badges" },
                  { id: "stats", label: "📊 Stats" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex-1 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === "log" && (
                  <div>
                    <WorkoutForm
                      editingWorkout={editingWorkout}
                      onClearEdit={handleClearEdit}
                      username={user.username}
                      token={getToken()}
                      onWorkoutSaved={handleWorkoutChange}
                    />
                    <div className="mt-8">
                      <WorkoutList
                        onEditWorkout={handleEditWorkout}
                        token={getToken()}
                        onWorkoutChangeTrigger={workoutChangeTrigger}
                      />
                    </div>
                  </div>
                )}
                {activeTab === "reminders" && <Reminders username={user.username} />}
                {activeTab === "goals" && <Goals username={user.username} />}
                {activeTab === "badges" && <Badges username={user.username} />}
                {activeTab === "stats" && <Stats refreshTrigger={workoutChangeTrigger} />}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                DevDre
              </h3>
              <p className="text-blue-100 text-sm mt-1">Fitness Tracker Developer</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl mb-1">💪</div>
                <p className="text-xs text-blue-100">Stay Strong</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🎯</div>
                <p className="text-xs text-blue-100">Set Goals</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-1">🏆</div>
                <p className="text-xs text-blue-100">Achieve More</p>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-500 mt-4 pt-4 text-center">
            <p className="text-blue-100 text-sm">
              © 2024 DevDre Fitness Tracker. Built with ❤️ and React.
            </p>
          </div>
        </div>
      </footer>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default App
