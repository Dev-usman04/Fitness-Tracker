"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import ReminderItem from "./ReminderItem"
import { getReminders, saveReminder, generateId } from "../utils/reminderStorage"
import { scheduleReminder } from "../utils/reminders"
import { getCurrentUser } from "../utils/auth"
import { Box, Button, TextField, MenuItem, Typography, Paper, Grid, Fade, Alert, Divider } from "@mui/material"
import AddAlarmIcon from "@mui/icons-material/AddAlarm"
import { AnimatePresence, motion } from "framer-motion"

function Reminders({ username }) {
  const [reminders, setReminders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    workoutType: "Running",
    date: "",
    time: "",
    notes: "",
  })
  const workoutTypes = ["Running", "Gym", "Cycling", "Yoga", "Swimming", "Walking", "Other"]

  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    try {
      const savedReminders = await getReminders()
      if (Array.isArray(savedReminders)) {
        const activeReminders = savedReminders
          .filter((reminder) => {
            const reminderDateTime = new Date(`${reminder.date}T${reminder.time}`)
            return reminderDateTime > new Date()
          })
          .sort((a, b) => {
            const dateTimeA = new Date(`${a.date}T${a.time}`)
            const dateTimeB = new Date(`${b.date}T${b.time}`)
            return dateTimeA - dateTimeB
          })
        setReminders(activeReminders)
      } else {
        setReminders([])
      }
    } catch (error) {
      console.error('Error loading reminders:', error)
      setReminders([])
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "workoutType" || name === "date" || name === "time") {
      const workoutType = name === "workoutType" ? value : formData.workoutType
      const date = name === "date" ? value : formData.date
      const time = name === "time" ? value : formData.time
      if (workoutType && date && time) {
        const formattedDate = new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        const formattedTime = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
        const title = `${workoutType} workout on ${formattedDate} at ${formattedTime}`
        setFormData((prev) => ({ ...prev, title }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.workoutType || !formData.date || !formData.time) {
      toast.error("❌ Please fill in all required fields")
      return
    }
    // Always use the current user's email
    const user = getCurrentUser()
    const userEmailToUse = user && user.email ? user.email : null
    if (!userEmailToUse) {
      toast.error("❌ No email found for current user. Please contact support.")
      return
    }
    const reminderDateTime = new Date(`${formData.date}T${formData.time}`)
    const now = new Date()
    if (reminderDateTime <= now) {
      toast.error("❌ Please select a future date and time")
      return
    }
    const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000)
    if (reminderDateTime < tenMinutesFromNow) {
      toast.error("❌ Please schedule your workout at least 10 minutes in advance")
      return
    }
    const reminder = {
      title: formData.title,
      workoutType: formData.workoutType,
      date: formData.date,
      time: formData.time,
      email: userEmailToUse,
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
      isActive: true,
    }
    try {
      await saveReminder(reminder)
      await scheduleReminder(reminder)
      setFormData({
        title: "",
        workoutType: "Running",
        date: "",
        time: "",
        notes: "",
      })
      setShowForm(false)
      loadReminders()
      toast.success(`⏰ Great ${username}! Reminder set for "${reminder.title}"`)
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "❌ Failed to save reminder. Please try again."
      toast.error(msg)
    }
  }

  const handleReminderChange = async () => {
    await loadReminders()
  }

  const getMinDate = () => new Date().toISOString().split("T")[0]
  const getMinTime = () => {
    if (formData.date === getMinDate()) {
      const now = new Date()
      const tenMinutesFromNow = new Date(now.getTime() + 10 * 60 * 1000)
      return tenMinutesFromNow.toTimeString().slice(0, 5)
    }
    return ""
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700} color="primary">
          ⏰ Workout Reminders
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddAlarmIcon />}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Close" : "Add Reminder"}
        </Button>
      </Box>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
          >
            <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Add New Reminder
              </Typography>
              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
                <TextField
                  select
                  label="Workout Type"
                  name="workoutType"
                  value={formData.workoutType}
                  onChange={handleInputChange}
                  required
                >
                  {workoutTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="Date"
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinDate() }}
                      required
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="Time"
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: getMinTime() }}
                      required
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Notes (optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
                <Box display="flex" gap={2} mt={1}>
                  <Button type="submit" variant="contained" color="primary">
                    Save Reminder
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
      <Divider sx={{ my: 3 }} />
      <Box>
        {reminders.length === 0 ? (
          <Alert severity="info">No upcoming reminders. Add one to stay on track!</Alert>
        ) : (
          <AnimatePresence>
            {reminders.map((reminder) => (
              <ReminderItem key={reminder._id} reminder={reminder} onReminderChange={handleReminderChange} />
            ))}
          </AnimatePresence>
        )}
      </Box>
    </Box>
  )
}

export default Reminders
