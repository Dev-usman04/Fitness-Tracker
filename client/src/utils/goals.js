// Helper functions for managing fitness goals

import axios from 'axios';
import { getAuthToken } from './auth';
import { getWorkouts } from './storage';
import { getCurrentStreak } from './streaks';

const API_URL = '/api/goals';

export const getGoals = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error loading goals from API:', error);
    return [];
  }
};

export const saveGoal = async (goal) => {
  try {
    const token = getAuthToken();
    // Remove the id field if it exists, as the backend will generate it
    const { id, ...goalData } = goal;
    const response = await axios.post(API_URL, goalData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving goal to API:', error);
    throw new Error('Failed to save goal');
  }
};

export const deleteGoal = async (goalId) => {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${goalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting goal from API:', error);
    throw new Error('Failed to delete goal');
  }
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const calculateGoalProgress = async (goal) => {
  try {
    const workouts = await getWorkouts();
    if (!Array.isArray(workouts)) {
      return { current: 0, percentage: 0 };
    }

    let current = 0;

    switch (goal.type) {
      case "weekly_workouts":
        current = calculateWeeklyWorkouts(workouts);
        break;
      case "weekly_minutes":
        current = calculateWeeklyMinutes(workouts);
        break;
      case "weekly_calories":
        current = calculateWeeklyCalories(workouts);
        break;
      case "monthly_workouts":
        current = calculateMonthlyWorkouts(workouts);
        break;
      case "workout_streak":
        current = await getCurrentStreak();
        break;
      default:
        current = 0;
    }

    const percentage = goal.target > 0 ? Math.min((current / goal.target) * 100, 100) : 0;

    return {
      current: current,
      percentage: percentage,
    };
  } catch (error) {
    console.error('Error calculating goal progress:', error);
    return { current: 0, percentage: 0 };
  }
};

// Helper functions to calculate different goal types
const calculateWeeklyWorkouts = (workouts) => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= weekStart;
  }).length;
};

const calculateWeeklyMinutes = (workouts) => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return workouts
    .filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekStart;
    })
    .reduce((sum, workout) => sum + workout.duration, 0);
};

const calculateWeeklyCalories = (workouts) => {
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);

  return workouts
    .filter(workout => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= weekStart;
    })
    .reduce((sum, workout) => sum + (workout.calories || 0), 0);
};

const calculateMonthlyWorkouts = (workouts) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  return workouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= monthStart;
  }).length;
};

// Helper function to calculate current workout streak
const calculateCurrentStreak = (workouts) => {
  // This function will need to be refactored to fetch workouts from the API
  // For now, it will use a placeholder or throw an error if getWorkouts is not available
  // This part of the code was not included in the edit_specification, so it remains as is.
  // If getWorkouts is meant to be fetched from the API, this function will need to be updated.
  // Assuming getWorkouts is available from the API or a different source.
  // For now, returning a placeholder or throwing an error.
  console.warn("calculateCurrentStreak is not fully implemented for API integration. Workouts data is not available directly from API.");
  return 0;
}
