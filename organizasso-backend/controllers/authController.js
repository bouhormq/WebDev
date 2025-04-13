import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getCollection } from '../config/db.js';
import dotenv from 'dotenv';
import { ObjectId } from 'mongodb'; // Need ObjectId for fetching user by ID

dotenv.config();

const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1d';

if (!jwtSecret) {
    throw new Error('FATAL ERROR: JWT_SECRET is not defined in .env file');
}

// Helper function to ensure unique indexes exist
const ensureUserIndexes = async (usersCollection) => {
    try {
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        console.log("User indexes ensured (username, email unique).");
    } catch (error) {
        if (error.code === 85 || error.code === 86) { // IndexOptionsConflict or IndexKeySpecsConflict
            console.log("User indexes already exist or conflict with existing index.");
        } else {
            console.error("Error creating user indexes:", error);
            // Depending on the error, you might want to throw it or handle it
        }
    }
};

export const registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;

    // Basic Input Validation
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Please provide username, email, and password' });
    }
    if (password.length < 6) { // Example: Minimum password length
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    // TODO: Add more robust validation (e.g., email format)

    try {
        const usersCollection = getCollection('users');

        // Ensure unique indexes are created (runs on first registration or if dropped)
        await ensureUserIndexes(usersCollection);

        // Check if username or email already exists
        const existingUser = await usersCollection.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            let message = 'User already exists.';
            if (existingUser.username === username) {
                message = 'Username already taken.';
            } else if (existingUser.email === email) {
                message = 'Email already registered.';
            }
            return res.status(400).json({ message });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user document
        const newUser = {
            username: username,
            email: email,
            password: hashedPassword,
            isApproved: false, // Default: not approved
            isAdmin: false,    // Default: not admin
            createdAt: new Date(),
            // Add other fields as needed, e.g., joinDate (same as createdAt here)
        };

        // Insert user into database
        const result = await usersCollection.insertOne(newUser);

        console.log(`User registered successfully: ${username} (ID: ${result.insertedId})`);

        // Respond (don't send back the password hash!)
        // Send back limited user info or just a success message
        res.status(201).json({
            message: 'Registration request submitted successfully. Please wait for admin approval.',
            // Optional: return some non-sensitive data if needed by frontend immediately
            // userId: result.insertedId 
        });

    } catch (error) {
        console.error("Registration Error:", error);
        // Handle potential duplicate key errors during insert if index creation is slow/failsafe
        if (error.code === 11000) { // Duplicate key error code
             return res.status(400).json({ message: 'Username or email already exists.' });
        }
        // Pass other errors to the global error handler
        next(error); 
    }
};

// --- Login User Controller ---
export const loginUser = async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide username and password' });
    }

    try {
        const usersCollection = getCollection('users');

        // Find user by username
        const user = await usersCollection.findOne({ username: username });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' }); // User not found
        }

        // Compare password with stored hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' }); // Password doesn't match
        }

        // --- Check if user is approved ---
        if (!user.isApproved) {
             // Send a specific status code (e.g., 403 Forbidden) and message
             return res.status(403).json({ message: 'Your account is pending admin approval.' });
        }
        // --- END NEW CHECK ---

        // --- Passwords match: Generate JWT --- 

        // Create payload for the token
        const payload = {
            user: {
                id: user._id,         // Use MongoDB's _id
                username: user.username,
                isAdmin: user.isAdmin,
                isApproved: user.isApproved
            }
        };

        // Sign the token
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: jwtExpiresIn },
            (err, token) => {
                if (err) throw err; // Handle potential JWT error

                // Respond with token and user info (excluding password)
                res.json({
                    token,
                    user: {
                        id: user._id,
                        username: user.username,
                        email: user.email,
                        isAdmin: user.isAdmin,
                        isApproved: user.isApproved,
                        createdAt: user.createdAt
                    }
                });
            }
        );

    } catch (error) {
        console.error("Login Error:", error);
        next(error); // Pass error to global handler
    }
};

// --- Get Logged In User Controller ---
export const getMe = async (req, res, next) => {
    // protect middleware already put user data in req.user
    const userId = req.user.id;
    try {
        const usersCollection = getCollection('users');
        // Fetch fresh user data from DB to ensure it's up-to-date
        const user = await usersCollection.findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } } // Exclude password
        );

        if (!user) {
            // This case should be rare if token is valid, but handles deleted users
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user); // Send back the full user object (without password)

    } catch (error) {
        console.error("GetMe Error:", error);
        next(error); // Pass error to global handler
    }
};
