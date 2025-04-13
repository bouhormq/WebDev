// organizasso-frontend/src/services/forumService.js
// eslint-disable-next-line no-unused-vars
import apiClient from './apiClient';

// Fetch Open Forum Threads
export const getOpenForumThreads = async () => {
  try {
    const response = await apiClient.get('/forums/open');
    return response.data;
  } catch (error) {
    console.error("API Error fetching open threads:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch open threads");
  }
};

// Fetch Closed Forum Threads (Admin)
export const getClosedForumThreads = async () => {
  try {
    const response = await apiClient.get('/forums/closed');
    return response.data;
  } catch (error) {
    console.error("API Error fetching closed threads:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch closed threads");
  }
};

// Fetch Messages for a Thread
export const getThreadMessages = async (threadId) => {
  try {
    const response = await apiClient.get(`/forums/threads/${threadId}/messages`);
    return response.data;
  } catch (error) {
    console.error(`API Error fetching messages for thread ${threadId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch messages");
  }
};

// Post a Reply to a Thread
export const postReply = async (threadId, content) => {
  try {
    const response = await apiClient.post(`/forums/threads/${threadId}/messages`, { content });
    return response.data; // Returns the newly created message object
  } catch (error) {
    console.error(`API Error posting reply to thread ${threadId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to post reply");
  }
};

// Create a New Thread
export const createThread = async (forumType, title, content) => {
  try {
    // Use the single /api/threads endpoint
    const response = await apiClient.post('/threads', { forumType, title, content });
    return response.data; // Returns the newly created thread object
  } catch (error) {
    console.error(`API Error creating thread in ${forumType} forum:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create thread");
  }
};
