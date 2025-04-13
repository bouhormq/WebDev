import express from 'express';
import {
    getUserProfile,
    getUserMessages,
    deleteUserMessage 
} from '../controllers/userController.js';
import { protect, approved } from '../middleware/authMiddleware.js';

const router = express.Router();

// All user routes require login and approval
router.use(protect, approved);

// @route   GET api/users/:userId/profile
// @desc    Get user profile information
// @access  Approved Member
router.get('/:userId/profile', getUserProfile);

// @route   GET api/users/:userId/messages
// @desc    Get messages posted by a specific user
// @access  Approved Member
router.get('/:userId/messages', getUserMessages);

// @route   DELETE api/users/messages/:messageId  (or maybe /api/messages/:messageId)
// @desc    Delete a message posted by the logged-in user
// @access  Approved Member (Owner)
router.delete('/messages/:messageId', deleteUserMessage); // User must own the message

export default router;
