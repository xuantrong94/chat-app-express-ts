# Quick Start Guide

## Welcome to the Chat App Backend! 🚀

This guide will help you get up and running quickly as a new developer on this
project. Follow these steps to understand the codebase and start contributing
effectively.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **pnpm** package manager
- **MongoDB** (local or cloud instance)
- **Git** for version control
- **VS Code** (recommended) with TypeScript extension

## Getting Started

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd chat-app/backend

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env  # or use your preferred editor
```

### 2. Environment Configuration

Update your `.env` file with the following:

```env
# Database
DATABASE_URL=mongodb://localhost:27017/chat-app
# or for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/chat-app

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3000

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Logging
LOG_LEVEL=debug
```

### 3. Start Development

```bash
# Start the development server
pnpm dev

# The server will start on http://localhost:3000
# Hot reload is enabled - changes will automatically restart the server
```

### 4. Verify Setup

Test that everything is working:

```bash
# Check server health
curl http://localhost:3000/health

# You should see a response like:
# {"success": true, "message": "Server is running!", "data": {...}}
```

## Project Structure Overview

Here's what you need to know about the main directories:

```
src/
├── app.ts              # 🚀 Express app setup with middlewares
├── server.ts           # 🌐 Server entry point
├── config/             # ⚙️  Configuration (database, env, logger)
├── controllers/        # 🎮 HTTP request handlers
├── middlewares/        # 🔄 Express middlewares (auth, validation, errors)
├── models/            # 🗄️  Database models (Mongoose)
├── routes/            # 🛣️  API route definitions
├── services/          # 🏢 Business logic layer
├── shared/            # 🤝 Shared utilities and types
│   ├── types/         # 📝 TypeScript type definitions
│   ├── constants/     # 📊 Application constants
│   └── enums/         # 🏷️  Enumeration definitions
├── utils/             # 🛠️  Utility functions
└── validators/        # ✅ Input validation schemas (Zod)
```

## Development Workflow

### Adding a New Feature

Here's the typical flow for adding a new feature (e.g., "Comments"):

#### 1. Define Types First

```typescript
// src/shared/types/comment.types.ts
export interface IComment {
  id: string;
  content: string;
  authorId: string;
  messageId: string;
  createdAt: string;
}

export interface ICreateCommentRequest {
  content: string;
  messageId: string;
}

export interface ICommentResponse extends IComment {
  author: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

// Export from main types index
// src/shared/types/index.ts
export * from './comment.types';
```

#### 2. Create Database Model

```typescript
// src/models/comment.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ICommentDocument extends Document {
  content: string;
  authorId: mongoose.Types.ObjectId;
  messageId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const commentSchema = new Schema<ICommentDocument>(
  {
    content: { type: String, required: true, trim: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    messageId: { type: Schema.Types.ObjectId, ref: 'Message', required: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Comment = mongoose.model<ICommentDocument>(
  'Comment',
  commentSchema
);
```

#### 3. Create Validation Schema

```typescript
// src/validators/comment.validator.ts
import { z } from 'zod';
import { validate } from '@/middlewares/validation';

export const createCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(500).trim(),
    messageId: z.string().min(1),
  }),
});

export const validateCreateComment = validate(createCommentSchema);
```

#### 4. Create Service

```typescript
// src/services/comment.service.ts
import { Comment, ICommentDocument } from '@/models/comment.model';
import { ICreateCommentRequest, ICommentResponse } from '@/shared/types';
import { AppError } from '@/utils/AppError';
import UserService from './user.service';

class CommentService {
  async createComment(
    authorId: string,
    commentData: ICreateCommentRequest
  ): Promise<ICommentResponse> {
    // Validate author exists
    await UserService.validateUserExists(authorId);

    const comment = await Comment.create({
      ...commentData,
      authorId,
    });

    return this.transformToResponse(comment);
  }

