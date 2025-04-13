import express from 'express';
import {
    getPendingRegistrations,
    getMembers,
    approveRegistration,
    rejectRegistration,
    grantAdminStatus,
    revokeAdminStatus
} from '../controllers/adminController.js';
import { protect, approved, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply admin protection to all routes in this file
router.use(protect, approved, admin);

// @route   GET api/admin/pending
// @desc    Get users awaiting approval
// @access  Admin
router.get('/pending', getPendingRegistrations);

// @route   GET api/admin/members
// @desc    Get all approved members (for managing roles)
// @access  Admin
router.get('/members', getMembers);

// @route   POST api/admin/users/:userId/approve
// @desc    Approve a user registration
// @access  Admin
router.post('/users/:userId/approve', approveRegistration);

// @route   POST api/admin/users/:userId/reject
// @desc    Reject a user registration
// @access  Admin
router.post('/users/:userId/reject', rejectRegistration);

// @route   POST api/admin/users/:userId/grant-admin
// @desc    Grant admin privileges to a user
// @access  Admin
router.post('/users/:userId/grant-admin', grantAdminStatus);

// @route   POST api/admin/users/:userId/revoke-admin
// @desc    Revoke admin privileges from a user
// @access  Admin
router.post('/users/:userId/revoke-admin', revokeAdminStatus);

export default router;
