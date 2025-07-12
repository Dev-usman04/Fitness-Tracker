"use client"

import { toast } from "react-toastify"
import { Card, CardContent, Typography, IconButton, Box, Grid, Divider } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { motion } from "framer-motion"

function WorkoutItem({ workout, onEdit, onWorkoutChange, token }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }
  const getWorkoutEmoji = (type) => {
    const emojiMap = {
      Running: "🏃‍♂️",
      Gym: "🏋️‍♂️",
      Cycling: "🚴‍♂️",
      Yoga: "🧘‍♀️",
      Other: "💪",
    }
    return emojiMap[type] || "💪"
  }
  const handleEdit = () => {
    onEdit(workout)
    toast.info("Workout loaded for editing")
  }
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${workout.type} workout from ${formatDate(workout.date)}?`
    )
    if (confirmDelete) {
      try {
        const res = await fetch(`/api/workouts/${workout._id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        })
        let data = null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }
        if (!res.ok) throw new Error((data && data.message) || "Failed to delete workout");
        onWorkoutChange();
        toast.success(`${workout.type} workout deleted successfully! 🗑️`)
      } catch (error) {
        toast.error(error.message)
      }
    }
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: "100%" }}
    >
      <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <span style={{ fontSize: 28 }}>{getWorkoutEmoji(workout.type)}</span>
              <Box>
                <Typography fontWeight={600} fontSize={18}>{workout.type}</Typography>
                <Typography color="text.secondary" fontSize={14}>{formatDate(workout.date)}</Typography>
              </Box>
            </Box>
            <Box>
              <IconButton onClick={handleEdit} color="primary" size="small">
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDelete} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
          <Grid container spacing={2} mb={workout.notes ? 1 : 0}>
            <Grid xs={6}>
              <Typography color="text.secondary" fontSize={13}>Duration:</Typography>
              <Typography fontWeight={500}>{workout.duration} minutes</Typography>
            </Grid>
            {workout.calories && (
              <Grid xs={6}>
                <Typography color="text.secondary" fontSize={13}>Calories:</Typography>
                <Typography fontWeight={500}>{workout.calories} cal</Typography>
              </Grid>
            )}
          </Grid>
          {workout.notes && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography color="text.secondary" fontSize={13}>Notes:</Typography>
              <Typography mt={0.5}>{workout.notes}</Typography>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default WorkoutItem
