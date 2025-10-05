import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '@/utils/AppError';
import { ErrorType } from '@/shared/types/error.types';

// Interface for validation error details
interface ValidationError {
  field: string;
  message: string;
}

// Generic validation middleware function
export const validate = <T>(schema: z.ZodSchema<T>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Validate the request against the schema
      const result = schema.safeParse({
        body: (req as Request & { body: unknown }).body,
        params: req.params,
        query: req.query,
      });

      if (!result.success) {
        // Extract validation errors
        const errors: ValidationError[] = result.error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        // Create detailed error message
        const errorMessage = errors
          .map((err: ValidationError) => `${err.field}: ${err.message}`)
          .join('; ');

        // Throw validation error
        throw new AppError(`Validation error: ${errorMessage}`, 400, ErrorType.VALIDATION_ERROR);
      }

      // If validation passes, update request with validated data
      if (result.data && typeof result.data === 'object' && 'body' in result.data) {
        (req as Request & { body: unknown }).body = result.data.body;
      }

      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errors: ValidationError[] = error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        const errorMessage = errors
          .map((err: ValidationError) => `${err.field}: ${err.message}`)
          .join('; ');

        return next(
          new AppError(`Validation error: ${errorMessage}`, 400, ErrorType.VALIDATION_ERROR)
        );
      }

      // Pass other errors to error handler
      next(error);
    }
  };
};
