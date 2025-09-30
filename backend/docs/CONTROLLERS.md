# Controller Patterns

## Overview

Controllers in this project handle HTTP request/response logic and act as the
interface between the web layer and business logic. They follow RESTful
conventions and use standardized response patterns.

## Controller Architecture

### Responsibilities

1. **HTTP Handling** - Process incoming requests and send responses
2. **Input Validation** - Ensure request data is valid (via middleware)
3. **Service Orchestration** - Call appropriate services for business logic
4. **Response Formatting** - Use ResponseBuilder for consistent responses
5. **Error Propagation** - Let middleware handle errors

### Controller Flow

```
HTTP Request → Middleware → Controller → Service Layer → Database
                                ↓
HTTP Response ← ResponseBuilder ← Controller ← Service Result
```

## Base Controller Pattern

### 1. Controller Structure

Every controller follows this basic structure:

```typescript
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { IRequestType, IResponseType } from '@/shared/types';
import { SomeService } from '@/services';
import ResponseBuilder from '@/utils/responseBuilder';

// Type-safe controller function
export const controllerFunction = typedAsyncHandler<
  ParamsType, // URL parameters type
  BodyType, // Request body type
  QueryType // Query parameters type
>(async (req, res) => {
  // 1. Extract data from request
  const { param1 } = req.params;
  const { field1, field2 } = req.body;
  const { filter } = req.query;

  // 2. Call service layer
  const result = await SomeService.performOperation({
    param1,
    field1,
    field2,
    filter,
  });

  // 3. Send response
  ResponseBuilder.success(res, result, 'Operation successful');
});
```

### 2. Current Implementation Example

From `auth.controller.ts`:

```typescript
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { ISignupRequest, ISigninRequest } from '@/shared/types/user.types';
import ResponseBuilder from '@/utils/responseBuilder';

export const signin = typedAsyncHandler<
  Record<string, string>, // No URL params
  ISigninRequest, // Body type
  Record<string, string> // No query params
>(async (req, res) => {
  // Debug log
  console.log('Request body:', req.body);
  ResponseBuilder.success(res, null, 'Sign-in successful');
});

export const signup = typedAsyncHandler<
  Record<string, string>,
  ISignupRequest,
  Record<string, string>
>(async (req, res) => {
  const { email, fullName, avatarUrl } = req.body;

  const validatedData = {
    email,
    fullName,
    avatarUrl,
  };

  ResponseBuilder.created(res, validatedData, 'Sign-up successful');
});
```

## Creating New Controllers

### 1. Standard CRUD Controller

Here's a complete example for a User controller:

```typescript
// src/controllers/user.controller.ts
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import {
  ICreateUserRequest,
  IUpdateUserRequest,
  IUserResponse,
} from '@/shared/types';
import { UserService } from '@/services';
import ResponseBuilder from '@/utils/responseBuilder';

// GET /users - List all users
export const getUsers = typedAsyncHandler<
  Record<string, string>,
  Record<string, unknown>,
  { page?: string; limit?: string; search?: string }
>(async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const search = req.query.search;

  const result = await UserService.getUsers({
    page,
    limit,
    search,
  });

  ResponseBuilder.success(res, result, 'Users retrieved successfully');
});

// GET /users/:id - Get user by ID
export const getUserById = typedAsyncHandler<
  { id: string },
  Record<string, unknown>,
  Record<string, string>
>(async (req, res) => {
  const { id } = req.params;

  const user = await UserService.findById(id);

  if (!user) {
    return ResponseBuilder.notFound(res, 'User not found');
  }

  ResponseBuilder.success(res, user, 'User retrieved successfully');
});

// POST /users - Create new user
export const createUser = typedAsyncHandler<
  Record<string, string>,
  ICreateUserRequest,
  Record<string, string>
>(async (req, res) => {
  const userData = req.body;

  const user = await UserService.createUser(userData);

  ResponseBuilder.created(res, user, 'User created successfully');
});

// PUT /users/:id - Update user
export const updateUser = typedAsyncHandler<
  { id: string },
  IUpdateUserRequest,
  Record<string, string>
>(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await UserService.updateUser(id, updateData);

  if (!user) {
    return ResponseBuilder.notFound(res, 'User not found');
  }

  ResponseBuilder.success(res, user, 'User updated successfully');
});

// DELETE /users/:id - Delete user
export const deleteUser = typedAsyncHandler<
  { id: string },
  Record<string, unknown>,
  Record<string, string>
>(async (req, res) => {
  const { id } = req.params;

  await UserService.deleteUser(id);

  ResponseBuilder.noContent(res);
});
```

