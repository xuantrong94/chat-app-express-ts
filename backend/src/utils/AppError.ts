import { ErrorType } from '@/shared/types/error.types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorType: ErrorType;

  constructor(
    message: string,
    statusCode = 500,
    errorType: ErrorType = ErrorType.INTERNAL_SERVER,
    isOperational = true
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorType = errorType;

    // Maintains proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request'): AppError {
    return new AppError(message, 400, ErrorType.VALIDATION_ERROR);
  }

  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(message, 401, ErrorType.UNAUTHORIZED);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(message, 403, ErrorType.FORBIDDEN);
  }

  static notFound(message = 'Not Found'): AppError {
    return new AppError(message, 404, ErrorType.NOT_FOUND);
  }

  static internal(message = 'Internal Server Error'): AppError {
    return new AppError(message, 500, ErrorType.INTERNAL_SERVER);
  }

  static database(message = 'Database Error'): AppError {
    return new AppError(message, 500, ErrorType.DATABASE_ERROR);
  }

  static duplicateKey(message = 'Duplicate Key Error'): AppError {
    return new AppError(message, 409, ErrorType.DUPLICATE_KEY);
  }
}
