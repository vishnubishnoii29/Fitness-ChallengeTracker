import axios from 'axios';

// VITE_API_URL already includes /api (e.g. https://...onrender.com/api)
// Just strip any trailing slashes and add exactly one
const RAW_URL = import.meta.env.VITE_API_URL || 'https://fitness-challengetracker-2.onrender.com/api';
const API_URL = RAW_URL.replace(/\/+$/, '') + '/';

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
