// organizasso-frontend/src/services/userService.js
import apiClient from './apiClient';

// Get User Profile
export const getUserProfile = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/profile`);
    return response.data;
  } catch (error) {
     console.error(`API Error fetching profile for user ${userId}:`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || "Failed to fetch user profile");
  }
};

// Get User Messages
export const getUserMessages = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}/messages`);
    return response.data;
  } catch (error) {
     console.error(`API Error fetching messages for user ${userId}:`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || "Failed to fetch user messages");
  }
};

// Delete a Message (requires ownership check on backend)
export const deleteUserMessage = async (messageId) => {
  try {
    // The route could be /users/messages/:id or just /messages/:id 
    // Adjust endpoint if necessary based on final route definition
    const response = await apiClient.delete(`/users/messages/${messageId}`); 
    return response.data; // Usually { message: "..." }
  } catch (error) {
     console.error(`API Error deleting message ${messageId}:`, error.response?.data || error.message);
     throw new Error(error.response?.data?.message || "Failed to delete message");
  }
};

// Update User Profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    // profileData should be FormData if a file is included
    let config = {};
    if (profileData instanceof FormData) {
      // Let Axios set the Content-Type for FormData by not providing one,
      // or explicitly setting it to undefined.
      config.headers = {
        'Content-Type': undefined, // Crucial: This allows Axios to set multipart/form-data with boundary
      };
    }
    // else, it will use the default 'application/json' from apiClient for other types of data

    const response = await apiClient.put(`/users/${userId}/profile`, profileData, config);
    return response.data;
  } catch (error) {
    console.error(`API Error updating profile for user ${userId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to update user profile");
  }
};
