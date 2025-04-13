import express from 'express';
import { searchMessages } from '../controllers/searchController.js';
import { protect, approved } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET api/search
// @desc    Search for messages based on query parameters
// @access  Approved Member
// Example: /api/search?keywords=budget&author=admin&startDate=...&endDate=...
router.get('/', protect, approved, searchMessages);

export default router;
