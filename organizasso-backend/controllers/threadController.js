import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Controller function to create a new thread and its initial message
export const createThread = async (req, res, next) => {
    console.log("createThread: req.body:", JSON.stringify(req.body, null, 2));
    console.log("createThread: req.file:", JSON.stringify(req.file, null, 2));

    const { title, content, forumType } = req.body;
    const authorId = req.user.id; // From protect middleware
    const isAdmin = req.user.isAdmin; // From protect middleware
    let imageUrl = null;

    // Check for uploaded image for the thread's first message
    if (req.file) {
      // Construct the URL path relative to the /uploads directory
      // e.g., /uploads/content-images/content-userid-timestamp.jpg
      imageUrl = `/uploads/content-images/${req.file.filename}`;
    }

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
        const usersCollection = getCollection('users'); // Added for fetching author details
        const now = new Date();

        // --- Create Thread Document ---
        const newThreadDocument = {
            title: title.trim(),
            authorId: new ObjectId(authorId),
            forumType: forumType,
            createdAt: now,
            lastReplyAt: now, // Initially set to thread creation time
            messageCount: 1, // Start with 1 message
        };

        const threadInsertResult = await threadsCollection.insertOne(newThreadDocument);
        const newThreadId = threadInsertResult.insertedId;

        // --- Create Initial Message Document ---
        const initialMessageDocument = {
            threadId: newThreadId,
            authorId: new ObjectId(authorId),
            content: content.trim(),
            createdAt: now,
            imageUrl: imageUrl, // Add imageUrl to the message
            likes: [],
            dislikes: [],
            likeCount: 0,
            dislikeCount: 0,
        };

        await messagesCollection.insertOne(initialMessageDocument);

        // --- Respond with Created Thread Info ---
        // Fetch the newly created thread to include its _id in the response
        const createdThread = await threadsCollection.findOne({ _id: newThreadId });

        if (!createdThread) {
            // Should ideally not happen if insert succeeded
             throw new Error('Failed to retrieve newly created thread.');
        }

        // Fetch author details
        const author = await usersCollection.findOne(
            { _id: new ObjectId(authorId) },
            { projection: { username: 1, displayName: 1, profilePicUrl: 1 } }
        );

        const enrichedThreadResponse = {
            ...createdThread,
            content: initialMessageDocument.content, // Content from the initial message
            imageUrl: initialMessageDocument.imageUrl, // Image URL from the initial message
            authorName: author ? (author.displayName || author.username) : 'Unknown',
            profilePicUrl: author ? (author.profilePicUrl || '') : '',
            lastPostTime: createdThread.lastReplyAt, // As per frontend expectation
        };

        res.status(201).json(enrichedThreadResponse);

    } catch (error) {
        console.error("Error creating new thread:", error);
        next(error);
    }
};

// Controller function to get a single thread by its ID, including its initial message content
export const getThreadById = async (req, res, next) => {
    const { threadId } = req.params;

    if (!ObjectId.isValid(threadId)) {
        return res.status(400).json({ message: 'Invalid thread ID format.' });
    }

    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages');
        const usersCollection = getCollection('users'); // For author details

        // Fetch the thread
        const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found.' });
        }

        // Fetch the initial message for this thread to get its content
        // Assuming the first message posted to a thread is its main content
        const initialMessage = await messagesCollection.findOne(
            { threadId: new ObjectId(threadId) },
            { sort: { createdAt: 1 } } // Get the earliest message
        );

        if (!initialMessage) {
            // This case should ideally not happen if a thread exists
            return res.status(404).json({ message: 'Initial message for thread not found.' });
        }

        // Fetch author details for the thread
        let authorDetails = null;
        if (thread.authorId && ObjectId.isValid(thread.authorId)) {
            authorDetails = await usersCollection.findOne(
                { _id: new ObjectId(thread.authorId) },
                // Fetch username, displayName, and profilePicUrl
                { projection: { username: 1, displayName: 1, profilePicUrl: 1, _id: 0 } }
            );
        }

        // Combine thread data with its initial content and author info
        const threadWithDetails = {
            ...thread,
            content: initialMessage.content, // Add the content from the first message
            imageUrl: initialMessage.imageUrl, // Add the imageUrl from the first message
            authorName: authorDetails ? (authorDetails.displayName || authorDetails.username) : 'Unknown',
            profilePicUrl: authorDetails ? authorDetails.profilePicUrl : '',
        };

        res.status(200).json(threadWithDetails);

    } catch (error) {
        console.error(`Error fetching thread by ID (${threadId}):`, error);
        next(error);
    }
};

