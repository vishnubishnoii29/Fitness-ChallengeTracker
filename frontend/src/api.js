import axios from 'axios';

let API_URL = import.meta.env.VITE_API_URL || 'https://fitness-challengetracker-2.onrender.com/api';

// Ensure the URL ends with /api if it's not already there
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = API_URL.endsWith('/') ? `${API_URL}api` : `${API_URL}/api`;
}

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
