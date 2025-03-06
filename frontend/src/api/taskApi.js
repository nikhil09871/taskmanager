import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

// Fetch all tasks
export const getTasks = async (token) => {
  try {
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Fetch tasks error:', error);
    throw error;
  }
};

// Create a task
export const createTask = async (taskData, token) => {
  try {
    const response = await axios.post(API_URL, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Create task error:', error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId, token) => {
  try {
    await axios.delete(`${API_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch (error) {
    console.error('Delete task error:', error);
    throw error;
  }
};
