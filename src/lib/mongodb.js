import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

/**
 * Global cache to prevent creating a new connection on every hot-reload
 * in development (Next.js clears module cache but not globals).
 */
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (mongoose.connection.readyState !== 1) {
    cached.conn = null;
  }

  if (!cached.promise) {
    cached.promise = connectWithRetry();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

async function connectWithRetry() {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      return await mongoose.connect(MONGODB_URI, {
        bufferCommands: false,
        dbName: "globetrotter",
        family: 4,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
    } catch (error) {
      lastError = error;
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  throw lastError;
}

export default connectDB;
