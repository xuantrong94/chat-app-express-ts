import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import { StatusCodes } from 'http-status-codes';

// Validation middleware factory
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body, query, and params
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace req with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'fail',
          message: 'Validation failed',
          errors: errorMessages,
        });
      }

      next(error);
    }
  };
};

// Body validation only
export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'fail',
          message: 'Request body validation failed',
          errors: errorMessages,
        });
      }

      next(error);
    }
  };
};

// Query validation only
export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.query);
      req.query = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'fail',
          message: 'Query parameters validation failed',
          errors: errorMessages,
        });
      }

      next(error);
    }
  };
};

// Params validation only
export const validateParams = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'fail',
          message: 'URL parameters validation failed',
          errors: errorMessages,
        });
      }

      next(error);
    }
  };
};

// Common validation schemas
export const commonSchemas = {
  // MongoDB ObjectId validation
  mongoId: z.object({
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
    }),
  }),

  // Pagination validation
  pagination: z.object({
    query: z.object({
      page: z.coerce.number().min(1).default(1),
      limit: z.coerce.number().min(1).max(100).default(10),
      sort: z.string().optional(),
      sortOrder: z.enum(['asc', 'desc']).default('desc'),
    }),
  }),

  // Email validation
  email: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
    }),
  }),

  // Password validation
  password: z.object({
    body: z.object({
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    }),
  }),

  // User registration validation
  userRegistration: z.object({
    body: z.object({
      username: z
        .string()
        .min(3, 'Username must be at least 3 characters')
        .max(30, 'Username must be less than 30 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
      email: z.string().email('Invalid email address'),
      password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
      firstName: z.string().min(1, 'First name is required'),
      lastName: z.string().min(1, 'Last name is required'),
    }),
  }),

  // User login validation
  userLogin: z.object({
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required'),
    }),
  }),
};

export default validate;