// Controller function to add a reply to a thread
export const addReplyToThread = async (req, res, next) => {
    const { threadId } = req.params;
    const { content, parentId } = req.body; // Added parentId to destructuring
    const authorId = req.user.id;
    let imageUrl = null;

    // Check for uploaded image for the reply
    if (req.file) {
      imageUrl = `/uploads/content-images/${req.file.filename}`;
    }

    // --- Input Validation ---
    if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: 'Reply content cannot be empty.' });
    }
    if (!ObjectId.isValid(threadId)) {
        return res.status(400).json({ message: 'Invalid thread ID format.' });
    }
    // Optional: Validate parentId if provided
    if (parentId && !ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: 'Invalid parent ID format.' });
    }

    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages');
        const usersCollection = getCollection('users');
        const now = new Date();

        // --- Check if Thread Exists ---
        const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found.' });
        }

        // --- Create Reply Message Document ---
        const replyMessageDocument = {
            threadId: new ObjectId(threadId),
            authorId: new ObjectId(authorId),
            content: content.trim(),
            imageUrl: imageUrl, // Add imageUrl to the reply message
            parentId: parentId ? new ObjectId(parentId) : null, // Add parentId
            createdAt: now,
            likes: [],
            dislikes: [],
            likeCount: 0,
            dislikeCount: 0,
        };

        const insertResult = await messagesCollection.insertOne(replyMessageDocument);
        const newReplyId = insertResult.insertedId;

        // --- Update Thread Document ---
        await threadsCollection.updateOne(
            { _id: new ObjectId(threadId) },
            {
                $set: { lastReplyAt: now },
                $inc: { messageCount: 1 } // Increment message count
            }
        );

        // --- Respond with Created Reply Info ---
        // Fetch author details for the reply
        const author = await usersCollection.findOne(
            { _id: new ObjectId(authorId) },
            { projection: { username: 1, displayName: 1, profilePicUrl: 1 } }
        );
        
        const createdReply = await messagesCollection.findOne({ _id: newReplyId });

        const enrichedReplyResponse = {
            ...createdReply,
            authorName: author ? (author.displayName || author.username) : 'Unknown',
            profilePicUrl: author ? (author.profilePicUrl || '') : '',
        };

        res.status(201).json(enrichedReplyResponse);

    } catch (error) {
        console.error(`Error adding reply to thread ${threadId}:`, error);
        next(error);
    }
};

// TODO: Add other thread controllers here (getThreads, getThreadById, etc.)

// Controller function to like a message
export const likeMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: 'Invalid message ID format.' });
    }

    try {
        const messagesCollection = getCollection('messages');
        const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });

        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        const userObjectId = new ObjectId(userId);
        const hasLiked = message.likes.some(id => id.equals(userObjectId));
        const hasDisliked = message.dislikes.some(id => id.equals(userObjectId));

        let updateQuery = {};

        if (hasLiked) {
            // User wants to undo their like
            updateQuery = {
                $pull: { likes: userObjectId },
                $inc: { likeCount: -1 }
            };
        } else {
            // User wants to like the message
            updateQuery = {
                $addToSet: { likes: userObjectId }, // Add to set to prevent duplicates
                $inc: { likeCount: 1 }
            };
            if (hasDisliked) {
                // If user previously disliked, remove dislike
                updateQuery.$pull = { ...updateQuery.$pull, dislikes: userObjectId };
                updateQuery.$inc = { ...updateQuery.$inc, dislikeCount: -1 };
            }
        }

        await messagesCollection.updateOne({ _id: new ObjectId(messageId) }, updateQuery);
        const updatedMessage = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
        res.status(200).json(updatedMessage);

    } catch (error) {
        console.error(`Error liking message ${messageId}:`, error);
        next(error);
    }
};

// Controller function to dislike a message
export const dislikeMessage = async (req, res, next) => {
    const { messageId } = req.params;
    const userId = req.user.id;

    if (!ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: 'Invalid message ID format.' });
    }

    try {
        const messagesCollection = getCollection('messages');
        const message = await messagesCollection.findOne({ _id: new ObjectId(messageId) });

        if (!message) {
            return res.status(404).json({ message: 'Message not found.' });
        }

        const userObjectId = new ObjectId(userId);
        const hasLiked = message.likes.some(id => id.equals(userObjectId));
        const hasDisliked = message.dislikes.some(id => id.equals(userObjectId));

        let updateQuery = {};

        if (hasDisliked) {
            // User wants to undo their dislike
            updateQuery = {
                $pull: { dislikes: userObjectId },
                $inc: { dislikeCount: -1 }
            };
        } else {
            // User wants to dislike the message
            updateQuery = {
                $addToSet: { dislikes: userObjectId }, // Add to set to prevent duplicates
                $inc: { dislikeCount: 1 }
            };
            if (hasLiked) {
                // If user previously liked, remove like
                updateQuery.$pull = { ...updateQuery.$pull, likes: userObjectId };
                updateQuery.$inc = { ...updateQuery.$inc, likeCount: -1 };
            }
        }

        await messagesCollection.updateOne({ _id: new ObjectId(messageId) }, updateQuery);
        const updatedMessage = await messagesCollection.findOne({ _id: new ObjectId(messageId) });
        res.status(200).json(updatedMessage);

    } catch (error) {
        console.error(`Error disliking message ${messageId}:`, error);
        next(error);
    }
};

// Controller function to delete a thread and all its replies
export const deleteThreadAndReplies = async (req, res, next) => {
    const { threadId } = req.params;
    const userId = req.user.id; // From protect middleware
    const isAdmin = req.user.isAdmin; // From protect middleware

    // Validate threadId format
    if (!ObjectId.isValid(threadId)) {
        return res.status(400).json({ message: 'Invalid thread ID format.' });
    }

    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages');

        // Fetch the thread to check ownership
        const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });

        if (!thread) {
            return res.status(404).json({ message: 'Thread not found.' });
        }

        // Authorization Check
        if (thread.authorId.toString() !== userId && !isAdmin) {
            return res.status(403).json({ message: 'You are not authorized to delete this thread.' });
        }

        // Deletion Logic:
        // 1. Delete all messages associated with the thread
        const deleteMessagesResult = await messagesCollection.deleteMany({ threadId: new ObjectId(threadId) });
        console.log(`Deleted ${deleteMessagesResult.deletedCount} messages for thread ${threadId}`);

        // 2. Delete the thread document itself
        await threadsCollection.deleteOne({ _id: new ObjectId(threadId) });
        console.log(`Deleted thread ${threadId}`);

        res.status(200).json({ message: 'Thread and all its replies deleted successfully.' });

    } catch (error) {
        console.error(`Error deleting thread ${threadId} and its replies:`, error);
        next(error); // Pass error to the global error handler
    }
};