### 2. Authentication Controller Pattern

```typescript
// src/controllers/auth.controller.ts
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { ISignupRequest, ISigninRequest, IAuthResponse } from '@/shared/types';
import { AuthService } from '@/services';
import ResponseBuilder from '@/utils/responseBuilder';

export const signup = typedAsyncHandler<
  Record<string, string>,
  ISignupRequest,
  Record<string, string>
>(async (req, res) => {
  const userData = req.body;

  const result = await AuthService.register(userData);

  // Set HTTP-only cookie for refresh token
  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  ResponseBuilder.created(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
    'Registration successful'
  );
});

export const signin = typedAsyncHandler<
  Record<string, string>,
  ISigninRequest,
  Record<string, string>
>(async (req, res) => {
  const { email, password } = req.body;

  const result = await AuthService.login(email, password);

  res.cookie('refreshToken', result.tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ResponseBuilder.success(
    res,
    {
      user: result.user,
      accessToken: result.tokens.accessToken,
    },
    'Login successful'
  );
});

export const logout = typedAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    await AuthService.logout(refreshToken);
  }

  res.clearCookie('refreshToken');
  ResponseBuilder.success(res, null, 'Logout successful');
});

export const refreshToken = typedAsyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return ResponseBuilder.unauthorized(res, 'Refresh token required');
  }

  const result = await AuthService.refreshTokens(refreshToken);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  ResponseBuilder.success(
    res,
    {
      accessToken: result.accessToken,
    },
    'Token refreshed successfully'
  );
});
```

### 3. Resource-Specific Controller

For more complex resources like messages:

```typescript
// src/controllers/message.controller.ts
import { typedAsyncHandler } from '@/middlewares/asyncHandler';
import { ISendMessageRequest, IMessageResponse } from '@/shared/types';
import { MessageService } from '@/services';
import ResponseBuilder from '@/utils/responseBuilder';

// GET /messages - Get user's messages
export const getMessages = typedAsyncHandler<
  Record<string, string>,
  Record<string, unknown>,
  {
    conversationId?: string;
    page?: string;
    limit?: string;
    before?: string; // For pagination by timestamp
  }
>(async (req, res) => {
  const userId = req.user!.id;
  const { conversationId, page, limit, before } = req.query;

  const messages = await MessageService.getUserMessages({
    userId,
    conversationId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined,
    before: before ? new Date(before) : undefined,
  });

  ResponseBuilder.success(res, messages, 'Messages retrieved successfully');
});

// POST /messages - Send a message
export const sendMessage = typedAsyncHandler<
  Record<string, string>,
  ISendMessageRequest,
  Record<string, string>
>(async (req, res) => {
  const senderId = req.user!.id;
  const messageData = req.body;

  const message = await MessageService.sendMessage({
    ...messageData,
    senderId,
  });

  ResponseBuilder.created(res, message, 'Message sent successfully');
});

// PUT /messages/:id/read - Mark message as read
export const markAsRead = typedAsyncHandler<
  { id: string },
  Record<string, unknown>,
  Record<string, string>
>(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user!.id;

  await MessageService.markAsRead(messageId, userId);

  ResponseBuilder.success(res, null, 'Message marked as read');
});

// DELETE /messages/:id - Delete message
export const deleteMessage = typedAsyncHandler<
  { id: string },
  Record<string, unknown>,
  Record<string, string>
>(async (req, res) => {
  const messageId = req.params.id;
  const userId = req.user!.id;

  await MessageService.deleteMessage(messageId, userId);

  ResponseBuilder.noContent(res);
});
```

## Response Patterns

### 1. Standard Responses

Always use ResponseBuilder for consistent responses:

