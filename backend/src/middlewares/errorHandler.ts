import { Request, Response, NextFunction } from 'express';
import { MongoError } from 'mongodb';
import { Error as MongooseError } from 'mongoose';
import { AppError } from '@/utils/AppError';
import { ErrorType } from '@/shared/types/error.types';
import logger from '@/config/logger';
import { isDevelopment } from '@/config/env';

interface ErrorResponse {
  success: false;
  error: {
    type: string;
    message: string;
    statusCode: number;
    timestamp: string;
    path: string;
    stack?: string;
    details?: any;
  };
}

// handle mongoose validation errors
const handleDuplicateKeyError = (error: any): AppError => {
  const field = Object.keys(error.keyValue)[0];
  const value = field ? error.keyValue[field] : '';
  const message = field
    ? `${field} "${value}" already exists. Please use another value.`
    : 'Duplicate key error. Please use another value.';
  return new AppError(message, 400, ErrorType.DUPLICATE_KEY);
};

// handle Mongoose validation errors
const handleValidationError = (error: MongooseError.ValidationError): AppError => {
  const errors = Object.values(error.errors).map(val => val.message);
  const message = `Invalid input data: ${errors.join('.')}`;
  return new AppError(message, 400, ErrorType.VALIDATION_ERROR);
};

// Handle CastError (invalid ObjectId)
const handleCastError = (error: MongooseError.CastError): AppError => {
  const message = `Invalid ${error.path}: ${error.value}.`;
  return new AppError(message, 400, ErrorType.VALIDATION_ERROR);
};

// handle JWT errors
const handleJWTError = (): AppError => {
  return AppError.unauthorized('Invalid token. Please log in again!');
};

const handleJWTExpiredError = (): AppError => {
  return AppError.unauthorized('Your token has expired! Please log in again.');
};

const convertToAppError = (error: any): AppError => {
  // MongoDB duplicate key error
  if (error.code === 11000) {
    return handleDuplicateKeyError(error);
  }

  // Mongoose validation error
  if (error instanceof MongooseError.ValidationError) {
    return handleValidationError(error);
  }

  // Mongoose cast error
  if (error instanceof MongooseError.CastError) {
    return handleCastError(error);
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return handleJWTError();
  }

  if (error.name === 'TokenExpiredError') {
    return handleJWTExpiredError();
  }

  // MongoDB connection errors
  if (error instanceof MongoError) {
    return AppError.database(`Database error: ${error.message}`);
  }

  // If it's already an AppError, return as is
  if (error instanceof AppError) {
    return error;
  }

  // Default to internal server error
  return AppError.internal('Something went wrong!');
};

// Send error response in development
const sendErrorDev = (error: AppError, req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      type: error.errorType || ErrorType.INTERNAL_SERVER,
      message: error.message,
      statusCode: error.statusCode || 500,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      stack: error.stack,
    },
  };
  res.status(errorResponse.error.statusCode).json(errorResponse);
};

// Send error response in production
const sendErrorProd = (error: AppError, req: Request, res: Response): void => {
  const errorResponse: ErrorResponse = {
    success: false,
    error: {
      type: error.errorType,
      message: error.isOperational ? error.message : 'Something went wrong!',
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    },
  };

  res.status(error.statusCode).json(errorResponse);
};

// main error handling middleware
export const globalErrorHandler = (error: any, req: Request, res: Response): void => {
  const appError = convertToAppError(error);

  // Log error details
  logger.error('Error occurred', {
    message: appError.message,
    statusCode: appError.statusCode,
    errorType: appError.errorType,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    stack: isDevelopment() ? appError.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  isDevelopment() ? sendErrorDev(appError, req, res) : sendErrorProd(appError, req, res);
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  const error = AppError.notFound(`Cannot find ${req.originalUrl} on this server!`);
  next(error);
};
