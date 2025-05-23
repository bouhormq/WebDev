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

// Fetch details for a single thread
export const getThreadDetails = async (threadId) => {
  try {
    const response = await apiClient.get(`/threads/${threadId}`); // Ensure this matches your backend route
    return response.data;
  } catch (error) {
    console.error(`API Error fetching details for thread ${threadId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch thread details");
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
export const postReply = async (threadId, content, parentId = null, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (parentId) {
      formData.append('parentId', parentId);
    }
    if (imageFile) {
      formData.append('replyImage', imageFile); // Field name must match backend (uploadContentImage.single('replyImage'))
    }
    const response = await apiClient.post(`/threads/${threadId}/replies`, formData, {
      headers: {
        // Axios will set Content-Type to multipart/form-data automatically for FormData
        // if we don't explicitly set it, or set it to undefined.
        'Content-Type': undefined,
      }
    });
    return response.data; // Returns the newly created message object
  } catch (error) {
    console.error(`API Error posting reply to thread ${threadId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to post reply");
  }
};

// Create a New Thread
export const createThread = async (forumType, title, content, imageFile = null) => {
  try {
    const formData = new FormData();
    formData.append('forumType', forumType);
    formData.append('title', title);
    formData.append('content', content);
    if (imageFile) {
      formData.append('threadImage', imageFile); // Field name must match backend (uploadContentImage.single('threadImage'))
    }

    // If no image, we could send as application/json, but FormData works for all cases.
    const response = await apiClient.post('/threads', formData, {
      headers: {
        'Content-Type': undefined, // Let Axios handle Content-Type for FormData
      }
    });
    return response.data; // Returns the newly created thread object
  } catch (error) {
    console.error(`API Error creating thread in ${forumType} forum:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to create thread");
  }
};

// Like or Dislike a message
export const likeDislikeMessage = async (messageId, actionType) => {
  try {
    const response = await apiClient.post(`/forums/messages/${messageId}/reaction`, { actionType });
    return response.data; // Returns the updated message object
  } catch (error) {
    console.error(`API Error ${actionType}ing message ${messageId}:`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || `Failed to ${actionType} message`);
  }
};

// Delete a Thread
export const deleteThread = async (threadId) => {
  try {
    const response = await apiClient.delete(`/threads/${threadId}`);
    return response.data;
  } catch (error) {
    console.error(`API Error deleting thread ${threadId}:`, error.response?.data || error.message);
    // Rethrow a more specific error or the original error message
    throw new Error(error.response?.data?.message || `Failed to delete thread ${threadId}`);
  }
};
