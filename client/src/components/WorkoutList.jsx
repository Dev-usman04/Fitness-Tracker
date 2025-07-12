"use client"

import { useState, useEffect } from "react"
import { Typography, Box, CircularProgress, Alert } from "@mui/material"
import WorkoutItem from "./WorkoutItem"
import { motion, AnimatePresence } from "framer-motion"

function WorkoutList({ onEditWorkout, token, onWorkoutChangeTrigger }) {
  const [workouts, setWorkouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWorkouts = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/workouts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to fetch workouts")
      setWorkouts(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWorkouts()
    // eslint-disable-next-line
  }, [onWorkoutChangeTrigger])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        📋 Your Workouts
      </Typography>
      {workouts.length === 0 ? (
        <Box textAlign="center" py={6} color="text.secondary">
          <Typography variant="body1" mb={1}>No workouts logged yet!</Typography>
          <Typography variant="body2">Add your first workout above to get started.</Typography>
        </Box>
      ) : (
        <AnimatePresence>
          {workouts.map((workout) => (
            <WorkoutItem
              key={workout._id}
              workout={workout}
              onEdit={onEditWorkout}
              onWorkoutChange={fetchWorkouts}
              token={token}
            />
          ))}
        </AnimatePresence>
      )}
    </Box>
  )
}

export default WorkoutList
