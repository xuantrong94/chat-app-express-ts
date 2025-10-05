# Infrastructure Setup Roadmap 🏗️

## For New Joiners: Core Infrastructure Files Setup Guide

This roadmap focuses on setting up the foundational infrastructure files that
must be configured **before** implementing business logic (models, routes,
controllers). Follow this sequence to build a solid foundation for your chat app
backend.

## 🎯 Setup Philosophy

The infrastructure files create the foundation that your business logic will run
on. Think of them as the "plumbing" of your application:

1. **Configuration Layer** - Environment and logging setup
2. **Server Infrastructure** - Express app and server setup
3. **Middleware Layer** - Error handling, validation, security
4. **Utility Layer** - Helper functions and error classes

## 📋 Infrastructure Files Priority Order

| Priority | File                              | Purpose                              | Dependencies           |
| -------- | --------------------------------- | ------------------------------------ | ---------------------- |
| 1        | `src/config/env.ts`               | Environment validation & type safety | None                   |
| 2        | `src/config/logger.ts`            | Centralized logging configuration    | env.ts                 |
| 3        | `src/config/database.ts`          | Database connection setup            | env.ts, logger.ts      |
| 4        | `src/utils/AppError.ts`           | Custom error class definition        | None                   |
| 5        | `src/middlewares/errorHandler.ts` | Global error handling middleware     | AppError.ts, logger.ts |
| 6        | `src/middlewares/asyncHandler.ts` | Async function wrapper               | errorHandler.ts        |
| 7        | `src/middlewares/validation.ts`   | Request validation middleware        | asyncHandler.ts        |
| 8        | `src/middlewares/rateLimiter.ts`  | Rate limiting protection             | env.ts                 |
| 9        | `src/utils/responseBuilder.ts`    | Standardized API responses           | None                   |
| 10       | `src/utils/cookieHelper.ts`       | Cookie management utilities          | env.ts                 |
| 11       | `src/app.ts`                      | Express application setup            | All middleware         |
| 12       | `src/server.ts`                   | Server startup and lifecycle         | app.ts, database.ts    |

## 🔧 Step-by-Step Infrastructure Setup

### Phase 1: Core Configuration (Files 1-3)

#### 1.1 Environment Configuration (`src/config/env.ts`)

**Purpose**: Type-safe environment variable validation **Why First**: Everything
else depends on environment configuration

```typescript
// Key features to understand:
- Zod schema validation for type safety
- Environment-specific defaults
- Required vs optional variables
- Runtime validation on startup
```

**Setup Tasks**:

- [ ] Review the Zod schema structure
- [ ] Understand environment variable types
- [ ] Verify all required variables are defined
- [ ] Test with different NODE_ENV values

#### 1.2 Logger Configuration (`src/config/logger.ts`)

**Purpose**: Centralized logging with Winston **Why Second**: Error handling and
debugging need logging

```typescript
// Key features to understand:
- Different log levels (error, warn, info, debug)
- File and console transports
- Environment-specific log formatting
- Structured logging for production
```

**Setup Tasks**:

- [ ] Configure log levels for each environment
- [ ] Set up log file rotation
- [ ] Test logging output in development
- [ ] Verify log format meets requirements

#### 1.3 Database Configuration (`src/config/database.ts`)

**Purpose**: MongoDB connection with Mongoose **Why Third**: Models and data
operations depend on this

```typescript
// Key features to understand:
- Connection string validation
- Connection retry logic
- Environment-specific database names
- Connection event handling
```

**Setup Tasks**:

- [ ] Verify MongoDB connection string
- [ ] Test connection in different environments
- [ ] Configure connection pooling
- [ ] Set up connection monitoring

### Phase 2: Error Handling Foundation (Files 4-6)

#### 2.1 Custom Error Class (`src/utils/AppError.ts`)

**Purpose**: Standardized error handling across the application **Why First in
Phase**: Foundation for all error handling

```typescript
// Key features to understand:
- Extends native Error class
- HTTP status code integration
- Operational vs programming errors
- Stack trace preservation
```

