import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Import configurations
import { env, isDevelopment } from './config/env.js';
import logger from './config/logger.js';

// Import middleware
import corsMiddleware from './middleware/cors.js';
import errorHandler, { notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Import routes (will be created later)
// import routes from './routes/index.js';

// Create Express application
const app = express();

// Trust proxy (important for rate limiting and getting real IP addresses)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({
  limit: '10mb',
  strict: true,
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb',
}));

// Cookie parsing
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (isDevelopment()) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  }));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API routes
// app.use('/api/v1', routes);

// Handle 404 errors
app.all('*', notFound);

// Global error handling middleware
app.use(errorHandler);

// Log app configuration
logger.info('Express App Configuration', {
  environment: env.NODE_ENV,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN,
  rateLimitWindow: `${env.RATE_LIMIT_WINDOW_MS / 1000 / 60} minutes`,
  rateLimitMax: env.RATE_LIMIT_MAX_REQUESTS,
});

export default app;
