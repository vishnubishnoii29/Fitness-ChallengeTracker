import axios from 'axios';

// VITE_API_URL already includes /api (e.g. https://...onrender.com/api)
// Just strip any trailing slashes and add exactly one
const RAW_URL = import.meta.env.VITE_API_URL || '/api';
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
