import express from 'express';
import {
    createThread,
    getThreadById,
    addReplyToThread, // Import the new controller function
    likeMessage, // Added
    dislikeMessage, // Added
    deleteThreadAndReplies // Import the new controller function
} from '../controllers/threadController.js';
import { protect, approved } from '../middleware/authMiddleware.js';
import { uploadContentImage } from '../middleware/multerConfig.js'; // Corrected import path

const router = express.Router();

// @route   POST api/threads
// @desc    Create a new thread (and its first message)
// @access  Protected (Approved Member / Admin for closed)
router.post('/', protect, approved, uploadContentImage.single('threadImage'), createThread);

// @route   GET api/threads/:threadId
// @desc    Get a single thread by its ID with initial message and author
// @access  Protected (Approved users should be able to see any thread unless forum is restricted)
router.get('/:threadId', protect, getThreadById);

// @route   POST api/threads/:threadId/replies
// @desc    Add a reply to a thread
// @access  Protected (Approved Member)
router.post('/:threadId/replies', protect, approved, uploadContentImage.single('replyImage'), addReplyToThread);

// @route   POST api/threads/messages/:messageId/like
// @desc    Like a message
// @access  Protected (Approved Member)
router.post('/messages/:messageId/like', protect, approved, likeMessage);

// @route   POST api/threads/messages/:messageId/dislike
// @desc    Dislike a message
// @access  Protected (Approved Member)
router.post('/messages/:messageId/dislike', protect, approved, dislikeMessage);

// @route   DELETE api/threads/:threadId
// @desc    Delete a thread and all its replies
// @access  Protected (Thread Owner or Admin)
router.delete('/:threadId', protect, approved, deleteThreadAndReplies);

export default router;