import axios from 'axios';

// Accept either a root backend URL (https://...onrender.com)
// or one that already includes /api (https://...onrender.com/api).
const RAW_URL = import.meta.env.VITE_API_URL || '/api';
const NORMALIZED_URL = RAW_URL.replace(/\/+$/, '');
const API_URL = NORMALIZED_URL.endsWith('/api')
  ? `${NORMALIZED_URL}/`
  : `${NORMALIZED_URL}/api/`;

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

// Handle unauthorized responses (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      // If we are not on login/register/landing, redirect to login
      if (!['/login', '/register', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default api;
