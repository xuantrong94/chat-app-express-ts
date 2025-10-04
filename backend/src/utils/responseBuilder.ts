import { IApiResponse, ResponseMetadata, PaginationResponse } from '@/shared/types/response.types';
import { Response } from 'express';
import { AppError } from './AppError';
import { ErrorType } from '@/shared/types/error.types';
import { TypedResponse } from '@/shared/types';
import process from 'process';

class ResponseBuilder {
  /**
   * Success response
   */
  static success<T>(
    res: TypedResponse,
    data: T,
    message = 'Success',
    statusCode = 200,
    metadata?: Partial<ResponseMetadata>
  ): Response {
    const response: IApiResponse<T> = {
      success: true,
      message,
      data,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId ?? 'unknown',
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Created response (201)
   */
  static created<T>(res: TypedResponse, data: T, message = 'Created'): Response {
    return this.success(res, data, message, 201);
  }

  /**
   * No content response (204)
   */
  static noContent(res: TypedResponse): Response {
    return res.status(204).end();
  }

  /**
   * Error response
   */
  static error(
    res: TypedResponse,
    message = 'An error occurred',
    statusCode = 500,
    errorCode?: string,
    details?: unknown
  ): Response {
    const isDevelopment = process?.env?.NODE_ENV === 'development';

    const response: IApiResponse<null> = {
      success: false,
      message,
      data: null,
      error: {
        code: errorCode ?? 'INTERNAL_ERROR',
        details,
        ...(isDevelopment && { stack: new Error().stack }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId ?? 'unknown',
      },
    };

    return res.status(statusCode).json(response);
  }

  /**
   * Error response from AppError instance
   */
  static fromAppError(res: TypedResponse, error: AppError): Response {
    const isDevelopment = process?.env?.NODE_ENV === 'development';

    const response: IApiResponse<null> = {
      success: false,
      message: error.message,
      data: null,
      error: {
        code: error.errorType,
        details: error.details,
        ...(isDevelopment && error.stack && { stack: error.stack }),
      },
      metadata: {
        timestamp: error.timestamp,
        requestId: res.locals.requestId ?? 'unknown',
      },
    };

    return res.status(error.statusCode).json(response);
  }

  /**
   * Generic error handler that works with both AppError and generic Error
   */
  static handleError(res: TypedResponse, error: Error | AppError): Response {
    if (AppError.isAppError(error)) {
      return this.fromAppError(res, error);
    }

    // Convert generic Error to AppError
    const appError = AppError.fromError(error);
    return this.fromAppError(res, appError);
  }

  /**
   * Unauthorized response (401)
   */
  static unauthorized(res: TypedResponse, message = 'Unauthorized'): Response {
    return this.error(res, message, 401, ErrorType.UNAUTHORIZED);
  }

  /**
   * Forbidden response (403)
   */
  static forbidden(res: TypedResponse, message = 'Forbidden'): Response {
    return this.error(res, message, 403, ErrorType.FORBIDDEN);
  }

  /**
   * Not found response (404)
   */
  static notFound(res: TypedResponse, message = 'Resource not found'): Response {
    return this.error(res, message, 404, ErrorType.NOT_FOUND);
  }

  /**
   * Conflict response (409)
   */
  static conflict(res: TypedResponse, message = 'Conflict', details?: unknown): Response {
    return this.error(res, message, 409, ErrorType.DUPLICATE_KEY, details);
  }

  /**
   * Validation error response (422)
   */
  static validationError(
    res: TypedResponse,
    message = 'Validation failed',
    details?: unknown
  ): Response {
    return this.error(res, message, 422, ErrorType.VALIDATION_ERROR, details);
  }

  /**
   * Internal server error response (500)
   */
  static internalError(res: TypedResponse, message = 'Internal server error'): Response {
    return this.error(res, message, 500, ErrorType.INTERNAL_SERVER);
  }

  /**
   * Paginated response
   */
  static paginated<T>(
    res: TypedResponse,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message = 'Success'
  ): Response {
    const totalPages = Math.ceil(total / limit);

    const response: PaginationResponse<T[]> = {
      success: true,
      message,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId ?? 'unknown',
        page,
        limit,
        total,
        totalPages,
      },
    };

    return res.status(200).json(response);
  }

  /**
   * Creates an appropriate error response based on status code
   */
  static errorByStatusCode(
    res: TypedResponse,
    statusCode: number,
    message?: string,
    details?: unknown
  ): Response {
    switch (statusCode) {
      case 400:
        return this.validationError(res, message ?? 'Bad Request', details);
      case 401:
        return this.unauthorized(res, message ?? 'Unauthorized');
      case 403:
        return this.forbidden(res, message ?? 'Forbidden');
      case 404:
        return this.notFound(res, message ?? 'Not Found');
      case 409:
        return this.conflict(res, message ?? 'Conflict', details);
      case 422:
        return this.validationError(res, message ?? 'Validation Error', details);
      case 500:
      default:
        return this.internalError(res, message ?? 'Internal Server Error');
    }
  }
}

export default ResponseBuilder;
