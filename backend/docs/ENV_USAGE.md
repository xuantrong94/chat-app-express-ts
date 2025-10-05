# Environment Configuration Usage Guide

This document explains how to use the environment configuration system in the
chat app backend.

## Overview

The `src/config/env.ts` module provides a type-safe, validated environment
configuration system using Zod schema validation. It ensures all environment
variables are properly validated and provides sensible defaults for development.

## Import and Usage

### Basic Import

```typescript
import { env } from '@/config/env.js';
```

### Environment Helper Functions

```typescript
import { env, isDevelopment, isProduction, isTest } from '@/config/env.js';

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

if (isProduction()) {
  console.log('Running in production mode');
}
```

## Available Environment Variables

### Application Settings

```typescript
// Server configuration
const port = env.PORT; // number (default: 3000)
const host = env.HOST; // string (default: 'localhost')
const nodeEnv = env.NODE_ENV; // 'development' | 'production' | 'test'

// Example usage in server.ts
server.listen(env.PORT, env.HOST, () => {
  console.log(`Server running on ${env.HOST}:${env.PORT}`);
});
```

### Database Configuration

```typescript
// MongoDB connection
const mongoUri = env.MONGODB_URI; // string (default: 'mongodb://localhost:27017/chat-app')

// Example usage in database.ts
await mongoose.connect(env.MONGODB_URI, mongooseOptions);
```

### JWT Authentication

```typescript
// JWT configuration
const jwtSecret = env.JWT_SECRET; // string (min 32 chars)
const jwtExpiresIn = env.JWT_EXPIRES_IN; // string (default: '24h')
const jwtRefreshSecret = env.JWT_REFRESH_SECRET; // string (min 32 chars)
const jwtRefreshExpiresIn = env.JWT_REFRESH_EXPIRES_IN; // string (default: '7d')

// Example usage in auth service
const token = jwt.sign(payload, env.JWT_SECRET, {
  expiresIn: env.JWT_EXPIRES_IN,
});
```

### CORS Configuration

```typescript
// CORS settings
const corsOrigin = env.CORS_ORIGIN; // string (default: 'http://localhost:5173')
const corsCredentials = env.CORS_CREDENTIALS; // boolean (default: true)

// Example usage in app.ts
app.use(
  cors({
    origin: isDevelopment()
      ? ['http://localhost:3000', 'http://localhost:5173']
      : [env.CORS_ORIGIN],
    credentials: env.CORS_CREDENTIALS,
  })
);
```

### Rate Limiting

```typescript
// Rate limiting configuration
const rateLimitWindow = env.RATE_LIMIT_WINDOW_MS; // number (default: 15 * 60 * 1000)
const rateLimitMax = env.RATE_LIMIT_MAX_REQUESTS; // number (default: 100)

// Example usage
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
});
```

### Logging Configuration

```typescript
// Logging settings
const logLevel = env.LOG_LEVEL; // 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly'
const logFile = env.LOG_FILE; // string (default: 'logs/app.log')

// Example usage in logger.ts
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports: [
    new winston.transports.File({
      filename: env.LOG_FILE,
      level: 'info',
    }),
  ],
});
```

### Security Configuration

```typescript
// Security settings
const bcryptRounds = env.BCRYPT_ROUNDS; // number (default: 12)
const sessionSecret = env.SESSION_SECRET; // string (min 32 chars)

// Example usage
const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
```

### Cookie Configuration

```typescript
// Cookie settings
const cookieSecret = env.COOKIE_SECRET; // string (min 32 chars)
const cookieSecure = env.COOKIE_SECURE; // boolean (default: false)
const cookieHttpOnly = env.COOKIE_HTTP_ONLY; // boolean (default: true)
const cookieSameSite = env.COOKIE_SAME_SITE; // 'strict' | 'lax' | 'none'
const accessTokenExpires = env.COOKIE_ACCESS_TOKEN_EXPIRES; // number (default: 15 * 60 * 1000)
const refreshTokenExpires = env.COOKIE_REFRESH_TOKEN_EXPIRES; // number (default: 7 * 24 * 60 * 60 * 1000)

// Example usage in cookieHelper.ts
const cookieOptions = {
  httpOnly: env.COOKIE_HTTP_ONLY,
  secure: isProduction() ? true : env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
  maxAge: env.COOKIE_ACCESS_TOKEN_EXPIRES,
};

res.cookie('accessToken', token, cookieOptions);
```

### Email Service

```typescript
// Email service configuration
const resendApiKey = env.RESEND_API_KEY; // string (optional)

// Example usage in email.service.ts
if (env.RESEND_API_KEY) {
  const resend = new Resend(env.RESEND_API_KEY);
}
```

## Usage Patterns

### Controller Usage

```typescript
// controllers/auth.controller.ts
import { env } from '@/config/env.js';

export const login = async (req: Request, res: Response) => {
  // Use environment variables for token generation
  const token = generateToken(user.id, env.JWT_SECRET, env.JWT_EXPIRES_IN);

  // Set secure cookies based on environment
  res.cookie('accessToken', token, {
    httpOnly: env.COOKIE_HTTP_ONLY,
    secure: isProduction(),
    maxAge: env.COOKIE_ACCESS_TOKEN_EXPIRES,
  });
};
```

### Service Usage

