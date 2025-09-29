import dotenv from 'dotenv';
import { z } from 'zod';

// Import process for environments where it's not global
import process from 'process';
// Import console for environments where it's not global
import console from 'node:console';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),

  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/chat-app'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  CORS_CREDENTIALS: z.coerce.boolean().default(true),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
  LOG_FILE: z.string().default('logs/app.log'),

  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // Session
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
});

// Validate environment variables
const envValidation = envSchema.safeParse(process.env);

if (!envValidation.success) {
  console.error('❌ Invalid environment variables:');
  console.error(envValidation.error.issues);
  process.exit(1);
}

export const env = envValidation.data;

// Helper functions
export const isDevelopment = () => env.NODE_ENV === 'development';
export const isProduction = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';

// Default values for development
if (isDevelopment()) {
  // Provide default secrets for development only
  if (!process.env.JWT_SECRET) {
    env.JWT_SECRET = 'dev-jwt-secret-key-32-characters-long';
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    env.JWT_REFRESH_SECRET = 'dev-jwt-refresh-secret-32-chars-long';
  }
  if (!process.env.SESSION_SECRET) {
    env.SESSION_SECRET = 'dev-session-secret-key-32-characters';
  }
}

export default env;