```typescript
// Success responses
ResponseBuilder.success(res, data, message); // 200
ResponseBuilder.created(res, data, message); // 201
ResponseBuilder.noContent(res); // 204

// Error responses
ResponseBuilder.badRequest(res, message); // 400
ResponseBuilder.unauthorized(res, message); // 401
ResponseBuilder.forbidden(res, message); // 403
ResponseBuilder.notFound(res, message); // 404
ResponseBuilder.conflict(res, message); // 409
ResponseBuilder.validationError(res, errors); // 422
ResponseBuilder.internal(res, message); // 500
```

### 2. Pagination Responses

For paginated data:

```typescript
export const getPaginatedUsers = typedAsyncHandler<
  Record<string, string>,
  Record<string, unknown>,
  { page?: string; limit?: string; sort?: string }
>(async (req, res) => {
  const page = parseInt(req.query.page || '1');
  const limit = parseInt(req.query.limit || '10');
  const sort = req.query.sort || 'createdAt';

  const result = await UserService.getPaginated({
    page,
    limit,
    sort,
  });

  ResponseBuilder.paginated(
    res,
    result.data,
    {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
    'Users retrieved successfully'
  );
});
```

### 3. File Upload Responses

For file upload endpoints:

```typescript
export const uploadAvatar = typedAsyncHandler<
  Record<string, string>,
  Record<string, unknown>,
  Record<string, string>
>(async (req, res) => {
  const userId = req.user!.id;
  const file = req.file; // From multer middleware

  if (!file) {
    return ResponseBuilder.badRequest(res, 'No file uploaded');
  }

  const avatarUrl = await UserService.updateAvatar(userId, file);

  ResponseBuilder.success(res, { avatarUrl }, 'Avatar updated successfully');
});
```

## Controller Best Practices

### 1. Type Safety

- Always use `typedAsyncHandler` for type safety
- Define proper interfaces for all request/response types
- Use specific types instead of `any` or generic objects

### 2. Error Handling

- Let middleware handle errors - don't catch errors in controllers
- Use appropriate HTTP status codes
- Provide meaningful error messages

### 3. Input Validation

- Use middleware for validation, not controller logic
- Validate all input parameters (body, params, query)
- Sanitize input data when necessary

### 4. Response Consistency

- Always use ResponseBuilder for responses
- Include meaningful success messages
- Provide consistent data structures

### 5. Authentication & Authorization

- Use authentication middleware instead of checking auth in controllers
- Access user data from `req.user` after authentication
- Implement proper ownership checks when needed

### 6. Business Logic Separation

- Keep controllers thin - delegate business logic to services
- Controllers should only handle HTTP concerns
- Don't put database operations directly in controllers

### 7. Documentation

- Add JSDoc comments for complex controllers
- Document expected request/response formats
- Include usage examples for non-obvious endpoints

## Common Patterns

### 1. Ownership Verification

```typescript
export const updateUserProfile = typedAsyncHandler<
  { id: string },
  IUpdateProfileRequest,
  Record<string, string>
>(async (req, res) => {
  const { id } = req.params;
  const currentUserId = req.user!.id;

  // Users can only update their own profile (unless admin)
  if (id !== currentUserId && req.user!.role !== 'admin') {
    return ResponseBuilder.forbidden(
      res,
      "Cannot update another user's profile"
    );
  }

  const updatedUser = await UserService.updateProfile(id, req.body);
  ResponseBuilder.success(res, updatedUser, 'Profile updated successfully');
});
```

### 2. Conditional Logic

```typescript
export const getConversations = typedAsyncHandler<
  Record<string, string>,
  Record<string, unknown>,
  { includeMessages?: string; status?: string }
>(async (req, res) => {
  const userId = req.user!.id;
  const includeMessages = req.query.includeMessages === 'true';
  const status = req.query.status;

  const conversations = await MessageService.getUserConversations({
    userId,
    includeMessages,
    status,
  });

  ResponseBuilder.success(
    res,
    conversations,
    'Conversations retrieved successfully'
  );
});
```

### 3. Bulk Operations

```typescript
export const bulkDeleteMessages = typedAsyncHandler<
  Record<string, string>,
  { messageIds: string[] },
  Record<string, string>
>(async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user!.id;

  const deletedCount = await MessageService.bulkDelete(messageIds, userId);

  ResponseBuilder.success(
    res,
    { deletedCount },
    `${deletedCount} messages deleted successfully`
  );
});
```

This controller pattern ensures consistent, type-safe, and maintainable HTTP
handling throughout the application.
