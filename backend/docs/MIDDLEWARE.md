# Middleware Patterns

## Overview

Middlewares in this project follow a consistent pattern and provide various
functionalities including error handling, validation, authentication, and
request processing. All middlewares are designed to work seamlessly with
TypeScript for type safety.

## Middleware Architecture

### Middleware Types

1. **Global Middlewares** - Applied to all routes (security, logging, parsing)
2. **Feature Middlewares** - Specific functionality (auth, validation, rate
   limiting)
3. **Error Middlewares** - Error handling and response formatting

### Middleware Flow

```
Request → Global Middlewares → Route Middlewares → Controller → Response
                ↓
           Error Middlewares (if error occurs)
```

## Core Middlewares

### 1. Async Handler (`asyncHandler.ts`)

Handles async functions and catches errors automatically.

**Basic Async Handler:**

```typescript
export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
      logger.error('AsyncHandler caught an error:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
      });
      next(error);
    });
  };
};
```

**Typed Async Handler:**

```typescript
export const typedAsyncHandler = <
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
>(
  fn: TypedAsyncFunction<TParams, TBody, TQuery>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as TypedRequest<TParams, TBody, TQuery>;
    Promise.resolve(fn(typedReq, res, next)).catch(error => {
      logger.error('TypedAsyncHandler caught error:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        params: typedReq.params,
        body: typedReq.body,
        query: typedReq.query,
        timestamp: new Date().toISOString(),
      });
      next(error);
    });
  };
};
```

**Usage in Controllers:**

```typescript
import { asyncHandler, typedAsyncHandler } from '@/middlewares/asyncHandler';

// Basic usage
export const getUsers = asyncHandler(async (req, res) => {
  const users = await UserService.getAllUsers();
  ResponseBuilder.success(res, users);
});

// Typed usage with request validation
export const createUser = typedAsyncHandler<
  Record<string, string>, // Params
  ICreateUserRequest, // Body
  Record<string, string> // Query
>(async (req, res) => {
  const userData = req.body; // Fully typed as ICreateUserRequest
  const user = await UserService.createUser(userData);
  ResponseBuilder.created(res, user);
});
```

### 2. Validation Middleware (`validation.ts`)

Uses Zod schemas for request validation.

**Validation Function:**

```typescript
export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        const errors = result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = errors
          .map(err => `${err.field}: ${err.message}`)
          .join('; ');

        throw new AppError(
          `Validation error: ${errorMessage}`,
          400,
          ErrorType.VALIDATION_ERROR
        );
      }

      // Update request with validated data
      if (
        result.data &&
        typeof result.data === 'object' &&
        'body' in result.data
      ) {
        req.body = result.data.body;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
```

**Usage with Zod Schemas:**

```typescript
// In validators/auth.validator.ts
export const signupValidationSchema = z.object({
  body: z
    .object({
      email: z.string().email().toLowerCase().trim(),
      fullName: z.string().min(2).max(50).trim(),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
      confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
});

export const validateSignup = validate(signupValidationSchema);

// In routes
router.post('/signup', validateSignup, signup);
```

### 3. Error Handler (`errorHandler.ts`)

Centralized error handling with different error type handling.

**Error Conversion:**

```typescript
const convertToAppError = (error: any): AppError => {
  // MongoDB duplicate key error
  if (error.code === 11000) {
    return handleDuplicateKeyError(error);
  }

  // Mongoose validation error
  if (error instanceof MongooseError.ValidationError) {
    return handleValidationError(error);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return AppError.unauthorized('Invalid token');
  }

  if (error instanceof AppError) {
    return error;
  }

  return AppError.internal('Something went wrong!');
};
```

**Global Error Handler:**

```typescript
export const globalErrorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const appError = convertToAppError(error);

  // Log error
  logger.error('Global error handler:', {
    error: appError.message,
    stack: appError.stack,
    statusCode: appError.statusCode,
    path: req.path,
    method: req.method,
  });

  // Send appropriate response
  if (isDevelopment()) {
    sendErrorDev(appError, req, res);
  } else {
    sendErrorProd(appError, req, res);
  }
};
```

## Creating Custom Middlewares

### 1. Authentication Middleware

