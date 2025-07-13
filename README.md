# 🏃‍♂️ Fitness Tracker - Full-Stack Web Application

A comprehensive fitness tracking application built with React frontend and Node.js/Express backend, featuring workout logging, goal setting, achievement badges, email reminders, and detailed analytics.

## 🌟 Features

### 📝 Workout Logging
- **Comprehensive Workout Tracking**: Log various workout types including Running, Gym, Cycling, Yoga, Swimming, Walking, and custom workouts
- **Detailed Metrics**: Track duration, distance, calories burned, and personal notes
- **Edit & Delete**: Modify or remove previous workout entries
- **Real-time Updates**: Instant synchronization with backend database

### ⏰ Smart Reminders
- **Email Notifications**: Automated email reminders using EmailJS service
- **Browser Notifications**: Native browser notifications for immediate alerts
- **Dual Reminder System**: 5-minute and 2-minute advance notifications
- **Smart Scheduling**: Minimum 10-minute advance scheduling with validation
- **Auto-cleanup**: Automatic removal of past reminders

### 🎯 Goal Management
- **Personalized Goals**: Set custom fitness goals with target metrics
- **Progress Tracking**: Visual progress indicators and completion status
- **Goal Categories**: Different types of goals (workout frequency, distance, duration, etc.)
- **Achievement Celebration**: Toast notifications for goal completions

### 🏅 Achievement Badges
- **Gamification System**: Earn badges for various fitness milestones
- **Multiple Badge Types**: Streak badges, milestone badges, and special achievements
- **Visual Progress**: Beautiful badge display with unlock animations
- **Motivational System**: Encourages consistent fitness habits

### 📊 Analytics & Statistics
- **Comprehensive Dashboard**: Visual charts and statistics using Chart.js
- **Workout Trends**: Track progress over time with interactive charts
- **Performance Metrics**: Detailed breakdown of workout types and achievements
- **Real-time Updates**: Statistics refresh automatically with new data

### 🔐 User Authentication
- **Secure Login/Register**: JWT-based authentication system
- **Password Security**: Bcrypt password hashing
- **Session Management**: Persistent login sessions with token storage
- **User Profiles**: Individual user data isolation

## 🏗️ Architecture

### Frontend (React + Vite)
- **Modern React**: Built with React 19 and functional components with hooks
- **Material-UI**: Beautiful, responsive UI components
- **Framer Motion**: Smooth animations and transitions
- **Chart.js**: Interactive data visualization
- **Axios**: HTTP client for API communication
- **React Toastify**: User-friendly notifications
- **Tailwind CSS**: Utility-first CSS framework

### Backend (Node.js + Express)
- **RESTful API**: Clean, RESTful endpoints for all operations
- **MongoDB**: NoSQL database with Mongoose ODM
- **JWT Authentication**: Secure token-based authentication
- **CORS Support**: Cross-origin resource sharing enabled
- **Environment Configuration**: Secure environment variable management

### Database Models
- **User**: Authentication and profile data
- **Workout**: Exercise session records
- **Goal**: Personal fitness objectives
- **Badge**: Achievement system data
- **Reminder**: Scheduled notification data

## 🚀 How It Works

### 1. User Authentication Flow
```
User Registration/Login → JWT Token Generation → Token Storage → Protected Routes
```

### 2. Workout Logging Process
```
User Input → Form Validation → API Call → Database Storage → UI Update → Statistics Refresh
```

### 3. Reminder System
```
Reminder Creation → EmailJS Integration → Timeout Scheduling → Notification Delivery → Auto-cleanup
```

### 4. Goal Achievement System
```
Goal Creation → Progress Tracking → Milestone Detection → Badge Award → Celebration Notification
```

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Material-UI v7** - Component library
- **Framer Motion** - Animation library
- **Chart.js** - Data visualization
- **Axios** - HTTP client
- **React Toastify** - Notification system
- **Tailwind CSS** - Utility CSS framework

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - Object Data Modeling
- **JWT** - Authentication tokens
- **Bcryptjs** - Password hashing
- **CORS** - Cross-origin support

### External Services
- **EmailJS** - Email notification service
- **MongoDB Atlas** - Cloud database hosting

## 📁 Project Structure

```
fitness-tracker/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── utils/          # Utility functions
│   │   ├── assets/         # Static assets
│   │   └── App.jsx         # Main app component
│   ├── package.json
│   └── vite.config.js
├── backend/                # Node.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # Express routes
│   ├── server.js           # Main server file
│   └── package.json
└── README.md
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- EmailJS account (for email notifications)

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
# Create .env file with:
# VITE_API_URL=http://localhost:5000/api
npm run dev
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Workouts
- `GET /api/workouts` - Get user workouts
- `POST /api/workouts` - Create new workout
- `PUT /api/workouts/:id` - Update workout
- `DELETE /api/workouts/:id` - Delete workout

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Badges
- `GET /api/badges` - Get user badges
- `POST /api/badges` - Award new badge

### Reminders
- `GET /api/reminders` - Get user reminders
- `POST /api/reminders` - Create new reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## 🎨 UI/UX Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme**: Material-UI theming system
- **Smooth Animations**: Framer Motion transitions
- **Intuitive Navigation**: Tab-based interface
- **Real-time Feedback**: Toast notifications for all actions
- **Loading States**: Skeleton loaders and spinners
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **JWT Authentication**: Secure token-based sessions
- **Password Hashing**: Bcrypt encryption
- **CORS Protection**: Cross-origin request security
- **Input Validation**: Server-side data validation
- **Environment Variables**: Secure configuration management

## 📈 Performance Optimizations

- **Vite Build Tool**: Fast development and optimized production builds
- **Lazy Loading**: Component-based code splitting
- **Efficient State Management**: React hooks for optimal re-renders
- **Database Indexing**: Optimized MongoDB queries
- **Caching**: Browser-level caching for static assets

## 🚀 Deployment

### Backend (Vercel)
- Configured with `vercel.json`
- Environment variables set in Vercel dashboard
- Automatic deployments from Git

### Frontend (Vercel/Netlify)
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables for API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Developer

**DevDre** - Full-Stack Developer

---

*Built with ❤️ for fitness enthusiasts everywhere* 