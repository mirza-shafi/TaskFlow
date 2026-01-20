import dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config();

// Environment configuration with type safety
export const config = {
  port: process.env.PORT || 5001,
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  allowedOrigins: [
    'http://localhost:3000',
    'https://shafis-task-flow.vercel.app/'
  ]
};

// Validate required environment variables
export const validateEnv = (): void => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI environment variable is required');
  }
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('⚠️  JWT_SECRET not set. Using default (not recommended for production)');
  }
};
