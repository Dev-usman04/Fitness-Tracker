import axios from 'axios';
import { getAuthToken } from './auth';

const API_URL = '/api/reminders';

export const getReminders = async () => {
  try {
    const token = getAuthToken();
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error loading reminders from API:', error);
    return [];
  }
};

export const saveReminder = async (reminder) => {
  try {
    const token = getAuthToken();
    // Remove the id field if it exists, as the backend will generate it
    const { id, ...reminderData } = reminder;
    const response = await axios.post(API_URL, reminderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error saving reminder to API:', error);
    throw new Error('Failed to save reminder');
  }
};

export const deleteReminder = async (reminderId) => {
  try {
    const token = getAuthToken();
    await axios.delete(`${API_URL}/${reminderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Error deleting reminder from API:', error);
    throw new Error('Failed to delete reminder');
  }
};

export const updateReminder = async (reminderId, updates) => {
  try {
    const token = getAuthToken();
    const response = await axios.put(`${API_URL}/${reminderId}`, updates, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating reminder in API:', error);
    throw new Error('Failed to update reminder');
  }
};

export const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const clearAllReminders = async () => {
  // Optionally implement a bulk delete endpoint in backend if needed
  throw new Error('Not implemented');
};
