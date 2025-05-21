import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Helper to get user data (reuse from forumController or keep separate)
const getUserInfo = async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) return { _id: userId, username: 'Unknown' }; // Should be displayName
    const usersCollection = getCollection('users');
    // Ensure you are projecting displayName if that's what's used, or username if intended
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { displayName: 1, username: 1 } });
    return user || { _id: userId, displayName: 'Unknown', username: 'Unknown' };
};

// Controller function to search messages
export const searchMessages = async (req, res, next) => {
    const { query, author, startDate, endDate } = req.query;
    const currentUserIsAdmin = req.user?.isAdmin || false; // Get current user's admin status

    // --- Build Aggregation Pipeline --- 
    const pipeline = [];
    const filterConditions = []; // Array to hold all filter conditions for $and

    // 1. Keyword Search (if query provided, using $regex for partial matching on content)
    if (query && query.trim() !== '') {
        const searchWords = query.trim().split(/\\s+/).filter(word => word.length > 0);
        if (searchWords.length > 0) {
            const regexConditions = searchWords.map(word => {
                const escapedWord = word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'); // Escape special regex characters
                return { content: { $regex: escapedWord, $options: 'i' } }; // Case-insensitive regex for each word
            });
            filterConditions.push(...regexConditions);
        }
    }

    // 2. Author Search (by displayName)
    if (author && author.trim() !== '') {
        const usersCollection = getCollection('users');
        // Search for author by displayName using a case-insensitive regex
        // Ensure the regex matches the exact displayName if that's the intent,
        // or use a partial match if desired. For exact match: `^${author.trim()}$`
        const authorUser = await usersCollection.findOne(
             { displayName: { $regex: `^${author.trim().replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}$`, $options: 'i' } }, 
             { projection: { _id: 1 } }
        );
        if (authorUser) {
            filterConditions.push({ authorId: authorUser._id }); // Add authorId filter
        } else {
            // If author specified but not found, return empty results immediately
            return res.json([]);
        }
    }

    // 3. Date Range Search
    if (startDate || endDate) {
        const dateMatch = { createdAt: {} };
        if (startDate) {
            try {
                const start = new Date(startDate);
                if (isNaN(start.getTime())) throw new Error('Invalid start date');
                dateMatch.createdAt.$gte = start;
            } catch (e) {
                 return res.status(400).json({ message: 'Invalid start date format.' });
            }
        }
        if (endDate) {
             try {
                const end = new Date(endDate);
                if (isNaN(end.getTime())) throw new Error('Invalid end date');
                end.setDate(end.getDate() + 1); // Make endDate inclusive by going to the start of the next day
                dateMatch.createdAt.$lt = end;
            } catch (e) {
                return res.status(400).json({ message: 'Invalid end date format.' });
            }
        }
        if (Object.keys(dateMatch.createdAt).length > 0) {
            filterConditions.push(dateMatch);
        }
    }

    // Add the $match stage if there are any conditions from query, author, or date
    if (filterConditions.length > 0) {
        pipeline.push({ $match: { $and: filterConditions } });
    }

    // 4. Lookup Thread Information for each message
    pipeline.push({
        $lookup: {
            from: "threads",             // Join with threads collection
            localField: "threadId",    // Field from messages
            foreignField: "_id",       // Field from threads
            as: "threadInfo"         // Output array field name
        }
    });

    // 5. Unwind the threadInfo array. 
    // Messages without a valid corresponding thread will be effectively dropped here,
    // which is typically desired as messages should belong to a thread to be contextually valid.
    pipeline.push({ $unwind: "$threadInfo" });

    // 6. Conditional Match: Filter messages based on forumType if user is NOT an admin
    // Admins can see messages from all forum types, including 'closed'.
    if (!currentUserIsAdmin) {
        pipeline.push({
            $match: { "forumInfo.type": { $ne: "closed" } }
        });
    }

    // 7. Lookup Author Information (for the message author)
    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'authorId',
            foreignField: '_id',
            as: 'authorDetails'
        }
    });
    pipeline.push({
        $unwind: {
            path: '$authorDetails',
            preserveNullAndEmptyArrays: true // Keep message if author not found
        }
    });

    // If using MongoDB Atlas Search and have a highlight score, you might addFields here
    // Example: pipeline.push({ $addFields: { highlightScore: { $meta: "searchScore" } } });

    // Final Projection
    pipeline.push({
        $project: {
            _id: 1,
            threadId: 1,
            authorId: 1,
            content: 1, // This will be the highlighted content if keyword search was performed
            imageUrl: 1, // Ensure content image URL is projected
            createdAt: 1,
            likes: 1,
            dislikes: 1,
            likeCount: 1,
            dislikeCount: 1,
            // Get authorName from authorDetails, fallback to username, then "Unknown User"
            authorName: { $ifNull: ['$authorDetails.displayName', '$authorDetails.username', 'Unknown User'] },
            profilePicUrl: { $ifNull: ['$authorDetails.profilePicUrl', ''] }, // Get profilePicUrl
            forumId: 1, 
            forumName: '$forumInfo.name',
            forumType: '$forumInfo.type',
            // Include highlight score if using MongoDB Atlas Search with $meta
            // highlightScore: { $meta: "searchScore" } // Example if using Atlas Search
        }
    });

    // 10. Sort Results (e.g., by creation date descending)
    pipeline.push({ $sort: { createdAt: -1 } }); 

    // 11. Limit Results (e.g., to 100 messages)
    pipeline.push({ $limit: 100 }); 

    // --- Execute Search --- 
    try {
        const messagesCollection = getCollection('messages');
        const results = await messagesCollection.aggregate(pipeline).toArray();
        res.json(results);
    } catch (error) {
        console.error("Error searching messages:", error);
        next(error); // Pass error to the global error handler
    }
};
