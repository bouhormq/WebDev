import apiClient from './apiClient';

/**
 * Search for messages based on provided criteria.
 * @param {object} params - The search parameters.
 * @param {string} [params.query] - Keywords to search for in message content.
 * @param {string} [params.author] - Author username (Backend support currently TODO).
 * @param {string} [params.startDate] - ISO 8601 format date string (e.g., "YYYY-MM-DD").
 * @param {string} [params.endDate] - ISO 8601 format date string (e.g., "YYYY-MM-DD").
 * @returns {Promise<Array>} - A promise that resolves to an array of message objects.
 */
export const searchMessages = async (params) => {
    try {
        // Remove undefined or empty parameters before sending
        const validParams = Object.entries(params)
            // eslint-disable-next-line no-unused-vars -- key is part of the entry but not used
            .filter(([key, value]) => value !== undefined && value !== null && value !== '')
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {});

        console.log('searchService: Searching messages with params:', validParams);
        
        const response = await apiClient.get('/search', { 
            params: validParams 
        });
        
        // Backend currently returns messages without populated author username
        // TODO: Add author lookup on frontend if needed, or wait for backend aggregation
        return response.data;

    } catch (error) {
        console.error("API Error searching messages:", error.response?.data || error.message);
        // Check for the specific text index error from the backend
        if (error.response?.data?.message?.includes('text index')) {
             throw new Error('Search requires a text index. Please contact an administrator.');
        }
        throw new Error(error.response?.data?.message || "Failed to perform search");
    }
}; 