import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt'; // Import bcrypt
import { connectDB, getCollection } from './config/db.js'; // Import getCollection
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import fs from 'fs'; // Import fs

// Import routes
import authRoutes from './routes/auth.js';
import forumRoutes from './routes/forums.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';
import searchRoutes from './routes/search.js'; // Import search routes
import threadRoutes from './routes/threadRoutes.js'; // Import thread routes

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 5000;

// Define originalDirname at a higher scope based on import.meta.url
const __filename = fileURLToPath(import.meta.url);
const originalDirname = dirname(__filename); 

// Log initial paths and environment details early
console.log(`Server_Log: Current working directory (process.cwd()): '${process.cwd()}'`);
console.log(`Server_Log: Original __dirname (from import.meta.url): '${originalDirname}'`);
console.log(`Server_Log: process.platform: '${process.platform}'`);
console.log(`Server_Log: process.env.USER: '${process.env.USER}'`);
console.log(`Server_Log: process.env.HOME: '${process.env.HOME}'`);


// Function to Seed Default Admin User
const seedAdminUser = async () => {
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME;
    const adminEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD;
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');

    if (!adminUsername || !adminEmail || !adminPassword) {
        console.log('Default admin credentials not found in .env, skipping seeding.');
        return;
    }

    try {
        const usersCollection = getCollection('users');

        // Check if admin already exists
        const existingAdmin = await usersCollection.findOne({
            $or: [{ username: adminUsername }, { email: adminEmail }]
        });

        if (!existingAdmin) {
            console.log(`Admin user "${adminUsername}" not found, creating...`);
            const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
            const adminUser = {
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                isApproved: true, // Default admin is approved
                isAdmin: true,    // Default admin is admin
                createdAt: new Date(),
            };
            await usersCollection.insertOne(adminUser);
            console.log(`Default admin user "${adminUsername}" created successfully.`);
        } else {
            console.log(`Admin user "${adminUsername}" already exists.`);
        }
    } catch (error) {
        console.error('Error seeding admin user:', error);
        // Decide if you want to exit or just log the error
        // process.exit(1);
    }
};

// Initialize Server and DB
const startServer = async () => {
    await connectDB(); // Wait for DB connection
    await seedAdminUser(); // Seed admin user after DB is connected

    // Middleware
    app.use(cors()); 
    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true })); 
    
    const uploadsDirectory = path.resolve(originalDirname, 'uploads');
    const contentImagesUploadsDirectory = path.join(uploadsDirectory, 'content-images');
    
    console.log(`Server_Log: Root uploads directory for static serving: '${uploadsDirectory}'`);
    console.log(`Server_Log: Content images directory for static serving: '${contentImagesUploadsDirectory}'`);
    
    // Simplified fs.access check for the root uploads directory
    fs.access(uploadsDirectory, fs.constants.F_OK, (err) => {
      if (err) {
        console.error(`Server_Log: fs.access ERROR - Root directory '${uploadsDirectory}' does NOT exist or is NOT accessible.`);
        console.error(`Server_Log: fs.access error details: ${err.message}`);
      } else {
        console.log(`Server_Log: fs.access SUCCESS - Root directory '${uploadsDirectory}' confirmed to exist and is accessible.`);
      }
    });
    
    // Configure express.static with explicit options
    const staticOptions = {
      dotfiles: 'ignore',      // How to handle dotfiles
      etag: true,               // Enable ETag generation
      fallthrough: false,       // Let serve-static handle its own errors (like 404)
      immutable: false,         // No immutable caching for now
      index: false,             // Disable directory indexing
      lastModified: true,       // Set Last-Modified header
      maxAge: 0,                // Disable browser caching for assets during debugging
      redirect: false           // Disable redirecting to trailing slashes for directories
    };
    console.log(`Server_Log: Using express.static for '/uploads' with options: ${JSON.stringify(staticOptions)}`);
    app.use('/uploads', express.static(uploadsDirectory, staticOptions));
    app.use('/uploads/content-images', express.static(contentImagesUploadsDirectory, staticOptions)); // Serve content images
    
    // Basic Route
    app.get('/', (req, res) => {
      res.send("Organiz'asso Backend API Running"); 
    });

    // Define API routes
    app.use('/api/auth', authRoutes); 
    app.use('/api/forums', forumRoutes);
    app.use('/api/users', userRoutes);   
    app.use('/api/admin', adminRoutes); 
    app.use('/api/search', searchRoutes); // Use the search routes
    app.use('/api/threads', threadRoutes); // Use the thread routes

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send({ message: 'Something broke!', error: err.message });
    });

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
};

startServer(); // Run the async function to start the server