```typescript
// middlewares/auth.ts
import jwt from 'jsonwebtoken';
import { AppError } from '@/utils/AppError';
import { asyncHandler } from './asyncHandler';

export const requireAuth = asyncHandler(async (req, res, next) => {
  // 1. Get token from header
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

  if (!token) {
    throw AppError.unauthorized('Access token required');
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // 3. Get user from database
    const user = await UserService.findById(decoded.id);
    if (!user) {
      throw AppError.unauthorized('User no longer exists');
    }

    // 4. Attach user to request
    req.user = user;
    next();
  } catch (error) {
    throw AppError.unauthorized('Invalid token');
  }
});

// Optional authentication (doesn't throw if no token)
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      const user = await UserService.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Ignore token errors for optional auth
    }
  }

  next();
});
```

### 2. Role-Based Authorization

```typescript
// middlewares/authorize.ts
import { AppError } from '@/utils/AppError';
import { asyncHandler } from './asyncHandler';

export const authorize = (...roles: string[]) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw AppError.unauthorized('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden(
        `Role ${req.user.role} is not authorized to access this resource`
      );
    }

    next();
  });
};

// Usage in routes
router.delete('/users/:id', requireAuth, authorize('admin'), deleteUser);
```

### 3. Request Logging Middleware

```typescript
// middlewares/requestLogger.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '@/config/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Generate unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;
  res.locals.requestId = requestId;

  // Log request
  logger.info('Incoming request', {
    requestId,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
  });

  // Log response
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  });

  next();
};
```

### 4. Rate Limiting Middleware

```typescript
// middlewares/rateLimiter.ts
import rateLimit from 'express-rate-limit';
import { ErrorType } from '@/shared/types/error.types';

export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      success: false,
      error: {
        type: ErrorType.RATE_LIMIT_ERROR,
        message: options.message || 'Too many requests, please try again later',
        statusCode: 429,
        timestamp: new Date().toISOString(),
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
  });
};

// Specific rate limiters
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many login attempts, please try again later',
});

export const apiRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});
```

## Middleware Composition Patterns

### 1. Combining Middlewares

```typescript
// Create middleware stack for protected routes
const protectedRoute = [
  requireAuth,
  authorize('user', 'admin'),
  validate(updateUserSchema),
];

// Use in routes
router.put('/profile', ...protectedRoute, updateProfile);

// Or create specific middleware combinations
export const adminOnly = [requireAuth, authorize('admin')];
export const userOrAdmin = [requireAuth, authorize('user', 'admin')];
```

### 2. Conditional Middlewares

```typescript
// Apply middleware conditionally
export const conditionalAuth = (condition: boolean) => {
  return condition ? requireAuth : optionalAuth;
};

// Apply different validation based on route
export const dynamicValidation = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'POST') {
      return validate(schema)(req, res, next);
    }
    next();
  };
};
```

### 3. Middleware Factories

```typescript
// Create reusable middleware factories
export const createOwnershipCheck = (resourceService: any) => {
  return asyncHandler(async (req, res, next) => {
    const resource = await resourceService.findById(req.params.id);

    if (!resource) {
      throw AppError.notFound('Resource not found');
    }

    if (resource.userId !== req.user.id && req.user.role !== 'admin') {
      throw AppError.forbidden('Access denied');
    }

    req.resource = resource;
    next();
  });
};

// Usage
const checkMessageOwnership = createOwnershipCheck(MessageService);
router.delete(
  '/messages/:id',
  requireAuth,
  checkMessageOwnership,
  deleteMessage
);
```

## Best Practices

### 1. Error Handling

- Always use `asyncHandler` or `typedAsyncHandler` for async middlewares
- Throw `AppError` instances for consistent error handling
- Log errors with appropriate context

### 2. Type Safety

- Use `typedAsyncHandler` when you need type safety for request parameters
- Define proper interfaces for middleware-specific request extensions
- Use generics for reusable middleware patterns

### 3. Performance

- Keep middlewares lightweight
- Use caching for expensive operations
- Consider middleware order for optimal performance

### 4. Testing

- Write unit tests for complex middlewares
- Test error scenarios
- Mock dependencies appropriately

### 5. Documentation

- Document middleware purpose and usage
- Provide examples for complex middlewares
- Explain any side effects or request modifications

This middleware system provides a robust foundation for handling various
cross-cutting concerns while maintaining type safety and consistency across the
application.
