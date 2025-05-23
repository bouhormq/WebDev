import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to add auth token to requests
apiClient.interceptors.request.use((config) => {
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
