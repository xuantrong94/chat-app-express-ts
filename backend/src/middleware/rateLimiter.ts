import rateLimit from 'express-rate-limit';
import { env, isDevelopment } from '../config/env.js';
import logger from '../config/logger.js';

// General rate limiter
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS, // 15 minutes by default
  max: env.RATE_LIMIT_MAX_REQUESTS, // 100 requests per windowMs by default
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000 / 60), // in minutes
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting in development if needed
    if (isDevelopment() && req.ip === '127.0.0.1') {
      return true;
    }
    return false;
  },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
      method: req.method,
    });

    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(env.RATE_LIMIT_WINDOW_MS / 1000 / 60),
    });
  },
});

// Strict rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: 15, // 15 minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
    });

    res.status(429).json({
      error: 'Too many authentication attempts, please try again in 15 minutes.',
      retryAfter: 15,
    });
  },
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 3, // 3 password reset attempts per day
  message: {
    error: 'Too many password reset attempts, please try again tomorrow.',
    retryAfter: 24 * 60, // 24 hours in minutes
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('Password reset rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      email: req.body?.email,
    });

    res.status(429).json({
      error: 'Too many password reset attempts, please try again tomorrow.',
    });
  },
});

// API-specific rate limiter (more lenient for API calls)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requests per windowMs
  message: {
    error: 'API rate limit exceeded, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn('API rate limit exceeded', {
      ip: req.ip,
      userAgent: req.get('user-agent'),
      url: req.originalUrl,
      method: req.method,
    });

    res.status(429).json({
      error: 'API rate limit exceeded, please try again later.',
    });
  },
});

// Log rate limiter configuration
logger.info('Rate Limiter Configuration', {
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  developmentMode: isDevelopment(),
});

export default generalLimiter;
