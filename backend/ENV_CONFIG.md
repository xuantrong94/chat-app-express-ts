# Environment Configuration Guide

This project uses environment variables for configuration. Multiple environment
files are provided for different deployment scenarios.

## Environment Files

### `.env` (Development)

Default environment file for local development. Contains development-friendly
settings and insecure placeholder secrets.

### `.env.example` (Template)

Template file showing all available environment variables. Copy this to create
your own `.env` file.

### `.env.production` (Production)

Production environment template with security considerations. **Replace all
placeholder secrets with secure values!**

### `.env.test` (Testing)

Configuration for running tests with isolated database and optimized settings.

## Environment Variables

### Application Settings

- `NODE_ENV`: Environment mode (`development`, `production`, `test`)
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: localhost)

### Database

- `MONGODB_URI`: MongoDB connection string

### JWT Authentication

- `JWT_SECRET`: Secret for signing JWT tokens (min 32 characters)
- `JWT_EXPIRES_IN`: JWT token expiration time (e.g., "24h", "7d")
- `JWT_REFRESH_SECRET`: Secret for refresh tokens (min 32 characters)
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiration time

### CORS

- `CORS_ORIGIN`: Allowed frontend origin(s)
- `CORS_CREDENTIALS`: Allow credentials in CORS requests

### Rate Limiting

- `RATE_LIMIT_WINDOW_MS`: Time window for rate limiting (milliseconds)
- `RATE_LIMIT_MAX_REQUESTS`: Max requests per window

### Logging

- `LOG_LEVEL`: Logging level (`error`, `warn`, `info`, `debug`, etc.)
- `LOG_FILE`: Log file path

### Security

- `BCRYPT_ROUNDS`: Number of bcrypt hashing rounds
- `SESSION_SECRET`: Secret for session signing (min 32 characters)

## Setup Instructions

1. **Development Setup:**

   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

2. **Production Setup:**

   ```bash
   cp .env.production .env
   # Replace all REPLACE_WITH_SECURE_* values with secure secrets
   ```

3. **Generate Secure Secrets:**
   ```bash
   # Generate 32-character base64 secrets
   openssl rand -base64 32
   ```

## Security Notes

- ⚠️ Never commit `.env` files to version control
- ⚠️ Use strong, unique secrets in production
- ⚠️ Rotate secrets regularly
- ⚠️ Use environment-specific databases
- ⚠️ Set appropriate CORS origins for production

## Default Values

The application provides sensible defaults for most settings. Required variables
that must be set:

- `JWT_SECRET` (production)
- `JWT_REFRESH_SECRET` (production)
- `SESSION_SECRET` (production)
- `MONGODB_URI` (if not using default local MongoDB)
