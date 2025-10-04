import { Request, Response, NextFunction } from 'express';

// Base user interface for authenticated routes
export interface AuthenticatedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

// Interface for Express response locals
export interface AppLocals {
  user?: AuthenticatedUser;
  requestId?: string;
}

// Custom typed response interface with our locals
export interface TypedResponse extends Omit<Response, 'locals'> {
  locals: AppLocals;
}

// Generic async function type
export type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Typed async function for route handlers with custom locals
export type TypedAsyncFunction<
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
> = (
  req: TypedRequest<TParams, TBody, TQuery>,
  res: TypedResponse,
  next: NextFunction
) => Promise<void>;

// Custom typed request interface that properly extends Express Request
export interface TypedRequest<
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
> extends Omit<Request, 'params' | 'body' | 'query'> {
  params: TParams;
  body: TBody;
  query: TQuery;
  user?: AuthenticatedUser; // For authenticated routes
  cookies: Record<string, string>; // Add cookies support
}
