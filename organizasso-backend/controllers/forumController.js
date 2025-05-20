import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb';

// Helper to get user data for enriching results (can be expanded)
const getUserInfo = async (userId) => {
    if (!userId || !ObjectId.isValid(userId)) return { username: 'Unknown', displayName: 'Unknown', profilePicUrl: '' };
    const usersCollection = getCollection('users');
    // Fetch username, displayName, and profilePicUrl
    const user = await usersCollection.findOne(
        { _id: new ObjectId(userId) }, 
        { projection: { username: 1, displayName: 1, profilePicUrl: 1 } }
    );
    return user || { username: 'Unknown', displayName: 'Unknown', profilePicUrl: '' };
};

// Controller to get threads for the Open Forum
export const getOpenForumThreads = async (req, res, next) => {
    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages'); // Get messages collection

        const threadsData = await threadsCollection.find(
            { forumType: 'open' }
        ).sort({ createdAt: -1 }).toArray(); // Changed lastActivity to createdAt

        const enrichedThreads = [];
        for (let thread of threadsData) {
            let authorName = 'Unknown';
            let profilePicUrl = '';
             if (thread.authorId) {
                 const author = await getUserInfo(thread.authorId);
                authorName = author.displayName || author.username;
                profilePicUrl = author.profilePicUrl || '';
             }

            // Fetch the initial message to get all its details
            let firstMessageData = null;
            if (thread._id) { // Ensure thread._id is valid
                firstMessageData = await messagesCollection.findOne(
                    { threadId: new ObjectId(thread._id) }, 
                    { 
                        sort: { createdAt: 1 }, 
                        projection: { 
                            _id: 1, 
                            content: 1, 
                            imageUrl: 1, 
                            likes: 1, 
                            dislikes: 1, 
                            likeCount: 1, 
                            dislikeCount: 1 
                        } 
                    }
                );
            }

            // Get the actual count of messages for the thread
            const actualMessageCount = await messagesCollection.countDocuments({ threadId: new ObjectId(thread._id) });

            enrichedThreads.push({
                ...thread,
                authorName: authorName,
                profilePicUrl: profilePicUrl,
                replyCount: actualMessageCount, // Use actual count
                messageCount: actualMessageCount, // Use actual count
                lastPostTime: thread.lastActivity || thread.createdAt,
                // Embed the initial post details
                initialPost: firstMessageData || { 
                    _id: null, 
                    content: '', 
                    imageUrl: null, 
                    likes: [], 
                    dislikes: [], 
                    likeCount: 0, 
                    dislikeCount: 0 
                }
                // Remove old content and imageUrl properties if they are now within initialPost
            });
         }

        // Sort threads: primary by initialPost.likeCount (desc), secondary by lastActivity (desc)
        enrichedThreads.sort((a, b) => {
            const likeCompare = (b.initialPost?.likeCount || 0) - (a.initialPost?.likeCount || 0);
            if (likeCompare !== 0) {
                return likeCompare;
            }
            return new Date(b.lastPostTime) - new Date(a.lastPostTime);
        });

        res.json(enrichedThreads);
    } catch (error) {
        console.error("Error fetching open forum threads:", error);
        next(error);
    }
};

