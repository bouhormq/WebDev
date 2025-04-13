import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Helper to get user data (reuse from forumController or keep separate)
const getUserInfo = async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) return { _id: userId, username: 'Unknown' };
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { username: 1 } });
    return user || { _id: userId, username: 'Unknown' };
};

// Helper function to ensure text index exists on messages
const ensureMessageTextIndex = async (messagesCollection) => {
    try {
        await messagesCollection.createIndex({ content: "text" }, { name: "content_text_index" });
        console.log("Messages text index ensured (content).");
    } catch (error) {
        if (error.code === 85 || error.code === 86) { // IndexOptionsConflict or IndexKeySpecsConflict
            console.log("Messages text index already exists or conflicts.");
        } else {
            console.error("Error creating messages text index:", error);
        }
    }
};

// Controller function to search messages
export const searchMessages = async (req, res, next) => {
    const { query, author, startDate, endDate } = req.query;

    // --- Build MongoDB Query Filter --- 
    const filter = {};

    // 1. Text Search (using $text index)
    if (query && query.trim() !== '') {
        // Ensure you have a text index created on the 'content' field in your messages collection
        // In mongosh: db.messages.createIndex({ content: "text" })
        filter.$text = { $search: query.trim() };
    }

    // 2. Author Search (by username, requires lookup or storing username on message)
    //    Let's assume for now we search by authorId if provided directly,
    //    Searching by username efficiently requires changing message schema or aggregation.
    //    For simplicity now, we won't implement username search directly here.
    //    TODO: Implement author search via username if needed (requires aggregation)
    // if (author && author.trim() !== '') {
    //     // This requires a lookup or denormalization
    // }

    // 3. Date Range Search
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
            try {
                filter.createdAt.$gte = new Date(startDate);
                 // Validate Date
                 if (isNaN(filter.createdAt.$gte.getTime())) {
                    return res.status(400).json({ message: 'Invalid start date format.' });
                 }
            } catch (e) {
                 return res.status(400).json({ message: 'Invalid start date format.' });
            }
        }
        if (endDate) {
             try {
                // Add 1 day to endDate to make it inclusive of the entire end day
                const endOfDay = new Date(endDate);
                endOfDay.setDate(endOfDay.getDate() + 1);
                filter.createdAt.$lt = endOfDay;
                // Validate Date
                if (isNaN(filter.createdAt.$lt.getTime())) {
                   return res.status(400).json({ message: 'Invalid end date format.' });
                }
            } catch (e) {
                return res.status(400).json({ message: 'Invalid end date format.' });
            }
        }
    }

    // --- Execute Search --- 
    try {
        const messagesCollection = getCollection('messages');

        // Add projection to potentially fetch author username efficiently later
        const options = {
            // If using text search, MongoDB automatically adds a relevance score
            // You can sort by this score if needed: sort: { score: { $meta: "textScore" } }
            // For now, sort by creation date descending
            sort: { createdAt: -1 }, 
            limit: 100 // Limit results to prevent overload
            // Consider adding projection if needed: projection: { ... }
        };

        // If text search is active, add score projection for sorting
        if (filter.$text) {
            options.projection = { score: { $meta: "textScore" } };
            options.sort = { score: { $meta: "textScore" }, createdAt: -1 }; // Sort by relevance first
        }

        const results = await messagesCollection.find(filter, options).toArray();

        // TODO: If searching by username was implemented, results would already include it.
        // If not, and you need the username, you might need to do a lookup here 
        // for each result's authorId (potentially inefficient for many results).
        // For simplicity, we will return results without author username for now.

        res.json(results);

    } catch (error) {
        // Handle specific errors like invalid text index
        if (error.codeName === 'IndexNotFound' && filter.$text) {
             console.error("Text index missing on messages collection ('content' field)");
             return res.status(500).json({ message: 'Search functionality requires a text index. Please ask administrator to create it.' });
        }
        console.error("Error searching messages:", error);
        next(error);
    }
};
