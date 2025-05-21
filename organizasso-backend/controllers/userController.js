import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Controller to get user profile information
export const getUserProfile = async (req, res, next) => {
    const { userId } = req.params;
    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        const usersCollection = getCollection('users');
        const userProfile = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } } // Exclude password
        );

        if (!userProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure displayName and profilePicUrl are included
        const userResponse = {
            ...userProfile,
            displayName: userProfile.displayName || userProfile.username,
            profilePicUrl: userProfile.profilePicUrl || '',
        };
        
        res.json(userResponse);
    } catch (error) {
        console.error("Error fetching user profile:", error);
        next(error);
    }
};

// Controller to update user profile information (displayName and profilePicUrl)
export const updateUserProfile = async (req, res, next) => {
    const { userId } = req.params;
    const { displayName } = req.body;
    const loggedInUserId = req.user.id; // From protect middleware

    // Ensure the user is updating their own profile
    if (userId !== loggedInUserId) {
        return res.status(403).json({ message: 'User not authorized to update this profile' });
    }

    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        const usersCollection = getCollection('users');
        const updateData = {};

        if (displayName) {
            updateData.displayName = displayName;
        }

        // Handle file upload if a new profile picture is provided
        if (req.file) {
            // Construct the URL path for the uploaded file
            // This assumes you have a static file server setup for the 'uploads' directory
            // e.g., app.use('/uploads', express.static('uploads')); in server.js
            updateData.profilePicUrl = `/uploads/profile-pics/${req.file.filename}`;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No update data provided' });
        }

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch the updated user profile to return
        const updatedUserProfile = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );

        // Ensure displayName and profilePicUrl are included in the response
        const userResponse = {
            ...updatedUserProfile,
            displayName: updatedUserProfile.displayName || updatedUserProfile.username,
            profilePicUrl: updatedUserProfile.profilePicUrl || '',
        };

        res.json(userResponse);
    } catch (error) {
        console.error("Error updating user profile:", error);
        next(error);
    }
};

// Controller to get messages posted by a specific user
export const getUserMessages = async (req, res, next) => {
    const { userId } = req.params;
    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        const messagesCollection = getCollection('messages');
        
        const userMessages = await messagesCollection.aggregate([
            {
                $match: { authorId: new ObjectId(userId) }
            },
            {
                $lookup: { // Lookup author details
                    from: "users",
                    localField: "authorId",
                    foreignField: "_id",
                    as: "authorInfo"
                }
            },
            {
                $unwind: {
                    path: "$authorInfo",
                    preserveNullAndEmptyArrays: true // Keep messages even if author is somehow not found
                }
            },
            // Lookup the first message of the thread to determine if the current message is the initial post
            {
                $lookup: {
                    from: "messages", // Self-lookup on messages collection
                    let: { current_thread_id: "$threadId" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$threadId", "$$current_thread_id"] } } },
                        { $sort: { createdAt: 1 } }, // Sort by oldest first
                        { $limit: 1 }, // Get only the first message
                        { $project: { _id: 1 } } // Project only its ID
                    ],
                    as: "firstMessageOfThreadInfo" // Renamed to avoid conflict if a field is named firstMessageOfThread
                }
            },
            {
                $unwind: {
                    path: "$firstMessageOfThreadInfo",
                    preserveNullAndEmptyArrays: true // Keep message if its thread has no messages (shouldn't happen) or if lookup fails
                }
            },
            {
                $addFields: {
                    authorName: { $ifNull: ["$authorInfo.displayName", "$authorInfo.username", "Unknown"] },
                    profilePicUrl: { $ifNull: ["$authorInfo.profilePicUrl", ""] },
                    isInitialPost: {
                        $cond: {
                            if: {
                                $and: [
                                    { $ne: ["$firstMessageOfThreadInfo", null] },
                                    { $ne: ["$firstMessageOfThreadInfo._id", null] },
                                    { $eq: ["$_id", "$firstMessageOfThreadInfo._id"] }
                                ]
                            },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: { // Clean up temporary fields
                    authorInfo: 0,
                    firstMessageOfThreadInfo: 0
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by newest first
            }
        ]).toArray();

        res.json(userMessages);
    } catch (error) {
        console.error("Error fetching user messages:", error);
        next(error);
    }
};

// Controller to delete a message posted by the logged-in user
export const deleteUserMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const loggedInUserId = req.user.id; // From protect middleware

    try {
        if (!ObjectId.isValid(messageId)) {
            return res.status(400).json({ message: 'Invalid message ID format' });
        }

        const messagesCollection = getCollection('messages');
        
        // Find the message to ensure it exists and belongs to the user
        const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Check ownership
        // Note: Comparing ObjectId instances directly might require .equals() 
        if (message.authorId.toString() !== loggedInUserId.toString()) {
            return res.status(403).json({ message: 'User not authorized to delete this message' });
        }

        // Delete the message
        const result = await messagesCollection.deleteOne({ _id: new ObjectId(messageId) });

        if (result.deletedCount === 0) {
            // This shouldn't happen if we found it above, but good practice
            return res.status(404).json({ message: 'Message not found or already deleted' });
        }

        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error("Error deleting message:", error);
        next(error);
    }
};
