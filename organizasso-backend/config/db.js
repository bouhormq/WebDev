import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

if (!uri || !dbName) {
  throw new Error('MongoDB URI or Database Name not defined in .env file');
}

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const connectDB = async () => {
  if (db) return db; // Return existing connection if already connected
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("Could not connect to MongoDB", error);
    // Prevent application startup or handle error appropriately
    process.exit(1);
  }
};

// Function to get the database instance
const getDB = () => {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
};

// Function to get specific collections easily
const getCollection = (collectionName) => {
    const database = getDB();
    return database.collection(collectionName);
}

export { connectDB, getDB, getCollection };
