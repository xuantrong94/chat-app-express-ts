import { TypedResponse, AuthenticatedUser, AppLocals } from '@/shared/types';
import { Response } from 'express';

/**
 * Type guard to check if a response has properly typed locals
 */
export function isTypedResponse(res: Response): res is TypedResponse {
  return 'locals' in res;
}

/**
 * Helper function to safely get authenticated user from response locals
 */
export function getAuthenticatedUser(res: TypedResponse): AuthenticatedUser | null {
  return res.locals.user ?? null;
}

/**
 * Helper function to safely get request ID from response locals
 */
export function getRequestId(res: TypedResponse): string {
  return res.locals.requestId ?? 'unknown';
}

/**
 * Helper function to set user in response locals with type safety
 */
export function setAuthenticatedUser(res: TypedResponse, user: AuthenticatedUser): void {
  res.locals.user = user;
}

/**
 * Helper function to set request ID in response locals with type safety
 */
export function setRequestId(res: TypedResponse, requestId: string): void {
  res.locals.requestId = requestId;
}

export type { TypedResponse, AuthenticatedUser, AppLocals };
