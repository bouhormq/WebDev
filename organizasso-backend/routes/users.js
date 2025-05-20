import express from 'express';
import {
    getUserProfile,
    updateUserProfile,
    getUserMessages,
    deleteUserMessage
} from '../controllers/userController.js';
import { protect, approved } from '../middleware/authMiddleware.js';
import { uploadProfilePic } from '../middleware/multerConfig.js';

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

// @route   PUT api/users/:userId/profile
// @desc    Update user profile information (including profile picture)
// @access  Approved Member (Owner)
// The `uploadProfilePic.single('profilePic')` middleware handles the file upload named 'profilePic'
router.put('/:userId/profile', uploadProfilePic.single('profilePic'), updateUserProfile);

// @route   DELETE api/users/messages/:messageId
// @desc    Delete a message posted by the logged-in user
// @access  Approved Member (Owner)
router.delete('/messages/:messageId', deleteUserMessage);

export default router;
