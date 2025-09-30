import { ErrorType } from '@/shared/types/error.types';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorType: ErrorType;
  public readonly timestamp: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode = 500,
    errorType: ErrorType = ErrorType.INTERNAL_SERVER,
    isOperational = true,
    details?: unknown
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorType = errorType;
    this.timestamp = new Date().toISOString();
    this.details = details;

    // Maintains proper stack trace for debugging
    Error.captureStackTrace(this, this.constructor);

    // Set the error name for better logging
    this.name = this.constructor.name;
  }

  /**
   * Serializes the error for logging purposes
   */
  toJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      errorType: this.errorType,
      timestamp: this.timestamp,
      isOperational: this.isOperational,
    };

    if (this.details !== undefined) {
      result.details = this.details;
    }

    if (this.stack) {
      result.stack = this.stack;
    }

    return result;
  }

  /**
   * Creates a safe version of the error for client responses
   */
  toSafeJSON(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      message: this.message,
      statusCode: this.statusCode,
      errorType: this.errorType,
      timestamp: this.timestamp,
    };

    if (this.details !== undefined) {
      result.details = this.details;
    }

    return result;
  }

  /**
   * Checks if this error should be logged
   */
  shouldLog(): boolean {
    return this.statusCode >= 500 || !this.isOperational;
  }

  // Static factory methods with improved defaults and type safety
  static badRequest(message = 'Bad Request', details?: unknown): AppError {
    return new AppError(message, 400, ErrorType.VALIDATION_ERROR, true, details);
  }

  static unauthorized(message = 'Unauthorized access', details?: unknown): AppError {
    return new AppError(message, 401, ErrorType.UNAUTHORIZED, true, details);
  }

  static forbidden(message = 'Access forbidden', details?: unknown): AppError {
    return new AppError(message, 403, ErrorType.FORBIDDEN, true, details);
  }

  static notFound(message = 'Resource not found', details?: unknown): AppError {
    return new AppError(message, 404, ErrorType.NOT_FOUND, true, details);
  }

  static conflict(message = 'Resource conflict', details?: unknown): AppError {
    return new AppError(message, 409, ErrorType.DUPLICATE_KEY, true, details);
  }

  static internal(message = 'Internal server error', details?: unknown): AppError {
    return new AppError(message, 500, ErrorType.INTERNAL_SERVER, true, details);
  }

  static database(message = 'Database operation failed', details?: unknown): AppError {
    return new AppError(message, 500, ErrorType.DATABASE_ERROR, true, details);
  }

  static duplicateKey(message = 'Duplicate key violation', details?: unknown): AppError {
    return new AppError(message, 409, ErrorType.DUPLICATE_KEY, true, details);
  }

  /**
   * Creates an AppError from a generic Error
   */
  static fromError(
    error: Error,
    statusCode = 500,
    errorType = ErrorType.INTERNAL_SERVER
  ): AppError {
    const appError = new AppError(error.message, statusCode, errorType, true);
    appError.stack = error.stack;
    return appError;
  }

  /**
   * Validates if an error is an AppError instance
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}
