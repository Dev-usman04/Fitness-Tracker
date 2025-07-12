// Helper functions for managing workout reminder scheduling and email sending

import { toast } from "react-toastify"
import { getReminders, updateReminder } from "./reminderStorage"

// Store for active timeouts (to allow cancellation)
const activeTimeouts = new Map()

// EmailJS configuration
const EMAILJS_CONFIG = {
  serviceId: "service_6jresjx", 
  templateId: "template_eakqyj3",
  publicKey: "Pn6qAwr5qYbeuIaRB", 
}

// Function to initialize EmailJS
const initializeEmailJS = () => {
  if (typeof window.emailjs === 'undefined') {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
    script.onload = () => {
      window.emailjs.init(EMAILJS_CONFIG.publicKey)
      console.log('EmailJS initialized')
    }
    document.head.appendChild(script)
  } else {
    window.emailjs.init(EMAILJS_CONFIG.publicKey)
  }
}

// Function to initialize the reminder system
export const initializeReminderSystem = async () => {
  // Initialize EmailJS
  initializeEmailJS()
  
  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        console.log("Notification permission granted")
      }
    })
  }

  // Load and schedule existing reminders
  try {
    const reminders = await getReminders()
    if (Array.isArray(reminders)) {
      reminders.forEach((reminder) => {
        if (reminder.isActive) {
          scheduleReminder(reminder)
        }
      })
    }
  } catch (error) {
    console.error('Error loading reminders:', error)
  }

  console.log("Reminder system initialized")
}

// Function to schedule a reminder
export const scheduleReminder = (reminder) => {
  const workoutDateTime = new Date(`${reminder.date}T${reminder.time}`)
  const now = new Date()

  // Calculate times for 5-minute and 2-minute reminders
  const fiveMinutesBefore = new Date(workoutDateTime.getTime() - 5 * 60 * 1000)
  const twoMinutesBefore = new Date(workoutDateTime.getTime() - 2 * 60 * 1000)

  // Schedule 5-minute reminder
  if (fiveMinutesBefore > now) {
    const timeout5min = setTimeout(() => {
      sendReminder(reminder, 5)
    }, fiveMinutesBefore.getTime() - now.getTime())

    activeTimeouts.set(`${reminder._id || reminder.id}_5min`, timeout5min)
  }

  // Schedule 2-minute reminder
  if (twoMinutesBefore > now) {
    const timeout2min = setTimeout(() => {
      sendReminder(reminder, 2)
    }, twoMinutesBefore.getTime() - now.getTime())

    activeTimeouts.set(`${reminder._id || reminder.id}_2min`, timeout2min)
  }

  console.log(`Scheduled reminders for: ${reminder.title}`)
}

// Function to cancel a reminder
export const cancelReminder = (reminderId) => {
  // Cancel 5-minute reminder
  const timeout5min = activeTimeouts.get(`${reminderId}_5min`)
  if (timeout5min) {
    clearTimeout(timeout5min)
    activeTimeouts.delete(`${reminderId}_5min`)
  }

  // Cancel 2-minute reminder
  const timeout2min = activeTimeouts.get(`${reminderId}_2min`)
  if (timeout2min) {
    clearTimeout(timeout2min)
    activeTimeouts.delete(`${reminderId}_2min`)
  }

  console.log(`Cancelled reminders for: ${reminderId}`)
}

// Function to send a reminder
const sendReminder = async (reminder, minutesBefore) => {
  const workoutDateTime = new Date(`${reminder.date}T${reminder.time}`)
  const formattedTime = workoutDateTime.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  // Send browser notification
  sendBrowserNotification(reminder, minutesBefore, formattedTime)

  // Send email notification
  await sendEmailNotification(reminder, minutesBefore, formattedTime)

  // Show toast notification
  toast.info(`⏰ Reminder: Your ${reminder.workoutType} workout starts in ${minutesBefore} minutes!`, {
    autoClose: 10000,
  })

  console.log(`Sent ${minutesBefore}-minute reminder for: ${reminder.title}`)
}

// Function to send browser notification
const sendBrowserNotification = (reminder, minutesBefore, formattedTime) => {
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification(`Workout Reminder - ${minutesBefore} minutes!`, {
      body: `Your ${reminder.workoutType} workout starts at ${formattedTime}. Get ready!`,
      icon: "/favicon.ico", // You can add a custom icon
      tag: `workout-reminder-${reminder._id || reminder.id}-${minutesBefore}`,
    })

    // Auto-close notification after 10 seconds
    setTimeout(() => {
      notification.close()
    }, 10000)

    // Handle notification click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}

// Function to send email notification using EmailJS
const sendEmailNotification = async (reminder, minutesBefore, formattedTime) => {
  try {
    // Check if EmailJS is available
    if (typeof window.emailjs === "undefined") {
      console.log("EmailJS not available - email reminder skipped")
      return
    }

    // Ensure EmailJS is initialized
    if (!window.emailjs.init) {
      console.log("EmailJS not initialized - email reminder skipped")
      return
    }

    const templateParams = {
      to_email: reminder.email,
      to_name: "Fitness Tracker User",
      workout_type: reminder.workoutType,
      workout_time: formattedTime,
      workout_date: new Date(reminder.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      minutes_before: minutesBefore,
      notes: reminder.notes || "No additional notes",
    }

    await window.emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams,
      EMAILJS_CONFIG.publicKey,
    )

    console.log(`Email reminder sent to ${reminder.email}`)
  } catch (error) {
    console.error("Failed to send email reminder:", error)
    // Don't show error to user as this is a background process
  }
}

// Function to check for overdue reminders (cleanup)
export const cleanupOverdueReminders = async () => {
  try {
    const reminders = await getReminders()
    if (!Array.isArray(reminders)) return
    
    const now = new Date()

    reminders.forEach((reminder) => {
      const workoutDateTime = new Date(`${reminder.date}T${reminder.time}`)
      if (workoutDateTime < now && reminder.isActive) {
        // Mark reminder as inactive
        updateReminder(reminder._id || reminder.id, { isActive: false })
        // Cancel any pending timeouts
        cancelReminder(reminder._id || reminder.id)
      }
    })
  } catch (error) {
    console.error('Error cleaning up overdue reminders:', error)
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupOverdueReminders, 5 * 60 * 1000)
