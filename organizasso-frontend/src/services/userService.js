// organizasso-frontend/src/services/userService.js
import apiClient from './apiClient';

export const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
     console.error(`API Error fetching profile for user ${userId}:`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || "Failed to fetch user profile");
  }
};

export const getUserMessages = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/messages`);
    return response.data;
  } catch (error) {
     console.error(`API Error fetching messages for user ${userId}:`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || "Failed to fetch user messages");
  }
};

export const deleteUserMessage = async (messageId) => {
  try {
    const response = await apiClient.delete(`/users/messages/${messageId}`);
    return response.data;
  } catch (error) {
     console.error(`API Error deleting message ${messageId}:`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || "Failed to delete message");
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    let config = {};
    if (profileData instanceof FormData) {
      config.headers = {
        'Content-Type': undefined, 
      };
    }

    const response = await apiClient.put(`/users/${userId}/profile`, profileData, config);
    return response.data;
  } catch (error) {
    console.error(`API Error updating profile for user ${userId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update user profile");
  }
};
