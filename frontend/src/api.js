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

// Handle responses and global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized responses (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      // If we are not on login/register/landing, redirect to login
      if (!['/login', '/register', '/'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }

    let exactError = error.message;
    let details = '';

    if (error.response) {
      exactError = error.response.data?.message || error.response.statusText || 'Server Error';
      details = typeof error.response.data === 'object' ? JSON.stringify(error.response.data, null, 2) : String(error.response.data);
    } else if (error.request) {
      exactError = 'Network Error: No response received from server';
    }

    const errorContext = error.config ? `[${error.config.method?.toUpperCase()}] ${error.config.url}` : 'Unknown request';

    // Dispatch global error event
    window.dispatchEvent(new CustomEvent('app-error', { 
      detail: { 
        message: exactError,
        details: details,
        context: errorContext
      } 
    }));

    return Promise.reject(error);
  }
);


export default api;