```typescript
// services/auth.service.ts
import { env } from '@/config/env.js';
import jwt from 'jsonwebtoken';

class AuthService {
  generateAccessToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    });
  }
}
```

### Middleware Usage

```typescript
// middlewares/rateLimiter.ts
import { env } from '@/config/env.js';
import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP',
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: Math.floor(env.RATE_LIMIT_MAX_REQUESTS / 10), // Stricter for auth
  message: 'Too many authentication attempts',
});
```

## Environment-Specific Configurations

### Development Mode

```typescript
if (isDevelopment()) {
  // Development-specific configurations
  app.use(morgan('dev'));

  // More lenient rate limiting
  const devRateLimit = env.RATE_LIMIT_MAX_REQUESTS * 10;

  // Additional CORS origins for local development
  const corsOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    env.CORS_ORIGIN,
  ];
}
```

### Production Mode

```typescript
if (isProduction()) {
  // Production-specific configurations
  app.use(morgan('combined'));

  // Enforce secure cookies
  app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
      return res.redirect(`https://${req.get('host')}${req.url}`);
    }
    next();
  });

  // Strict CORS in production
  app.use(
    cors({
      origin: [env.CORS_ORIGIN],
      credentials: env.CORS_CREDENTIALS,
    })
  );
}
```

## Type Safety

The environment configuration is fully type-safe:

```typescript
// TypeScript will provide autocomplete and type checking
const port: number = env.PORT;
const nodeEnv: 'development' | 'production' | 'test' = env.NODE_ENV;
const corsCredentials: boolean = env.CORS_CREDENTIALS;

// Compilation error if trying to access non-existent property
// const invalid = env.NON_EXISTENT_VAR; // ❌ TypeScript error
```

## Validation and Error Handling

The environment configuration automatically validates all variables on startup:

```typescript
// If validation fails, the application will exit with error
// ❌ Invalid environment variables:
// [
//   {
//     "code": "too_small",
//     "minimum": 32,
//     "type": "string",
//     "inclusive": true,
//     "exact": false,
//     "message": "JWT secret must be at least 32 characters",
//     "path": ["JWT_SECRET"]
//   }
// ]
```

## Default Values

In development mode, the following defaults are automatically set:

```typescript
if (baseEnv.NODE_ENV === 'development') {
  baseEnv.JWT_SECRET ??= 'dev-jwt-secret-key-32-characters-long';
  baseEnv.JWT_REFRESH_SECRET ??= 'dev-jwt-refresh-secret-32-chars-long';
  baseEnv.SESSION_SECRET ??= 'dev-session-secret-key-32-characters';
  baseEnv.COOKIE_SECRET ??= 'dev-cookie-secret-key-32-characters';
}
```

## Best Practices

### 1. Always Use the Typed `env` Object

```typescript
// ✅ Good - Type-safe and validated
import { env } from '@/config/env.js';
const jwtSecret = env.JWT_SECRET;

// ❌ Bad - No type safety or validation
const jwtSecret = process.env.JWT_SECRET;
```

### 2. Use Environment Helper Functions

```typescript
// ✅ Good - Clear and readable
import { isDevelopment, isProduction } from '@/config/env.js';

if (isDevelopment()) {
  // Development logic
}

// ❌ Bad - Repeated string comparisons
if (process.env.NODE_ENV === 'development') {
  // Development logic
}
```

### 3. Environment-Specific Configurations

```typescript
// ✅ Good - Clear separation of concerns
const corsOrigins = isDevelopment()
  ? ['http://localhost:3000', 'http://localhost:5173']
  : [env.CORS_ORIGIN];

const rateLimitMax = isDevelopment()
  ? env.RATE_LIMIT_MAX_REQUESTS * 10 // More lenient in dev
  : env.RATE_LIMIT_MAX_REQUESTS;
```

### 4. Secure Cookie Configuration

```typescript
// ✅ Good - Environment-aware security
const cookieOptions = {
  httpOnly: env.COOKIE_HTTP_ONLY,
  secure: isProduction() ? true : env.COOKIE_SECURE,
  sameSite: env.COOKIE_SAME_SITE as 'strict' | 'lax' | 'none',
};
```

## Error Scenarios

### Missing Required Variables

```bash
# If JWT_SECRET is missing in production
❌ Invalid environment variables:
[
  {
    "code": "invalid_type",
    "expected": "string",
    "received": "undefined",
    "path": ["JWT_SECRET"],
    "message": "Required"
  }
]
```

### Invalid Variable Types

```bash
# If PORT is not a number
❌ Invalid environment variables:
[
  {
    "code": "invalid_type",
    "expected": "number",
    "received": "string",
    "path": ["PORT"],
    "message": "Expected number, received string"
  }
]
```

## Migration from `process.env`

If you're migrating from direct `process.env` usage:

```typescript
// Before
const port = parseInt(process.env.PORT || '3000');
const jwtSecret = process.env.JWT_SECRET || 'fallback';

// After
import { env } from '@/config/env.js';
const port = env.PORT; // Already parsed as number
const jwtSecret = env.JWT_SECRET; // Validated and required
```

## Testing with Environment Variables

```typescript
// In tests, you can override environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-32-characters-long-for-testing';

// Then import the config (it will re-validate)
import { env } from '@/config/env.js';
```

This environment configuration system provides type safety, validation, and
clear documentation of all configuration options used throughout the
application.
