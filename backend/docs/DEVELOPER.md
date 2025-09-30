# Developer Documentation

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Patterns](#development-patterns)
- [Type System](#type-system)
- [Middleware System](#middleware-system)
- [Controllers](#controllers)
- [Services](#services)
- [Routing](#routing)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Response Building](#response-building)
- [Configuration](#configuration)
- [Best Practices](#best-practices)

## Project Overview

This is a Node.js/Express.js backend application for a chat app built with
TypeScript. The project follows a layered architecture pattern with clear
separation of concerns and strong type safety.

### Tech Stack

- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Zod
- **Authentication**: JWT
- **Logging**: Winston
- **Testing**: (To be added)
- **Package Manager**: pnpm

### Key Features

- Type-safe request handling
- Comprehensive error handling
- Rate limiting and security middlewares
- Structured logging
- Input validation with Zod
- Standardized API responses

## Architecture

The application follows a **Layered Architecture** pattern:

```
┌─────────────────┐
│   Controllers   │ ← HTTP Request/Response handling
├─────────────────┤
│    Services     │ ← Business logic
├─────────────────┤
│     Models      │ ← Data layer (Mongoose)
├─────────────────┤
│    Database     │ ← MongoDB
└─────────────────┘
```

**Request Flow:**

1. **Router** → routes requests to appropriate controller
2. **Middleware** → validates, authenticates, rate limits
3. **Controller** → handles HTTP logic, calls services
4. **Service** → implements business logic, interacts with models
5. **Model** → data persistence layer
6. **Response** → standardized response format

## Project Structure

```
src/
├── app.ts                    # Express app configuration
├── server.ts                 # Server entry point
├── config/                   # Configuration modules
│   ├── database.ts          # MongoDB connection
│   ├── env.ts               # Environment variables
│   ├── index.ts             # Config exports
│   └── logger.ts            # Winston logger setup
├── controllers/             # HTTP request handlers
│   ├── auth.controller.ts   # Authentication endpoints
│   ├── user.controller.ts   # User management endpoints
│   └── index.ts             # Controller exports
├── middlewares/             # Express middlewares
│   ├── asyncHandler.ts      # Async error handling
│   ├── errorHandler.ts      # Global error handling
│   ├── rateLimiter.ts       # Rate limiting
│   └── validation.ts        # Request validation
├── models/                  # Mongoose models
│   ├── user.model.ts        # User data model
│   └── index.ts             # Model exports
├── routes/                  # Express routers
│   ├── auth.router.ts       # Auth routes
│   ├── message.router.ts    # Message routes
│   └── index.ts             # Route exports
├── services/                # Business logic
│   ├── auth.service.ts      # Authentication logic
│   ├── user.service.ts      # User management logic
│   └── index.ts             # Service exports
├── shared/                  # Shared utilities
│   ├── constants/           # Application constants
│   ├── enums/               # TypeScript enums
│   └── types/               # TypeScript type definitions
│       ├── api.types.ts     # API response types
│       ├── auth.types.ts    # Authentication types
│       ├── error.types.ts   # Error handling types
│       ├── handler.types.ts # Request handler types
│       ├── response.types.ts # Response types
│       ├── user.types.ts    # User-related types
│       └── index.ts         # Type exports
├── utils/                   # Utility functions
│   ├── AppError.ts          # Custom error class
│   ├── responseBuilder.ts   # Standardized responses
│   └── index.ts             # Utility exports
└── validators/              # Zod validation schemas
    └── auth.validator.ts    # Authentication validation
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- MongoDB

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Update environment variables
# Edit .env with your database URL and other settings

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server with hot reload
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
pnpm format       # Format code with Prettier
pnpm type-check   # TypeScript type checking
```

## Development Patterns

### File Naming Conventions

- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **Models**: `*.model.ts`
- **Routes**: `*.router.ts`
- **Validators**: `*.validator.ts`
- **Types**: `*.types.ts`
- **Middlewares**: camelCase (e.g., `asyncHandler.ts`)

### Import Conventions

- Use absolute imports with `@/` prefix
- Import from index files when possible
- Group imports: external → internal → relative

```typescript
// External imports
import express from 'express';
import { z } from 'zod';

// Internal imports
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { IUserResponse } from '@/shared/types';

// Relative imports (if needed)
import './local-file';
```

### Folder Organization

- Each major feature should have its own controller, service, and validator
- Shared types go in `src/shared/types/`
- Utilities that are reusable across features go in `src/utils/`
- Feature-specific utilities can go in the feature folder

## Next Sections

Continue reading:

- [Type System Guide](./TYPE_SYSTEM.md)
- [Middleware Patterns](./MIDDLEWARE.md)
- [Controller Patterns](./CONTROLLERS.md)
- [Service Layer](./SERVICES.md)
- [API Standards](./API_STANDARDS.md)
