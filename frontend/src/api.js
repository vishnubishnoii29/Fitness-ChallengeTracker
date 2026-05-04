import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://fitness-challengetracker-2.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach token to requests if it exists
api.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const token = JSON.parse(user).token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
