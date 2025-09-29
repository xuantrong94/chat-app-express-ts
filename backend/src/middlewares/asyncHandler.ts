import { Request, Response, NextFunction } from 'express';

import logger from '@/config/logger';
import { AsyncFunction, TypedAsyncFunction, TypedRequest } from '@/shared/types/handler.types';

export const asyncHandler = (fn: AsyncFunction) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(error => {
      // log the error
      logger.error('AsyncHandler caught an error:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString(),
      });

      next(error);
    });
  };
};

/**
 * Typed async handler - với type safety
 * Sử dụng khi muốn type checking cho params, body, query
 */
export const typedAsyncHandler = <
  TParams = Record<string, string>,
  TBody = Record<string, unknown>,
  TQuery = Record<string, string | string[] | undefined>,
>(
  fn: TypedAsyncFunction<TParams, TBody, TQuery>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const typedReq = req as TypedRequest<TParams, TBody, TQuery>;
    Promise.resolve(fn(typedReq, res, next)).catch(error => {
      logger.error('TypedAsyncHandler caught error:', {
        error: error.message,
        stack: error.stack,
        url: req.originalUrl,
        method: req.method,
        params: typedReq.params,
        body: typedReq.body,
        query: typedReq.query,
        timestamp: new Date().toISOString(),
      });

      next(error);
    });
  };
};
