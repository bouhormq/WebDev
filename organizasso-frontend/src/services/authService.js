import apiClient from './apiClient';

export const login = async (username, password) => {
  console.log('authService.login: Calling backend API');
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    return response.data; 
  } catch (error) {
    console.error('API Login Error:', error.response?.data?.message || error.message);
    if (error.response && error.response.status === 403 && error.response.data?.message) {
        throw new Error(error.response.data.message); 
    }
    throw new Error(error.response?.data?.message || 'Login failed. Please check credentials or server.');
  }
};

export const register = async (username, email, password) => {
  console.log('authService.register: Calling backend API');
  try {
    const response = await apiClient.post('/auth/register', { username, email, password });
    return response.data; 
  } catch (error) { 
    console.error('API Register Error:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Registration failed. Please try again.');
  }
};

export const getMe = async () => {
    console.log('authService.getMe: Calling backend API');
    try {
        const response = await apiClient.get('/auth/me');
        return response.data;
    } catch (error) {
         console.error('API GetMe Error:', error.response?.data?.message || error.message);
         throw error; 
    }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    console.log('authService.logout: Successfully called backend /auth/logout');
  } catch (error) {
    console.error('authService.logout: Error calling backend /auth/logout:', error.response?.data?.message || error.message);
  }
};
