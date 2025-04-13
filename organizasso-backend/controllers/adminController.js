import { getCollection } from '../config/db.js';
import { ObjectId } from 'mongodb'; // Import ObjectId

// Controller to get users awaiting approval
export const getPendingRegistrations = async (req, res, next) => {
    try {
        const usersCollection = getCollection('users');
        // Find users where isApproved is false
        const pendingUsers = await usersCollection.find(
            { isApproved: false },
            { projection: { password: 0 } } // Exclude password field
        ).toArray();
        
        res.json(pendingUsers);
    } catch (error) {
        console.error("Error fetching pending registrations:", error);
        next(error);
    }
};

// Controller to get all members (for managing roles)
export const getMembers = async (req, res, next) => {
    try {
        const usersCollection = getCollection('users');
        // Find all users (or maybe filter out pending users, depending on need)
        // For simplicity, let's get all users for now and filter on frontend if needed
        const members = await usersCollection.find(
            {},
            { projection: { password: 0 } } // Exclude password
        ).toArray();
        res.json(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        next(error);
    }
};

// Controller to approve a user registration
export const approveRegistration = async (req, res, next) => {
    const { userId } = req.params;
    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        const usersCollection = getCollection('users');
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId), isApproved: false }, // Ensure we only approve pending users
            { $set: { isApproved: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'Pending user not found or already approved' });
        }
        if (result.modifiedCount === 0) {
             return res.status(304).json({ message: 'User status not modified (already approved?)' });
        }

        res.json({ message: 'User approved successfully' });
    } catch (error) {
        console.error("Error approving user:", error);
        next(error);
    }
};

// Controller to reject (delete) a user registration
export const rejectRegistration = async (req, res, next) => {
    const { userId } = req.params;
     try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        const usersCollection = getCollection('users');
        // We delete the user instead of marking as rejected
        const result = await usersCollection.deleteOne(
            { _id: new ObjectId(userId), isApproved: false } // Ensure we only reject/delete pending users
        );

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Pending user not found or already approved' });
        }

        res.json({ message: 'User registration rejected successfully' });
    } catch (error) {
        console.error("Error rejecting user:", error);
        next(error);
    }
};

// Controller to grant admin privileges
export const grantAdminStatus = async (req, res, next) => {
    const { userId } = req.params;
    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        // Prevent self-promotion (optional, based on requirements)
        if (req.user.id === userId) {
             return res.status(400).json({ message: 'Cannot change your own admin status' });
        }

        const usersCollection = getCollection('users');
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) }, 
            { $set: { isAdmin: true } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
         if (result.modifiedCount === 0) {
             return res.status(304).json({ message: 'User status not modified (already admin?)' });
        }

        res.json({ message: 'Admin status granted successfully' });
    } catch (error) {
        console.error("Error granting admin status:", error);
        next(error);
    }
};

// Controller to revoke admin privileges
export const revokeAdminStatus = async (req, res, next) => {
    const { userId } = req.params;
    try {
        if (!ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        // Prevent self-demotion (based on requirements)
        if (req.user.id === userId) {
             return res.status(400).json({ message: 'Cannot change your own admin status' });
        }

        const usersCollection = getCollection('users');
        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) }, 
            { $set: { isAdmin: false } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (result.modifiedCount === 0) {
             return res.status(304).json({ message: 'User status not modified (already not admin?)' });
        }

        res.json({ message: 'Admin status revoked successfully' });
    } catch (error) {
        console.error("Error revoking admin status:", error);
        next(error);
    }
};
