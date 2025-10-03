import dotenv from 'dotenv';
import { z } from 'zod';

// Import process for environments where it's not global
import process from 'process';
// Import console for environments where it's not global
import console from 'node:console';

// Load environment variables
dotenv.config();

// Environment validation schema
const baseEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),

  // Database
  MONGODB_URI: z.string().default('mongodb://localhost:27017/chat-app'),

  // JWT
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_SECRET: z.string().optional(),
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
  SESSION_SECRET: z.string().optional(),

  // Cookies
  COOKIE_SECRET: z.string().optional(),
  COOKIE_SECURE: z.coerce.boolean().default(false), // Set to true in production
  COOKIE_HTTP_ONLY: z.coerce.boolean().default(true),
  COOKIE_SAME_SITE: z.enum(['strict', 'lax', 'none']).default('lax'),
  COOKIE_ACCESS_TOKEN_EXPIRES: z.coerce.number().default(15 * 60 * 1000), // 15 minutes in ms
  COOKIE_REFRESH_TOKEN_EXPIRES: z.coerce.number().default(7 * 24 * 60 * 60 * 1000), // 7 days in ms

  // Resend Email Service
  RESEND_API_KEY: z.string().optional(),

  // Frontend URL
  FRONTEND_URL: z.string().optional(),
});

// First, validate with optional secrets
const baseValidation = baseEnvSchema.safeParse(process.env);

if (!baseValidation.success) {
  console.error('❌ Invalid environment variables:');
  console.error(baseValidation.error.issues);
  process.exit(1);
}

const baseEnv = baseValidation.data;

// Set development defaults
if (baseEnv.NODE_ENV === 'development') {
  baseEnv.JWT_SECRET ??= 'dev-jwt-secret-key-32-characters-long';
  baseEnv.JWT_REFRESH_SECRET ??= 'dev-jwt-refresh-secret-32-chars-long';
  baseEnv.SESSION_SECRET ??= 'dev-session-secret-key-32-characters';
  baseEnv.COOKIE_SECRET ??= 'dev-cookie-secret-key-32-characters';
}

// Now validate with required secrets
const envSchema = z.object({
  ...baseEnvSchema.shape,
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT refresh secret must be at least 32 characters'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
  COOKIE_SECRET: z.string().min(32, 'Cookie secret must be at least 32 characters'),
});

// Validate environment variables
const envValidation = envSchema.safeParse(baseEnv);

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

export default env;
