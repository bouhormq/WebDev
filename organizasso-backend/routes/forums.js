import express from 'express';
import {
    getOpenForumThreads,
    getClosedForumThreads,
    getThreadMessages,
    createThread,
    postReply,
    handleMessageReaction // Import the new controller
} from '../controllers/forumController.js';
import { protect, approved, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Public/Member Routes (Require login + approval) ---

// GET Open Forum Threads
router.get('/open', protect, approved, getOpenForumThreads);

// GET Messages for a specific thread (accessible by any approved member)
router.get('/threads/:threadId/messages', protect, approved, getThreadMessages);

// POST Create a new thread in the Open Forum
router.post('/open/threads', protect, approved, createThread);

// POST Post a reply to any thread (Open or Closed - handled by controller)
router.post('/threads/:threadId/messages', protect, approved, postReply);

// POST Like/Dislike a message
router.post('/messages/:messageId/reaction', protect, approved, handleMessageReaction);


// --- Admin Routes (Require login + approval + admin) ---

// GET Closed Forum Threads
router.get('/closed', protect, approved, admin, getClosedForumThreads);

// POST Create a new thread in the Closed Forum
router.post('/closed/threads', protect, approved, admin, createThread);


export default router;
