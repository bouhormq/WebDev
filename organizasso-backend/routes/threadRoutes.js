import express from 'express';
import {
    createThread,
    getThreadById // Import the new controller function
} from '../controllers/threadController.js';
import { protect, approved } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/threads
// @desc    Create a new thread (and its first message)
// @access  Protected (Approved Member / Admin for closed)
router.post('/', protect, approved, createThread);

// @route   GET api/threads/:threadId
// @desc    Get a single thread by its ID with initial message and author
// @access  Protected (Approved users should be able to see any thread unless forum is restricted)
router.get('/:threadId', protect, getThreadById);

// TODO: Add other thread routes here (GET /)

export default router; 