**Setup Tasks**:

- [ ] Understand error hierarchy
- [ ] Review HTTP status code mapping
- [ ] Test error instantiation
- [ ] Verify serialization behavior

#### 2.2 Error Handler Middleware (`src/middlewares/errorHandler.ts`)

**Purpose**: Global error catching and response formatting **Why Second**:
Catches all errors from async handlers

```typescript
// Key features to understand:
- Global error middleware pattern
- Development vs production error responses
- Error logging integration
- HTTP status code handling
```

**Setup Tasks**:

- [ ] Configure error response format
- [ ] Set up development error details
- [ ] Test error logging
- [ ] Verify production error security

#### 2.3 Async Handler Wrapper (`src/middlewares/asyncHandler.ts`)

**Purpose**: Automatic error catching for async route handlers **Why Third**:
Eliminates try-catch boilerplate

```typescript
// Key features to understand:
- Higher-order function pattern
- Promise rejection handling
- Express next() integration
- Type safety with TypeScript
```

**Setup Tasks**:

- [ ] Understand wrapper pattern
- [ ] Test with async functions
- [ ] Verify error propagation
- [ ] Check TypeScript integration

### Phase 3: Security & Validation (Files 7-8)

#### 3.1 Validation Middleware (`src/middlewares/validation.ts`)

**Purpose**: Request validation with Zod schemas **Why First**: Input validation
is critical for security

```typescript
// Key features to understand:
- Zod schema integration
- Request body/params/query validation
- Error response formatting
- Type inference from schemas
```

**Setup Tasks**:

- [ ] Review validation patterns
- [ ] Test schema error messages
- [ ] Configure validation error format
- [ ] Verify type safety

#### 3.2 Rate Limiter (`src/middlewares/rateLimiter.ts`)

**Purpose**: API rate limiting protection **Why Second**: Security middleware
after validation

```typescript
// Key features to understand:
- Express rate limit configuration
- Environment-specific limits
- Memory vs Redis storage
- Error response customization
```

**Setup Tasks**:

- [ ] Configure rate limits per environment
- [ ] Test rate limiting behavior
- [ ] Set up custom error messages
- [ ] Consider Redis for production

### Phase 4: Utility Functions (Files 9-10)

#### 4.1 Response Builder (`src/utils/responseBuilder.ts`)

**Purpose**: Standardized API response formatting **Why First**: Consistent
response structure

```typescript
// Key features to understand:
- Success/error response patterns
- HTTP status code integration
- Data transformation
- Pagination support
```

**Setup Tasks**:

- [ ] Review response formats
- [ ] Test success responses
- [ ] Test error responses
- [ ] Verify consistency

#### 4.2 Cookie Helper (`src/utils/cookieHelper.ts`)

**Purpose**: Secure cookie management for authentication **Why Second**:
Authentication depends on this

```typescript
// Key features to understand:
- Secure cookie settings
- Environment-specific configuration
- Token storage and retrieval
- Expiration handling
```

**Setup Tasks**:

- [ ] Configure cookie security settings
- [ ] Test cookie creation/deletion
- [ ] Verify HTTPS requirements
- [ ] Test expiration behavior

### Phase 5: Application Assembly (Files 11-12)

#### 5.1 Express App Setup (`src/app.ts`)

**Purpose**: Express application configuration with all middleware **Why
First**: Assembles all components

```typescript
// Key features to understand:
- Middleware ordering importance
- CORS configuration
- Security headers
- Static file serving
```

**Setup Tasks**:

- [ ] Review middleware order
- [ ] Configure CORS settings
- [ ] Set up security headers
- [ ] Test middleware integration

#### 5.2 Server Startup (`src/server.ts`)

**Purpose**: Server lifecycle management **Why Last**: Orchestrates everything

```typescript
// Key features to understand:
- Graceful startup/shutdown
- Database connection integration
- Error handling during startup
- Process signal handling
```

**Setup Tasks**:

