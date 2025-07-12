import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = '/api/workouts';

export const getWorkouts = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error loading workouts from API:', error);
    return [];
  }
};

export const saveWorkout = async (workout) => {
  try {
    const token = getAuthToken();
    let response;
    if (workout._id) {
      // Update existing workout
      response = await axios.put(`${API_URL}/${workout._id}`, workout, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } else {
      // Create new workout - remove id field if it exists
      const { id, ...workoutData } = workout;
      response = await axios.post(API_URL, workoutData, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return response.data;
  } catch (error) {
    console.error('Error saving workout to API:', error);
    throw new Error('Failed to save workout');
  }
};

export const deleteWorkout = async (workoutId) => {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${workoutId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting workout from API:', error);
    throw new Error('Failed to delete workout');
  }
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const clearAllWorkouts = async () => {
  // Optionally implement a bulk delete endpoint in backend if needed
  throw new Error('Not implemented');
};
