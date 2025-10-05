# Type-Safe Express Locals Configuration

## Overview

This document outlines the configuration changes made to ensure type safety for
Express `res.locals` throughout the application. The implementation provides
compile-time type checking and intellisense support for accessing user
authentication data and request metadata.

## Key Changes

### 1. Express Type Declaration (`src/shared/types/express.d.ts`)

Extended the Express namespace to include our custom `AppLocals` interface:

```typescript
import { AppLocals } from './handler.types';

declare global {
  namespace Express {
    interface Locals extends AppLocals {}
  }
}
```

### 2. Typed Locals Interface (`src/shared/types/handler.types.ts`)

```typescript
// Interface for Express response locals
export interface AppLocals {
  user?: AuthenticatedUser;
  requestId?: string;
}

// Custom typed response interface with our locals
export interface TypedResponse extends Omit<Response, 'locals'> {
  locals: AppLocals;
}
```

### 3. Updated Handler Types

Modified `TypedAsyncFunction` to use `TypedResponse` instead of generic
`Response`:

```typescript
export type TypedAsyncFunction<
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
> = (
  req: TypedRequest<TParams, TBody, TQuery>,
  res: TypedResponse,
  next: NextFunction
) => Promise<void>;
```

### 4. Enhanced ResponseBuilder

Updated all methods in `ResponseBuilder` to use `TypedResponse` with proper null
coalescing:

```typescript
static success<T>(
  res: TypedResponse,
  data: T,
  message = 'Success',
  statusCode = 200,
  metadata?: Partial<ResponseMetadata>
): Response {
  // ...
  requestId: res.locals.requestId ?? 'unknown',
  // ...
}
```

### 5. Improved Middleware Type Safety

Updated `protectRoute` middleware to properly type the user object:

```typescript
const user: AuthenticatedUser = {
  id: decoded.id,
  email: decoded.email,
};
res.locals.user = user;
```

### 6. Type Utility Functions (`src/utils/typedLocals.ts`)

Created helper functions for safe access to typed locals:

```typescript
export function getAuthenticatedUser(
  res: TypedResponse
): AuthenticatedUser | null;
export function getRequestId(res: TypedResponse): string;
export function setAuthenticatedUser(
  res: TypedResponse,
  user: AuthenticatedUser
): void;
export function setRequestId(res: TypedResponse, requestId: string): void;
```

## Benefits

1. **Compile-time Type Checking**: TypeScript will catch errors if you try to
   access non-existent properties on `res.locals`
2. **IntelliSense Support**: IDE autocomplete for all properties in `res.locals`
3. **Null Safety**: Proper handling of optional properties with null coalescing
   operators
4. **Documentation**: Types serve as self-documenting contracts for what data is
   available
5. **Refactoring Safety**: Changes to the locals interface will be caught at
   compile time

## Usage Examples

### In Controllers (using typedAsyncHandler)

```typescript
export const getProfile = typedAsyncHandler(async (req, res) => {
  // TypeScript knows res.locals.user is AuthenticatedUser | undefined
  const user = res.locals.user;
  if (!user) {
    return ResponseBuilder.unauthorized(res, 'User not authenticated');
  }

  // user is now properly typed as AuthenticatedUser
  console.log(user.id, user.email); // Type-safe access
});
```

### In Middleware

```typescript
export const setRequestId = typedAsyncHandler(async (req, res, next) => {
  res.locals.requestId = generateRequestId();
  next();
});
```

### Using Helper Functions

```typescript
import { getAuthenticatedUser, setRequestId } from '@/utils/typedLocals';

export const someController = typedAsyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(res); // Returns AuthenticatedUser | null
  setRequestId(res, 'req-123'); // Type-safe setter
});
```

## Migration Guide

For existing code that uses `res.locals`, no immediate changes are required as
the types are backward compatible. However, for new code:

1. Use `TypedResponse` instead of `Response` in function parameters
2. Use helper functions from `typedLocals.ts` for safer access
3. Take advantage of TypeScript's type checking for `res.locals` properties

## Type Safety Guarantees

- ✅ Cannot access non-existent properties on `res.locals`
- ✅ Proper type inference for all locals properties
- ✅ Compile-time errors for incorrect property types
- ✅ Null safety with proper optional handling
- ✅ Full IDE support with autocomplete and error highlighting