// Controller to get threads for the Closed Forum (Admin only)
export const getClosedForumThreads = async (req, res, next) => {
    try {
        const threadsCollection = getCollection('threads');
        const messagesCollection = getCollection('messages'); // Get messages collection

        const threadsData = await threadsCollection.find(
            { forumType: 'closed' }
        ).sort({ createdAt: -1 }).toArray(); // Changed lastActivity to createdAt

        const enrichedThreads = [];
        for (let thread of threadsData) {
            let authorName = 'Unknown';
            let profilePicUrl = '';
             if (thread.authorId) {
                 const author = await getUserInfo(thread.authorId);
                authorName = author.displayName || author.username;
                profilePicUrl = author.profilePicUrl || '';
             }

            // Fetch the initial message to get all its details
            let firstMessageData = null;
            if (thread._id) { // Ensure thread._id is valid
                firstMessageData = await messagesCollection.findOne(
                    { threadId: new ObjectId(thread._id) }, 
                    { 
                        sort: { createdAt: 1 }, 
                        projection: { 
                            _id: 1, 
                            content: 1, 
                            imageUrl: 1, 
                            likes: 1, 
                            dislikes: 1, 
                            likeCount: 1, 
                            dislikeCount: 1 
                        } 
                    }
                );
            }
            
            // Get the actual count of messages for the thread
            const actualMessageCount = await messagesCollection.countDocuments({ threadId: new ObjectId(thread._id) });

            enrichedThreads.push({
                ...thread,
                authorName: authorName,
                profilePicUrl: profilePicUrl,
                replyCount: actualMessageCount, // Use actual count
                messageCount: actualMessageCount, // Use actual count
                lastPostTime: thread.lastActivity || thread.createdAt,
                // Embed the initial post details
                initialPost: firstMessageData || { 
                    _id: null, 
                    content: '', 
                    imageUrl: null, 
                    likes: [], 
                    dislikes: [], 
                    likeCount: 0, 
                    dislikeCount: 0 
                }
            });
         }

         // Sort threads: primary by initialPost.likeCount (desc), secondary by lastActivity (desc)
         enrichedThreads.sort((a, b) => {
            const likeCompare = (b.initialPost?.likeCount || 0) - (a.initialPost?.likeCount || 0);
            if (likeCompare !== 0) {
                return likeCompare;
            }
            return new Date(b.lastPostTime) - new Date(a.lastPostTime);
        });

        res.json(enrichedThreads);
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
        const allMessages = await messagesCollection.find(
            { threadId: new ObjectId(threadId) }
        ).sort({ createdAt: 1 }).toArray(); // Sort by oldest first

        // Enrich messages with author details
        const enrichedMessagesWithAuthor = await Promise.all(allMessages.map(async (message) => {
            const author = await getUserInfo(message.authorId);
            return {
                ...message,
                authorName: author.displayName || author.username,
                profilePicUrl: author.profilePicUrl || '',
                replies: [] // Initialize replies array
            };
        }));

        // Build the message tree
        const messageMap = {};
        enrichedMessagesWithAuthor.forEach(message => {
            messageMap[message._id.toString()] = message;
        });

        const rootMessages = [];
        enrichedMessagesWithAuthor.forEach(message => {
            if (message.parentId) {
                const parentIdStr = message.parentId.toString();
                let parent = messageMap[parentIdStr];
                if (parent) {
                    parent.replies.push(message);
                } else {
                    // Parent not found, create a placeholder parent
                    // and add it to messageMap and rootMessages to ensure it's processed.
                    const placeholderParent = {
                        _id: message.parentId, // Use the original parentId for the placeholder
                        authorName: 'Unknown',
                        content: '[This message is deleted]',
                        createdAt: new Date(0), // Or some other default date
                        likes: [],
                        dislikes: [],
                        likeCount: 0,
                        dislikeCount: 0,
                        profilePicUrl: '',
                        replies: [message], // Add current message as a reply to placeholder
                        isPlaceholder: true // Custom flag to identify this as a placeholder
                    };
                    messageMap[parentIdStr] = placeholderParent; // Add to map so other potential siblings find it
                    rootMessages.push(placeholderParent); // Add to root messages to be included in the response
                }
            } else {
                rootMessages.push(message);
            }
        });

        // Sort replies for each message node
        const sortRepliesRecursive = (node) => {
            if (node.replies && node.replies.length > 0) {
                node.replies.sort((a, b) => {
                    const likeCompare = (b.likeCount || 0) - (a.likeCount || 0);
                    if (likeCompare !== 0) {
                        return likeCompare;
                    }
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                node.replies.forEach(sortRepliesRecursive); // Recursively sort replies of replies
            }
        };

        rootMessages.forEach(sortRepliesRecursive);

        // Sort root messages themselves (top-level messages/replies for the current parentId)
        rootMessages.sort((a, b) => {
            const likeCompare = (b.likeCount || 0) - (a.likeCount || 0);
            if (likeCompare !== 0) {
                return likeCompare;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        res.json(rootMessages);
    } catch (error) {
        console.error("Error fetching thread messages:", error);
        next(error);
    }
};

// Controller to create a new thread
export const createThread = async (req, res, next) => {
    const { title, content } = req.body;
    const authorId = req.user.id; // From protect middleware
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
            authorName: author.displayName || author.username, // Add author name
            profilePicUrl: author.profilePicUrl || '',
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
    const { content, parentId } = req.body; // parentId might be used for nested replies
    const authorId = req.user.id;

    if (!content) {
        return res.status(400).json({ message: 'Reply content cannot be empty' });
    }
    if (!ObjectId.isValid(threadId)) {
        return res.status(400).json({ message: 'Invalid thread ID' });
    }

    try {
        const messagesCollection = getCollection('messages');
        const threadsCollection = getCollection('threads');
        const now = new Date();

        // Create the new message
        const newMessage = {
            threadId: new ObjectId(threadId),
            authorId: new ObjectId(authorId),
            content,
            createdAt: now,
            // parentId: parentId ? new ObjectId(parentId) : null, // If supporting nested replies
        };
        const messageResult = await messagesCollection.insertOne(newMessage);

        // Update thread's lastActivity and replyCount
        const updateResult = await threadsCollection.updateOne(
            { _id: new ObjectId(threadId) },
            {
                $set: { lastActivity: now },
                $inc: { replyCount: 1 } // Increment reply count
            }
        );

        if (updateResult.matchedCount === 0) {
            // This means the threadId was valid, but no thread was found (e.g., deleted just before reply)
            // Depending on desired behavior, you might delete the orphaned message or handle differently
            console.warn(`Reply posted to a non-existent or non-updated thread: ${threadId}`);
            // For now, we proceed to return the message, but this is a potential inconsistency point.
        }

        // Fetch author details for the response
        const author = await getUserInfo(authorId);

        // Respond with the created message, enriched with author details
        res.status(201).json({
            ...newMessage,
            _id: messageResult.insertedId,
            authorName: author.displayName || author.username,
            profilePicUrl: author.profilePicUrl || '',
        });

    } catch (error) {
        console.error("Error posting reply:", error);
        next(error);
    }
};

// Controller to handle liking/disliking a message
export const handleMessageReaction = async (req, res, next) => {
    const { messageId } = req.params;
    const { actionType } = req.body; // 'like' or 'dislike'
    const userId = req.user.id; // From protect middleware

    if (!ObjectId.isValid(messageId)) {
        return res.status(400).json({ message: 'Invalid message ID' });
    }
    if (!['like', 'dislike'].includes(actionType)) {
        return res.status(400).json({ message: 'Invalid action type. Must be "like" or "dislike".' });
    }

    try {
        const messagesCollection = getCollection('messages');
        const messageObjectId = new ObjectId(messageId);
        const userObjectId = new ObjectId(userId);

        const message = await messagesCollection.findOne({ _id: messageObjectId });

        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        // Initialize likes/dislikes arrays if they don't exist
        if (!message.likes) message.likes = [];
        if (!message.dislikes) message.dislikes = [];

        const alreadyLiked = message.likes.some(id => id.equals(userObjectId));
        const alreadyDisliked = message.dislikes.some(id => id.equals(userObjectId));

        let updateQuery = {};

        if (actionType === 'like') {
            if (alreadyLiked) {
                // User wants to unlike
                updateQuery = { $pull: { likes: userObjectId } };
            } else {
                // User wants to like
                updateQuery = { $addToSet: { likes: userObjectId }, $pull: { dislikes: userObjectId } };
            }
        } else if (actionType === 'dislike') {
            if (alreadyDisliked) {
                // User wants to undislike
                updateQuery = { $pull: { dislikes: userObjectId } };
            } else {
                // User wants to dislike
                updateQuery = { $addToSet: { dislikes: userObjectId }, $pull: { likes: userObjectId } };
            }
        }

        await messagesCollection.updateOne({ _id: messageObjectId }, updateQuery);

        // Fetch the updated message to get accurate counts
        const updatedMessage = await messagesCollection.findOne({ _id: messageObjectId });

        // Update likeCount and dislikeCount
        const finalUpdate = {
            $set: {
                likeCount: updatedMessage.likes?.length || 0,
                dislikeCount: updatedMessage.dislikes?.length || 0,
            }
        };
        await messagesCollection.updateOne({ _id: messageObjectId }, finalUpdate);
        
        // Fetch the message one last time to return the fully updated document
        const finalMessage = await messagesCollection.findOne({ _id: messageObjectId });

        res.status(200).json({ message: finalMessage }); // Return as { message: finalMessage }

    } catch (error) {
        console.error("Error handling message reaction:", error);
        next(error);
    }
};
