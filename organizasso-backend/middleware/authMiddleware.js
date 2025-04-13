import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    console.error('FATAL ERROR: JWT_SECRET is not defined in .env file');
    process.exit(1);
}

// Base middleware to protect routes and verify token
export const protect = (req, res, next) => {
    // Get token from header (e.g., "Bearer <token>")
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, jwtSecret);
        
        // Add user from payload to request object
        req.user = decoded.user; // Contains { id, username, isAdmin, isApproved }
        next(); // Proceed to the next middleware/route handler

    } catch (err) {
        console.error('Token verification failed:', err.message);
        res.status(401).json({ message: 'Token is not valid' });
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
