import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// User Signup
export const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);
    return response.data; 
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

// User Login
export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
