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

    // --- Build Aggregation Pipeline --- 
    const pipeline = [];
    const matchStage = {}; // Initial match stage for non-text criteria

    // 1. Text Search (if query provided)
    if (query && query.trim() !== '') {
        // Ensure you have a text index created on the 'content' field
        // In mongosh: db.messages.createIndex({ content: "text" })
        // $text must be the first stage if used
        pipeline.push({ $match: { $text: { $search: query.trim() } } });
        // Add score projection for sorting later
        pipeline.push({ $addFields: { score: { $meta: "textScore" } } });
    }

    // 2. Author Search (by username)
    let authorId = null;
    if (author && author.trim() !== '') {
        const usersCollection = getCollection('users');
        // Find user ID case-insensitively
        const authorUser = await usersCollection.findOne(
             { username: { $regex: `^${author.trim()}$`, $options: 'i' } }, // Case-insensitive exact match
             { projection: { _id: 1 } }
        );
        if (authorUser) {
            authorId = authorUser._id;
            matchStage.authorId = authorId; // Add authorId filter
        } else {
            // If author specified but not found, return empty results immediately
            return res.json([]);
        }
    }

    // 3. Date Range Search
    if (startDate || endDate) {
        matchStage.createdAt = {};
        if (startDate) {
            try {
                const start = new Date(startDate);
                 if (isNaN(start.getTime())) throw new Error('Invalid start date');
                matchStage.createdAt.$gte = start;
            } catch (e) {
                 return res.status(400).json({ message: 'Invalid start date format.' });
            }
        }
        if (endDate) {
             try {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) throw new Error('Invalid end date');
                // Add 1 day to endDate to make it inclusive
                end.setDate(end.getDate() + 1);
                matchStage.createdAt.$lt = end;
            } catch (e) {
                return res.status(400).json({ message: 'Invalid end date format.' });
            }
        }
    }

    // Add the $match stage if it contains criteria
    if (Object.keys(matchStage).length > 0) {
        // If $text was used, this $match stage comes after
        // Otherwise, it's the first stage
        if (pipeline.length > 0 && pipeline[0].$match.$text) {
             pipeline.push({ $match: matchStage });
        } else {
             pipeline.unshift({ $match: matchStage }); // Add at the beginning
        }
    }

    // 4. Lookup Author Information ($lookup)
    pipeline.push({
        $lookup: {
            from: "users",             // Join with users collection
            localField: "authorId",    // Field from messages
            foreignField: "_id",       // Field from users
            as: "authorInfo"         // Output array field name
        }
    });

    // 5. Unwind the authorInfo array (since $lookup returns an array)
    pipeline.push({ 
         $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } // Keep message even if author deleted
     });

    // 6. Project Final Fields (include authorName)
    pipeline.push({
        $project: {
            _id: 1,
            threadId: 1,
            content: 1,
            createdAt: 1,
            authorId: 1,
            authorName: "$authorInfo.username", // Extract username
            score: { $ifNull: ["$score", null] } // Include score if text search was done
        }
    });

    // 7. Sort Results
    // Check if text search was performed (presence of $text stage or score field)
    const isTextSearch = pipeline.some(stage => stage.$match && stage.$match.$text);
    if (isTextSearch) {
         pipeline.push({ $sort: { score: -1, createdAt: -1 } }); // Sort by relevance score first
     } else {
         pipeline.push({ $sort: { createdAt: -1 } }); // Default sort by date
     }

    // 8. Limit Results
    pipeline.push({ $limit: 100 }); 

    // --- Execute Search --- 
    try {
        const messagesCollection = getCollection('messages');
        const results = await messagesCollection.aggregate(pipeline).toArray();

        res.json(results);

    } catch (error) {
        // Handle specific errors like invalid text index
        if (error.codeName === 'IndexNotFound' && query && query.trim() !== '') {
             console.error("Text index missing on messages collection ('content' field)");
             return res.status(500).json({ message: 'Search requires a text index. Please ask administrator to create it.' });
        }
        console.error("Error searching messages:", error);
        next(error);
    }
};
