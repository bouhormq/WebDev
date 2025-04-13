// eslint-disable-next-line no-unused-vars
import apiClient from './apiClient';

// Login user by calling the backend API
export const login = async (username, password) => {
  console.log('authService.login: Calling backend API');
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    // The backend sends back { token, user: { id, username, ... } }
    return response.data; 
  } catch (error) {
    console.error('API Login Error:', error.response?.data?.message || error.message);
    if (error.response && error.response.status === 403 && error.response.data?.message) {
        throw new Error(error.response.data.message); 
    }
    throw new Error(error.response?.data?.message || 'Login failed. Please check credentials or server.');
  }
};

// Register user by calling the backend API
export const register = async (username, email, password) => {
  console.log('authService.register: Calling backend API');
  try {
    const response = await apiClient.post('/auth/register', { username, email, password });
    // Backend sends { message: "..." }
    return response.data; 
  } catch (error) { 
    console.error('API Register Error:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
  }
};

// Get current user data using token
export const getMe = async () => {
    console.log('authService.getMe: Calling backend API');
    try {
        // Assumes token is already set in apiClient headers by AuthContext
        const response = await apiClient.get('/auth/me');
        return response.data; // Returns user object
    } catch (error) {
         console.error('API GetMe Error:', error.response?.data?.message || error.message);
         // Don't throw generic error, let AuthContext handle logout based on specific error (e.g., 401)
         throw error; 
    }
};

// Logout (currently just a placeholder, could call backend if needed)
export const logout = async () => {
  console.warn('authService.logout called - no backend call implemented yet.');
  // In real implementation (if backend needs to invalidate token):
  // await apiClient.post('/auth/logout');
  return Promise.resolve();
};