- [ ] Test server startup sequence
- [ ] Configure graceful shutdown
- [ ] Verify error handling
- [ ] Test process signals

## 🧪 Testing Your Infrastructure

### Phase Testing Approach

After completing each phase, test the infrastructure:

#### Phase 1 Test: Configuration

```bash
# Test environment loading
pnpm dev

# Check logs
tail -f logs/app.log

# Verify database connection
# Should see "Connected to MongoDB" in logs
```

#### Phase 2 Test: Error Handling

```bash
# Create a test route that throws an error
# Verify error is caught and logged properly
# Check error response format
```

#### Phase 3 Test: Security

```bash
# Test rate limiting
# Send multiple requests quickly
# Verify validation errors with invalid data
```

#### Phase 4 Test: Utilities

```bash
# Test response formatting
# Test cookie creation/deletion
# Verify utility function behavior
```

#### Phase 5 Test: Full Integration

```bash
# Start complete application
# Test health endpoint
# Verify all middleware works together
```

## 🚨 Common Setup Issues & Solutions

### Issue 1: Environment Variables Not Loading

**Symptoms**: undefined environment variables **Solution**:

```bash
# Verify .env file exists
ls -la .env

# Check environment loading in env.ts
# Ensure dotenv.config() is called early
```

### Issue 2: Middleware Order Problems

**Symptoms**: Unexpected behavior, errors not caught **Solution**:

- Review middleware order in app.ts
- Ensure error handler is last
- Check async handler usage

### Issue 3: Database Connection Fails

**Symptoms**: Server starts but can't connect to MongoDB **Solution**:

- Verify MONGODB_URI in .env
- Check MongoDB service status
- Review connection configuration

### Issue 4: CORS Issues

**Symptoms**: Frontend can't connect **Solution**:

- Configure CORS_ORIGIN in .env
- Set CORS_CREDENTIALS if using cookies
- Check preflight requests

## 📚 Key Concepts to Understand

### 1. Middleware Pipeline

```text
Request → Rate Limiter → CORS → Body Parser → Validation → Route Handler → Error Handler → Response
```

### 2. Error Flow

```text
Async Handler → Catches Errors → Error Handler → Logs Error → Sends Response
```

### 3. Configuration Hierarchy

```text
Environment Variables → Validation → Type Safety → Application Configuration
```

### 4. Security Layers

```text
Rate Limiting → Input Validation → Authentication → Authorization
```

## ✅ Infrastructure Completion Checklist

Before implementing business logic (models, routes, controllers):

### Configuration Layer

- [ ] Environment variables properly validated
- [ ] Logging configured and working
- [ ] Database connection established

### Error Handling

- [ ] Custom error class implemented
- [ ] Global error handler configured
- [ ] Async wrapper working

### Security & Validation

- [ ] Request validation middleware setup
- [ ] Rate limiting configured
- [ ] CORS properly configured

### Utilities

- [ ] Response builder working
- [ ] Cookie helper configured
- [ ] All utilities tested

### Application

- [ ] Express app properly configured
- [ ] Server startup/shutdown working
- [ ] All middleware integrated
- [ ] Full application tested

## 🎯 Next Steps

Once your infrastructure is solid:

1. **Models**: Define data schemas and database models
2. **Services**: Implement business logic layer
3. **Controllers**: Create request handlers
4. **Routes**: Set up API endpoints
5. **Authentication**: Implement auth middleware
6. **Testing**: Add comprehensive tests

## 📖 Related Documentation

- [Configuration Files Guide](./CONFIG_ROADMAP.md) - Environment setup
- [docs/MIDDLEWARE.md](./docs/MIDDLEWARE.md) - Middleware patterns
- [docs/TYPE_SYSTEM.md](./docs/TYPE_SYSTEM.md) - TypeScript usage
- [docs/DEVELOPER.md](./docs/DEVELOPER.md) - Development guidelines

---

**Remember**: A solid infrastructure foundation makes implementing business
logic much easier and more maintainable! 🚀
