import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt'; // Import bcrypt
import { connectDB, getCollection } from './config/db.js'; // Import getCollection

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

    // Middleware (place after DB connection ensures getCollection works)
    app.use(cors()); 
    app.use(express.json()); 
    app.use(express.urlencoded({ extended: true })); 

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
