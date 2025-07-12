"use client"

import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import { getCurrentUser } from "../utils/auth"

function EmailSetup({ onSave, onCancel }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [emailjsLoaded, setEmailjsLoaded] = useState(false)

  useEffect(() => {
    // Check if EmailJS is loaded
    if (typeof window.emailjs !== 'undefined') {
      setEmailjsLoaded(true)
    } else {
      // Load EmailJS if not already loaded
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      script.onload = () => {
        window.emailjs.init('Pn6qAwr5qYbeuIaRB') // Your EmailJS public key
        setEmailjsLoaded(true)
      }
      document.head.appendChild(script)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("❌ Please enter a valid email address")
      setIsLoading(false)
      return
    }

    try {
      // Save email locally
      const user = getCurrentUser()
      if (user) {
        const updatedUser = { ...user, email: email }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Test EmailJS connection
        if (emailjsLoaded && typeof window.emailjs !== 'undefined') {
          try {
            await window.emailjs.send(
              'service_6jresjx', // Your EmailJS service ID
              'template_eakqyj3', // Your EmailJS template ID
              {
                to_email: email,
                to_name: user.username || 'Fitness Tracker User',
                message: 'Email setup successful! You will now receive workout reminders.',
              },
              'Pn6qAwr5qYbeuIaRB' // Your EmailJS public key
            )
            toast.success("✅ Email address saved and EmailJS configured successfully!")
          } catch (emailError) {
            console.warn('EmailJS test failed, but email saved locally:', emailError)
            toast.success("✅ Email address saved successfully! (EmailJS test failed)")
          }
        } else {
          toast.success("✅ Email address saved successfully!")
        }
        
        // Call the onSave callback to update the parent component
        onSave(email)
      } else {
        throw new Error("User not found")
      }
    } catch (error) {
      console.error('Error saving email:', error)
      toast.error("❌ Failed to save email. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📧 Setup Email for Reminders</h3>
        <p className="text-gray-600 text-sm mb-4">
          Enter your email address to receive workout reminders. We'll send you notifications 5 and 2 minutes before
          your scheduled workouts.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="your.email@example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors font-medium disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "💾 Save Email"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              ❌ Cancel
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>Note:</strong> This is a demo app. Email functionality requires EmailJS configuration. In a real
            app, you would receive actual email reminders.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmailSetup
