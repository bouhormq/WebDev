import express from 'express';
import {
    createThread
    // Import other thread controllers here when added (e.g., getThreads)
} from '../controllers/threadController.js';
import { protect, approved } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/threads
// @desc    Create a new thread (and its first message)
// @access  Protected (Approved Member / Admin for closed)
router.post('/', protect, approved, createThread);

// TODO: Add other thread routes here (GET /, GET /:threadId)

export default router; 