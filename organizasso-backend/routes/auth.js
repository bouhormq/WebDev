import express from 'express';
import { registerUser, loginUser, getMe, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/auth/me
// @desc    Get current logged-in user data (using token)
// @access  Private
router.get('/me', protect, getMe);

// @route   POST api/auth/logout
// @desc    Logout user (e.g., invalidate token on server-side)
// @access  Private (user must be logged in to log out)
router.post('/logout', protect, logoutUser);

export default router;
