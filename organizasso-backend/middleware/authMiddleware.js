import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { getCollection } from '../config/db.js'; // Import getCollection

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1);
}

// Base middleware to protect routes and verify token
export const protect = async (req, res, next) => { // Make it async
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        // Check token against denylist first
        const denylistCollection = getCollection('token_denylist');
        const denylistedToken = await denylistCollection.findOne({ token: token });

        if (denylistedToken) {
            console.log('Access denied. Token is denylisted (user logged out).');
            return res.status(401).json({ message: 'Token is denylisted. Please log in again.' });
        }

        // Verify token signature and expiration
        const decoded = jwt.verify(token, jwtSecret);
        
        // Add user from payload to request object
        req.user = decoded.user; // Contains { id, username, isAdmin, isApproved }
        next(); // Proceed to the next middleware/route handler

    } catch (err) {
        console.error('Token verification failed:', err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired.' });
        }
        if (err.name === 'JsonWebTokenError') {
            // This covers signature issues, malformed tokens, etc.
            return res.status(401).json({ message: 'Token is not valid.' });
        }
        // For other errors (e.g., database errors during denylist check), pass to the global error handler
        next(err);
    }
};

// Middleware to check if the authenticated user is approved
export const approved = (req, res, next) => {
    // Assumes `protect` middleware has run first and set req.user
    if (!req.user || !req.user.isApproved) {
        return res.status(403).json({ message: 'Access denied. Account not approved.' });
    }
    next();
};

// Middleware to check if the authenticated user is an admin
export const admin = (req, res, next) => {
    // Assumes `protect` middleware has run first and set req.user
    if (!req.user || !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};
