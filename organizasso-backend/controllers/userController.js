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
        
        res.json(userProfile);
    } catch (error) {
        console.error("Error fetching user profile:", error);
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
        // Find messages where authorId matches the requested userId
        // We also need user info (username) for display, so we can use $lookup
        // Or, fetch user info separately if needed, or store authorName on message
        // For simplicity now, just fetch messages by authorId
        const userMessages = await messagesCollection.find(
            { authorId: new ObjectId(userId) }
        ).sort({ createdAt: -1 }).toArray(); // Sort by newest first
        
        // TODO: Potentially add author username to messages via $lookup or store denormalized

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
