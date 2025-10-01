import { Request, Response, NextFunction } from 'express';

// Base user interface for authenticated routes
export interface AuthenticatedUser {
  id: string;
  email: string;
  [key: string]: unknown;
}

// Generic async function type
export type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<void>;

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

// Typed async function for route handlers
export type TypedAsyncFunction<
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
> = (req: TypedRequest<TParams, TBody, TQuery>, res: Response, next: NextFunction) => Promise<void>;
