import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Controller function to create a new thread and its initial message
export const createThread = async (req, res, next) => {
    const { title, content, forumType } = req.body;
    const authorId = req.user.id; // From protect middleware
    const isAdmin = req.user.isAdmin; // From protect middleware

    // --- Input Validation ---
    if (!title || !content || !forumType) {
        return res.status(400).json({ message: 'Title, content, and forumType are required.' });
    }

    if (title.trim().length === 0 || content.trim().length === 0) {
         return res.status(400).json({ message: 'Title and content cannot be empty.' });
    }

    if (!['open', 'closed'].includes(forumType)) {
        return res.status(400).json({ message: 'Invalid forum type specified.' });
    }

    // --- Authorization Check for Closed Forum ---
    if (forumType === 'closed' && !isAdmin) {
        return res.status(403).json({ message: 'Only administrators can post in the closed forum.' });
    }

    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages');
        const now = new Date();

        // --- Create Thread Document ---
        const newThread = {
            title: title.trim(),
            authorId: new ObjectId(authorId),
            forumType: forumType,
            createdAt: now,
            lastReplyAt: now, // Initially set to thread creation time
            messageCount: 1, // Start with 1 message
            // Add other fields if needed, e.g., viewCount: 0
        };

        const threadInsertResult = await threadsCollection.insertOne(newThread);
        const newThreadId = threadInsertResult.insertedId;

        // --- Create Initial Message Document ---
        const initialMessage = {
            threadId: newThreadId,
            authorId: new ObjectId(authorId),
            content: content.trim(),
            createdAt: now,
            // Add other fields if needed, e.g., editedAt: null
        };

        await messagesCollection.insertOne(initialMessage);

        // --- Respond with Created Thread Info ---
        // Fetch the newly created thread to include its _id in the response
        const createdThread = await threadsCollection.findOne({ _id: newThreadId });

        if (!createdThread) {
            // Should ideally not happen if insert succeeded
             throw new Error('Failed to retrieve newly created thread.');
        }

        res.status(201).json(createdThread);

    } catch (error) {
        console.error("Error creating new thread:", error);
        next(error);
    }
};

// TODO: Add other thread controllers here (getThreads, getThreadById, etc.) 