  private transformToResponse(comment: ICommentDocument): ICommentResponse {
    return {
      id: comment._id.toString(),
      content: comment.content,
      authorId: comment.authorId.toString(),
      messageId: comment.messageId.toString(),
      createdAt: comment.createdAt.toISOString(),
    };
  }
}

export default new CommentService();
```

#### 5. Create Controller

```typescript
// src/controllers/comment.controller.ts
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { ICreateCommentRequest } from '@/shared/types';
import CommentService from '@/services/comment.service';
import ResponseBuilder from '@/utils/responseBuilder';

export const createComment = typedAsyncHandler<
  Record<string, string>,
  ICreateCommentRequest,
  Record<string, string>
>(async (req, res) => {
  const authorId = req.user!.id;
  const commentData = req.body;

  const comment = await CommentService.createComment(authorId, commentData);

  ResponseBuilder.created(res, comment, 'Comment created successfully');
});
```

#### 6. Create Routes

```typescript
// src/routes/comment.router.ts
import { Router } from 'express';
import { createComment } from '@/controllers/comment.controller';
import { validateCreateComment } from '@/validators/comment.validator';
import { requireAuth } from '@/middlewares/auth'; // You'll need to create this

const router = Router();

router.post('/', requireAuth, validateCreateComment, createComment);

export default router;
```

#### 7. Register Routes

```typescript
// src/routes/index.ts
import commentRouter from './comment.router';

// Add to your route registration
app.use('/api/comments', commentRouter);
```

### Key Patterns to Follow

#### 1. Type Safety

- Always use `typedAsyncHandler` for controllers
- Define interfaces for all request/response types
- Import types from the main index file

#### 2. Error Handling

- Use `AppError` for business logic errors
- Let middleware handle error responses
- Log errors with appropriate context

#### 3. Validation

- Create Zod schemas for all input validation
- Use validation middleware in routes
- Validate business rules in services

#### 4. Response Format

- Always use `ResponseBuilder` for responses
- Provide meaningful success messages
- Follow consistent data structures

## Common Tasks

### 1. Adding Authentication to Routes

```typescript
// First, create auth middleware (if not exists)
// src/middlewares/auth.ts
export const requireAuth = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw AppError.unauthorized('Authentication required');
  }

  const decoded = jwt.verify(token, env.JWT_SECRET) as any;
  req.user = await UserService.findById(decoded.id);
  next();
});

// Use in routes
router.post('/protected-endpoint', requireAuth, controller);
```

### 2. Adding Pagination

```typescript
// In controller
export const getPaginatedItems = typedAsyncHandler<
  Record<string, string>,
  Record<string, unknown>,
  { page?: string; limit?: string }
>(async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');

  const result = await SomeService.getPaginated({ page, limit });

  ResponseBuilder.paginated(res, result.data, {
    page,
    limit,
    total: result.total,
    totalPages: Math.ceil(result.total / limit),
  });
});
```

### 3. Adding File Upload

```typescript
// Install multer: pnpm add multer @types/multer

// Create upload middleware
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

// Use in route
router.post('/upload', requireAuth, upload.single('file'), uploadController);
```

## Available Scripts

```bash
# Development
pnpm dev              # Start development server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues automatically
pnpm format           # Format code with Prettier
pnpm format:check     # Check if code is properly formatted
pnpm type-check       # Run TypeScript type checking

# Database
# You'll need to create these scripts as needed
pnpm db:migrate       # Run database migrations
pnpm db:seed          # Seed database with test data
```

## Debugging Tips

### 1. Using the Logger

```typescript
import logger from '@/config/logger';

// Different log levels
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error occurred', { error: error.message });
```

### 2. VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Server",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/server.ts",
      "runtimeArgs": ["-r", "tsx/cjs"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal"
    }
  ]
}
```

### 3. Testing API Endpoints

Use tools like:

- **Thunder Client** (VS Code extension)
- **Postman**
- **curl** commands

Example curl commands:

```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "fullName": "Test User",
    "password": "Test123!",
    "confirmPassword": "Test123!"
  }'

# Test login
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

## Next Steps

1. **Read the Documentation**: Go through the detailed docs:
   - [Type System Guide](./TYPE_SYSTEM.md)
   - [Middleware Patterns](./MIDDLEWARE.md)
   - [Controller Patterns](./CONTROLLERS.md)
   - [Service Layer](./SERVICES.md)

2. **Explore the Codebase**: Look at existing implementations to understand
   patterns

3. **Start Small**: Begin with simple features like adding new API endpoints

4. **Ask Questions**: Don't hesitate to ask team members for clarification

5. **Follow Conventions**: Maintain consistency with existing code patterns

## Getting Help

- **Code Documentation**: Check the `docs/` folder for detailed guides
- **Type Definitions**: Look in `src/shared/types/` for available interfaces
- **Examples**: Study existing controllers, services, and models
- **Logs**: Check the console output and log files for debugging information

Welcome to the team! Happy coding! 🎉
