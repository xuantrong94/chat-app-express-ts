# Type System Guide

## Overview

This project uses TypeScript with a comprehensive type system that ensures type
safety across all layers of the application. Types are organized by feature and
purpose, making them easy to find and maintain.

## Type Organization

### File Structure

```
src/shared/types/
├── index.ts           # Main exports for all types
├── api.types.ts       # API-specific types
├── auth.types.ts      # Authentication types
├── error.types.ts     # Error handling types
├── handler.types.ts   # Request handler types
├── response.types.ts  # API response types
└── user.types.ts      # User-related types
```

### Import Strategy

Always import types from the main index file for consistency:

```typescript
// ✅ Good - Import from main index
import { IUser, ISignupRequest, TypedRequest } from '@/shared/types';

// ❌ Avoid - Direct file imports
import { IUser } from '@/shared/types/user.types';
```

## Core Type Categories

### 1. Request Handler Types (`handler.types.ts`)

These types provide type safety for Express.js request handlers:

```typescript
// Base authenticated user interface
export interface AuthenticatedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

// Generic async function type
export type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Custom typed request interface
export interface TypedRequest<
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
> extends Omit<Request, 'params' | 'body' | 'query'> {
  params: TParams;
  body: TBody;
  query: TQuery;
  user?: AuthenticatedUser; // For authenticated routes
}

// Typed async function for route handlers
export type TypedAsyncFunction<
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
> = (
  req: TypedRequest<TParams, TBody, TQuery>,
  res: Response,
  next: NextFunction
) => Promise<void>;
```

**Usage in Controllers:**

```typescript
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { ISignupRequest } from '@/shared/types';

// Type the request body for signup
export const signup = typedAsyncHandler<
  Record<string, string>, // Params type
  ISignupRequest, // Body type
  Record<string, string> // Query type
>(async (req, res) => {
  // req.body is now typed as ISignupRequest
  const { email, fullName, password } = req.body;
  // TypeScript will provide autocomplete and type checking
});
```

### 2. User Types (`user.types.ts`)

User-related interfaces for different operations:

```typescript
// Base user interface
export interface IUser {
  email: string;
  fullName: string;
  password: string;
  avatarUrl?: string;
}

// Request types for different operations
export interface ISignupRequest {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
  avatarUrl?: string;
}

export interface ISigninRequest {
  email: string;
  password: string;
}

export interface IUpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
}

// Response types
export interface IAuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    avatarUrl?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

### 3. Response Types (`response.types.ts`)

Standardized API response structures:

```typescript
// Generic API response
export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: ErrorDetail;
  metadata?: ResponseMetadata;
}

// Error details
export interface ErrorDetail {
  code: string;
  details?: any;
  stack?: string;
}

// Response metadata
export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  page?: number;
  limit?: number;
  total?: number;
}

// Paginated responses
export interface PaginationResponse<T> extends IApiResponse<T> {
  metadata: ResponseMetadata & {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

### 4. Error Types (`error.types.ts`)

Error handling and classification:

```typescript
export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST_ERROR = 'BAD_REQUEST_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
}

export interface IErrorResponse {
  success: false;
  error: {
    type: ErrorType;
    message: string;
    statusCode: number;
    timestamp: string;
    details?: any;
    stack?: string;
  };
}
```

## Type Creation Guidelines

### 1. Request/Response Pairs

For each API endpoint, create corresponding request and response types:

```typescript
// For a user profile update endpoint
export interface IUpdateUserRequest {
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface IUpdateUserResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  updatedAt: string;
}
```

### 2. Database Model Types

Create separate interfaces for database models and API responses:

```typescript
// Database model (includes internal fields)
export interface IUserDocument {
  _id: string;
  email: string;
  fullName: string;
  password: string; // Never expose in API responses
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

// API response (cleaned up, no sensitive data)
export interface IUserResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}
```

### 3. Generic Types

Use generics for reusable patterns:

```typescript
// Generic list response
export interface ListResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Usage
export type UserListResponse = ListResponse<IUserResponse>;
export type MessageListResponse = ListResponse<IMessageResponse>;
```

## Best Practices

### 1. Naming Conventions

- **Interfaces**: Start with `I` prefix (e.g., `IUser`, `IApiResponse`)
- **Types**: Use descriptive names (e.g., `AsyncFunction`, `TypedRequest`)
- **Enums**: Use SCREAMING_SNAKE_CASE for values
- **Request types**: End with `Request` (e.g., `ISignupRequest`)
- **Response types**: End with `Response` (e.g., `IAuthResponse`)

### 2. Type Safety in Controllers

Always use typed handlers for type safety:

```typescript
// ✅ Good - Typed handler
export const createUser = typedAsyncHandler<
  { userId: string }, // URL params
  ICreateUserRequest, // Request body
  { include?: string } // Query params
>(async (req, res) => {
  const { userId } = req.params; // Typed as string
  const { email, fullName } = req.body; // Typed as ICreateUserRequest
  const { include } = req.query; // Typed as string | undefined
});

// ❌ Avoid - Untyped handler
export const createUser = asyncHandler(async (req, res) => {
  const { userId } = req.params; // Type: any
  const { email, fullName } = req.body; // Type: any
});
```

### 3. Optional vs Required Fields

Be explicit about optional fields:

```typescript
// ✅ Good - Clear optional fields
export interface IUpdateUserRequest {
  fullName?: string; // Optional
  email: string; // Required
  avatarUrl?: string; // Optional
}

// ✅ Good - Use utility types for variations
export interface IUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export type ICreateUserRequest = Omit<IUser, 'id'>;
export type IUpdateUserRequest = Partial<Omit<IUser, 'id' | 'email'>>;
```

### 4. Type Guards

Create type guards for runtime type checking:

```typescript
export function isAuthenticatedUser(user: any): user is AuthenticatedUser {
  return user && typeof user.id === 'string' && typeof user.email === 'string';
}

// Usage in middleware
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isAuthenticatedUser(req.user)) {
    return ResponseBuilder.unauthorized(res, 'Invalid user session');
  }
  next();
};
```

### 5. Extending Types

Use inheritance and composition appropriately:

```typescript
// Base entity
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// Extend base entity
export interface IUser extends BaseEntity {
  email: string;
  fullName: string;
  avatarUrl?: string;
}

// Compose with additional fields
export interface IUserWithStats extends IUser {
  stats: {
    messageCount: number;
    lastSeen: string;
  };
}
```

## Adding New Types

### 1. For New Features

When adding a new feature (e.g., messaging):

1. Create `message.types.ts` in `src/shared/types/`
2. Define all related interfaces
3. Export from `src/shared/types/index.ts`
4. Use in controllers, services, and validators

```typescript
// src/shared/types/message.types.ts
export interface IMessage {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
}

export interface ISendMessageRequest {
  receiverId: string;
  content: string;
}

export interface IMessageResponse extends IMessage {
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
}

// src/shared/types/index.ts
export * from './message.types';
```

### 2. For Database Models

Keep database types separate from API types:

```typescript
// Database document (internal)
export interface IMessageDocument {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  readAt?: Date;
}

// API response (external)
export interface IMessageResponse {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  timestamp: string;
  isRead: boolean;
  sender?: IUserResponse;
  receiver?: IUserResponse;
}
```

This type system ensures type safety across the entire application while
maintaining flexibility and readability.
