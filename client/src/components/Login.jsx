"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { Box, Button, TextField, Typography, Paper, CircularProgress, Link } from "@mui/material"
import { motion } from "framer-motion"

function Login({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (isRegistering) {
      // Registration logic
      if (!formData.username.trim() || !formData.email.trim() || !formData.password.trim()) {
        toast.error("Please fill in all fields")
        setIsLoading(false)
        return
      }
      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters")
        setIsLoading(false)
        return
      }
      
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        let data = null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }
        if (!res.ok) throw new Error((data && data.message) || "Registration failed")
        toast.success("Registration successful! Please sign in.")
        setIsRegistering(false)
        setFormData({ username: "", email: "", password: "" })
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    } else {
      // Login logic
      if (!formData.email.trim() || !formData.password.trim()) {
        toast.error("Please enter both email and password")
        setIsLoading(false)
        return
      }
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        })
        let data = null;
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await res.json();
        }
        if (!res.ok) throw new Error((data && data.message) || "Login failed")
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        toast.success(`Welcome, ${data.user.username}! 🎉`)
        onLogin(data.user)
      } catch (error) {
        toast.error(error.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f9fafb">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: "100%", maxWidth: 400 }}
      >
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={2}>
            <Typography variant="h3" fontWeight={700} color="primary" gutterBottom>
              💪
            </Typography>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              Fitness Tracker
            </Typography>
            <Typography color="text.secondary">
              {isRegistering ? "Create your account" : "Sign in to track your workouts"}
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                fullWidth
                margin="normal"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            )}
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              disabled={isLoading}
              autoComplete="email"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              required
              disabled={isLoading}
              autoComplete={isRegistering ? "new-password" : "current-password"}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2, py: 1.5, fontWeight: 600 }}
              disabled={isLoading}
              startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
            >
              {isLoading ? (isRegistering ? "Creating account..." : "Signing in...") : (isRegistering ? "Register" : "Sign In")}
            </Button>
          </form>
          <Box textAlign="center" mt={2}>
            <Link
              component="button"
              variant="body2"
              onClick={() => {
                setIsRegistering(!isRegistering)
                setFormData({ username: "", email: "", password: "" })
              }}
              sx={{ cursor: 'pointer' }}
            >
              {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Register"}
            </Link>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  )
}

export default Login
