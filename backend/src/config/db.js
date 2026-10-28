import dns from 'node:dns';
import mongoose from 'mongoose';

// Ensure reliable SRV DNS resolution for MongoDB Atlas across local routers/Windows DNS in dev
if (process.env.NODE_ENV !== 'production') {
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  } catch {
    // Gracefully fallback to default system DNS
  }
}

/**
 * Global cache for Mongoose connection across serverless invocations.
 * In serverless environments (like Vercel), function instances are reused across requests.
 * Caching the connection avoids creating new connections on every invocation and exhausting connection pools.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devpulse';

  if (cached.conn) {
    return cached.conn;
  }

  if (mongoose.connection.readyState === 1) {
    cached.conn = mongoose;
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(uri, opts).then((conn) => {
      console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error(`[MongoDB] Connection error: ${error.message}`);
    throw error;
  }

  return cached.conn;
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('[MongoDB] Disconnected successfully');
  } catch (error) {
    console.error(`[MongoDB] Disconnection error: ${error.message}`);
  }
};
