import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Helper to get user data for enriching results (can be expanded)
const getUserInfo = async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) return { username: 'Unknown' };
    const usersCollection = getCollection('users');
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) }, { projection: { username: 1 } });
    return user || { username: 'Unknown' };
};

// Controller to get threads for the Open Forum
export const getOpenForumThreads = async (req, res, next) => {
    try {
        const threadsCollection = getCollection('threads');
        // Find threads marked as 'open'
        // TODO: Add author username, last post time, reply count via aggregation or denormalization
        const threads = await threadsCollection.find(
            { forumType: 'open' }
        ).sort({ lastActivity: -1 }).toArray(); // Sort by most recent activity

        // Basic enrichment (replace with aggregation later for performance)
        for (let thread of threads) {
             if (thread.authorId) {
                 const author = await getUserInfo(thread.authorId);
                 thread.authorName = author.username;
             }
             // Add placeholder replyCount/lastPostTime if not stored
             thread.replyCount = thread.replyCount || 0;
             thread.lastPostTime = thread.lastActivity || thread.createdAt;
         }

        res.json(threads);
    } catch (error) {
        console.error("Error fetching open forum threads:", error);
        next(error);
    }
};

// Controller to get threads for the Closed Forum (Admin only)
export const getClosedForumThreads = async (req, res, next) => {
    try {
        const threadsCollection = getCollection('threads');
        const threads = await threadsCollection.find(
            { forumType: 'closed' }
        ).sort({ lastActivity: -1 }).toArray();

        // Basic enrichment
        for (let thread of threads) {
             if (thread.authorId) {
                 const author = await getUserInfo(thread.authorId);
                 thread.authorName = author.username;
             }
             thread.replyCount = thread.replyCount || 0;
             thread.lastPostTime = thread.lastActivity || thread.createdAt;
         }

        res.json(threads);
    } catch (error) {
        console.error("Error fetching closed forum threads:", error);
        next(error);
    }
};

// Controller to get messages for a specific thread
export const getThreadMessages = async (req, res, next) => {
    const { threadId } = req.params;
    try {
        if (!ObjectId.isValid(threadId)) {
            return res.status(400).json({ message: 'Invalid thread ID format' });
        }
        const messagesCollection = getCollection('messages');
        // TODO: Add author username (aggregation or denormalization)
        const messages = await messagesCollection.find(
            { threadId: new ObjectId(threadId) }
        ).sort({ createdAt: 1 }).toArray(); // Sort by oldest first

        // Basic enrichment
        for (let message of messages) {
             if (message.authorId) {
                 const author = await getUserInfo(message.authorId);
                 message.authorName = author.username;
             }
         }

        res.json(messages);
    } catch (error) {
        console.error("Error fetching thread messages:", error);
        next(error);
    }
};

// Controller to create a new thread
export const createThread = async (req, res, next) => {
    const { title, content } = req.body;
    const authorId = req.user.id; // From protect middleware
    // Determine forum type based on the route used (requires parsing req.path or passing type)
    // Simple approach: check if the path includes '/closed/'
    const forumType = req.path.includes('/closed/') ? 'closed' : 'open';

    // Basic Validation
    if (!title || !content) {
        return res.status(400).json({ message: 'Thread title and initial message content are required' });
    }
    if (forumType === 'closed' && !req.user.isAdmin) {
         return res.status(403).json({ message: 'Admin privileges required to post in closed forum' });
    }

    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages');
        const now = new Date();

        // 1. Create the thread document
        const newThread = {
            title,
            forumType,
            authorId: new ObjectId(authorId),
            createdAt: now,
            lastActivity: now, // Initially, last activity is creation time
            // Optional: denormalized fields like replyCount start at 1 (initial message)
            replyCount: 1 
        };
        const threadResult = await threadsCollection.insertOne(newThread);
        const newThreadId = threadResult.insertedId;

        // 2. Create the initial message document
        const initialMessage = {
            threadId: newThreadId,
            authorId: new ObjectId(authorId),
            content,
            createdAt: now,
        };
        await messagesCollection.insertOne(initialMessage);

        // Fetch author username for response enrichment
        const author = await getUserInfo(authorId);

        // Respond with the created thread info
        res.status(201).json({
            ...newThread,
            _id: newThreadId, // Ensure ID is included
            authorName: author.username, // Add author name
            lastPostTime: now // For consistency with list view
        });

    } catch (error) {
        console.error("Error creating thread:", error);
        next(error);
    }
};

// Controller to post a reply to a thread
export const postReply = async (req, res, next) => {
    const { threadId } = req.params;
    const { content } = req.body;
    const authorId = req.user.id;

    if (!content) {
        return res.status(400).json({ message: 'Reply content cannot be empty' });
    }
    if (!ObjectId.isValid(threadId)) {
        return res.status(400).json({ message: 'Invalid thread ID format' });
    }

    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages');
        const now = new Date();

        // 1. Find the thread to ensure it exists and check access (if closed)
        const thread = await threadsCollection.findOne({ _id: new ObjectId(threadId) });
        if (!thread) {
            return res.status(404).json({ message: 'Thread not found' });
        }
        // If it's a closed forum, ensure user is admin (already handled by route middleware, but good defense)
        if (thread.forumType === 'closed' && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Cannot post reply in closed forum' });
        }

        // 2. Create the message document
        const newMessage = {
            threadId: new ObjectId(threadId),
            authorId: new ObjectId(authorId),
            content,
            createdAt: now,
        };
        const messageResult = await messagesCollection.insertOne(newMessage);

        // 3. Update the thread's lastActivity time and increment reply count
        await threadsCollection.updateOne(
            { _id: new ObjectId(threadId) },
            {
                 $set: { lastActivity: now },
                 $inc: { replyCount: 1 }
            }
        );

        // Fetch author username for response enrichment
        const author = await getUserInfo(authorId);

        // Respond with the created message info
        res.status(201).json({
            ...newMessage,
            _id: messageResult.insertedId, // Ensure ID is included
            authorName: author.username // Add author name
        });

    } catch (error) {
        console.error("Error posting reply:", error);
        next(error);
    }
};
