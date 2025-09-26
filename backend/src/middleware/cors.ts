import cors from 'cors';
import { env, isDevelopment } from '../config/env.js';
import logger from '../config/logger.js';

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all origins
    if (isDevelopment()) {
      return callback(null, true);
    }

    // In production, check against allowed origins
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(origin => origin.trim());

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      logger.warn(`CORS blocked request from origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: env.CORS_CREDENTIALS,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-CSRF-Token',
  ],
  exposedHeaders: [
    'X-Total-Count',
    'X-Page-Count',
    'Link',
  ],
  optionsSuccessStatus: 200, // Support legacy browsers
  preflightContinue: false,
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Log CORS configuration
logger.info('CORS Configuration', {
  origin: isDevelopment() ? 'All origins (development)' : env.CORS_ORIGIN,
  credentials: env.CORS_CREDENTIALS,
  methods: corsOptions.methods,
});

export default corsMiddleware;
