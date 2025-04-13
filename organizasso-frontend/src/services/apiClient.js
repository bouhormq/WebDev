import axios from 'axios';

// Vite uses import.meta.env for environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Note: Environment variables in Vite need to be prefixed with VITE_

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Interceptor to add auth token to requests
apiClient.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token'); // Example: Get token
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default apiClient;
