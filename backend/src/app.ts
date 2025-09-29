import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import process from 'process';

// Import configurations
import { env, isDevelopment } from '@/config/env.js';
import logger, { logRequest } from '@/config/logger.js';

// Import middlewares
import { globalErrorHandler, notFoundHandler } from '@/middlewares/errorHandler.js';
import { asyncHandler } from '@/middlewares/asyncHandler';

// Import routes
import routes from '@/routes';

// Create Express application
const app = express();

// Trust proxy for accurate IP addresses behind reverse proxies
app.set('trust proxy', 1);

// Security middlewares
app.use(
  helmet({
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
  })
);

// CORS configuration
app.use(
  cors({
    origin: isDevelopment()
      ? ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000']
      : [env.CORS_ORIGIN],
    credentials: env.CORS_CREDENTIALS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cookie',
    ],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment() ? 1000 : 100, // limit each IP to 100 requests per windowMs in production
  message: {
    success: false,
    error: {
      type: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
      statusCode: 429,
      timestamp: new Date().toISOString(),
    },
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: req => {
    // Skip rate limiting for health checks
    return req.path === '/health' || req.path === '/api/health';
  },
});

app.use(limiter);

// Body parsing middlewares
/* eslint-disable @typescript-eslint/no-explicit-any */
app.use(
  (express as any).json({
    limit: '10mb',
    type: ['application/json', 'text/plain'],
  })
);

app.use(
  (express as any).urlencoded({
    extended: true,
    limit: '10mb',
  })
);
/* eslint-enable @typescript-eslint/no-explicit-any */

// Cookie parser
app.use(cookieParser());

// Compression middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use(compression() as any);

// Logging middleware
if (isDevelopment()) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use(morgan('dev') as any);
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any
  );
}

// Custom request logging middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.use((req: any, res: any, next: any) => {
  const start = Date.now();

  res.on('finish', () => {
    const responseTime = Date.now() - start;
    logRequest(req, res, responseTime);
  });

  next();
});

// Health check endpoint
app.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running on health!! ',
      timestamp: new Date().toISOString(),
      environment: isDevelopment() ? 'development' : 'production',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  })
);

// API routes
app.use('/api', routes);

// Handle 404 errors for undefined routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(globalErrorHandler);

export default app;
