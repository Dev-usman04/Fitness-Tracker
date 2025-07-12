"use client"

import { toast } from "react-toastify"
import { Card, CardContent, Typography, Button, Box, Divider, Grid } from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { motion } from "framer-motion"
import { deleteReminder } from "../utils/reminderStorage"
import { cancelReminder } from "../utils/reminders"

function ReminderItem({ reminder, onReminderChange }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }
  const getTimeUntilWorkout = () => {
    const workoutDateTime = new Date(`${reminder.date}T${reminder.time}`)
    const now = new Date()
    const diffMs = workoutDateTime - now
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    if (diffMs < 0) return "Past due"
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24)
      return `${days} day${days > 1 ? "s" : ""}`
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`
    }
    return `${diffMinutes}m`
  }
  const getWorkoutEmoji = (type) => {
    const emojiMap = {
      Running: "🏃‍♂️",
      Gym: "🏋️‍♂️",
      Cycling: "🚴‍♂️",
      Yoga: "🧘‍♀️",
      Swimming: "🏊‍♂️",
      Walking: "🚶‍♂️",
      Other: "💪",
    }
    return emojiMap[type] || "💪"
  }
  const handleDelete = async () => {
    toast.dismiss()
    const confirmDelete = async () => {
      try {
        cancelReminder(reminder._id || reminder.id)
        await deleteReminder(reminder._id || reminder.id)
        onReminderChange()
        toast.success(`🗑️ Reminder "${reminder.title}" deleted successfully!`)
      } catch (error) {
        toast.error("❌ Failed to delete reminder. Please try again.")
      }
    }
    const cancelDelete = () => {
      toast.info("❌ Delete cancelled")
    }
    toast(
      ({ closeToast }) => (
        <Box>
          <Typography variant="body2" fontWeight={500} mb={1}>
            Delete reminder "{reminder.title}"?
          </Typography>
          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button
              onClick={async () => {
                await confirmDelete()
                closeToast()
              }}
              color="error"
              variant="contained"
              size="small"
              startIcon={<DeleteIcon />}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                cancelDelete()
                closeToast()
              }}
              color="inherit"
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
          </Box>
        </Box>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      },
    )
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      style={{ width: "100%" }}
    >
      <Card elevation={2} sx={{ mb: 2, borderRadius: 2 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
            <Box display="flex" alignItems="center" gap={2}>
              <span style={{ fontSize: 28 }}>{getWorkoutEmoji(reminder.workoutType)}</span>
              <Box>
                <Typography fontWeight={600} fontSize={18}>{reminder.workoutType} Workout</Typography>
                <Typography color="text.secondary" fontSize={14}>
                  {formatDate(reminder.date)} at {formatTime(reminder.time)}
                </Typography>
              </Box>
            </Box>
            <Box textAlign="right">
              <Typography color="primary" fontWeight={500} fontSize={14}>{getTimeUntilWorkout()}</Typography>
              <Typography color="text.secondary" fontSize={12}>remaining</Typography>
              <Button
                onClick={handleDelete}
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                sx={{ mt: 1 }}
              >
                Delete
              </Button>
            </Box>
          </Box>
          <Grid container spacing={2} mb={reminder.notes ? 1 : 0}>
            <Grid xs={12} sm={6}>
              <Typography color="text.secondary" fontSize={13}>📧 Email:</Typography>
              <Typography fontWeight={500}>{reminder.email}</Typography>
            </Grid>
            <Grid xs={12} sm={6}>
              <Typography color="text.secondary" fontSize={13}>⏰ Reminders:</Typography>
              <Typography fontWeight={500}>5 minutes & 2 minutes before workout</Typography>
            </Grid>
          </Grid>
          {reminder.notes && (
            <>
              <Divider sx={{ my: 1 }} />
              <Typography color="text.secondary" fontSize={13}>📝 Notes:</Typography>
              <Typography mt={0.5}>{reminder.notes}</Typography>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ReminderItem
