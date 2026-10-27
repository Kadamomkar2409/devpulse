import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { connectDB, disconnectDB } from './src/config/db.js';

const PORT = process.env.PORT || 5000;

// Catch synchronous exceptions
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION] Shutting down...', err.name, err.message, err.stack);
  process.exit(1);
});

let server;

const startServer = async () => {
  try {
    await connectDB();
    console.log('[DB] Database connection established.');
  } catch (err) {
    console.warn('[DB WARNING] Database connection failed:', err.message);
    console.warn('[DB WARNING] Running backend in offline/transient mode. Set MONGODB_URI in .env to connect to MongoDB Atlas.');
  }

  server = app.listen(PORT, () => {
    console.log(`[DevPulse Server] Running on http://localhost:${PORT}`);
    console.log(`[DevPulse Server] Health check available at http://localhost:${PORT}/api/v1/health`);
  });
};

startServer();

// Handle unhandled Promise rejections
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION] Shutting down...', err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle graceful termination
const gracefulShutdown = async (signal) => {
  console.log(`\n[${signal}] Received. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('[HTTP] Closed all remaining connections.');
      await disconnectDB();
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
