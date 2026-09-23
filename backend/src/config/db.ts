import mongoose from 'mongoose';

export let isMongoConnected = false;

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (uri && uri.trim() !== '') {
    try {
      console.log(`[DB] Attempting connection to MongoDB at: ${uri}`);
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 2000,
      });
      isMongoConnected = true;
      console.log(`[DB] Successfully connected to live MongoDB!`);
      return;
    } catch (err: any) {
      console.warn(`[DB] Could not connect to external MongoDB: ${err.message}`);
    }
  }

  // Fallback: Check if local standard MongoDB daemon is running on 27017
  try {
    const localUri = 'mongodb://127.0.0.1:27017/feedants';
    await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 1500,
    });
    isMongoConnected = true;
    console.log(`[DB] Connected to local MongoDB at: ${localUri}`);
    return;
  } catch {
    // Expected when no local mongod service is installed
  }

  // Graceful Zero-Dependency Fallback: In-Memory Engine
  isMongoConnected = false;
  console.log(`[DB] Live MongoDB daemon not detected.`);
  console.log(`[DB] ✨ Activated High-Fidelity In-Memory Database Engine!`);
  console.log(`[DB] (To connect to a live MongoDB instance or Atlas, define MONGODB_URI in backend/.env)`);
}

export async function disconnectDB(): Promise<void> {
  if (isMongoConnected) {
    await mongoose.disconnect();
  }
}
