"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { Box, Button, TextField, MenuItem, Typography, Paper } from "@mui/material"
import { motion } from "framer-motion"

function WorkoutForm({ editingWorkout, onClearEdit, username, token, onWorkoutSaved }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Running",
    duration: "",
    calories: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const workoutTypes = ["Running", "Gym", "Cycling", "Yoga", "Other"]

  useEffect(() => {
    if (editingWorkout) {
      setFormData({
        date: editingWorkout.date,
        type: editingWorkout.type,
        duration: editingWorkout.duration.toString(),
        calories: editingWorkout.calories ? editingWorkout.calories.toString() : "",
        notes: editingWorkout.notes || "",
      })
    }
  }, [editingWorkout])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.date || !formData.type || !formData.duration) {
      toast.error("Please fill in date, workout type, and duration.")
      return
    }
    const duration = Number.parseInt(formData.duration)
    if (isNaN(duration) || duration <= 0) {
      toast.error("Please enter a valid duration in minutes.")
      return
    }
    let calories = null
    if (formData.calories) {
      calories = Number.parseInt(formData.calories)
      if (isNaN(calories) || calories < 0) {
        toast.error("Please enter a valid number for calories.")
        return
      }
    }
    setIsSubmitting(true)
    try {
      const method = editingWorkout ? "PUT" : "POST"
      const url = editingWorkout
        ? `/api/workouts/${editingWorkout._id}`
        : "/api/workouts"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: formData.date,
          type: formData.type,
          duration,
          calories,
          notes: formData.notes.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to save workout")
      toast.success(
        editingWorkout
          ? `Great job ${username}! Your ${formData.type.toLowerCase()} workout has been updated! 💪`
          : `Awesome ${username}! Your ${formData.type.toLowerCase()} workout has been saved! 🎉`
      )
      setFormData({
        date: new Date().toISOString().split("T")[0],
        type: "Running",
        duration: "",
        calories: "",
        notes: "",
      })
      onClearEdit()
      if (onWorkoutSaved) onWorkoutSaved()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "Running",
      duration: "",
      calories: "",
      notes: "",
    })
    onClearEdit()
    toast.info("Edit cancelled")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2} color="primary">
          {editingWorkout ? "✏️ Edit Workout" : "➕ Add New Workout"}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Date"
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            select
            label="Workout Type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
          >
            {workoutTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Duration (minutes)"
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            inputProps={{ min: 1 }}
            required
          />
          <TextField
            label="Calories Burned (optional)"
            type="number"
            name="calories"
            value={formData.calories}
            onChange={handleInputChange}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Notes (optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
          <Box display="flex" gap={2} mt={1}>
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
              {editingWorkout ? "Update" : "Save"}
            </Button>
            {editingWorkout && (
              <Button variant="outlined" color="secondary" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </motion.div>
  )
}

export default WorkoutForm
