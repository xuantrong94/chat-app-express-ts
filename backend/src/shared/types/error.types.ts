export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  details?: any;
}

export enum ErrorType {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_SERVER = 'INTERNAL_SERVER',
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_KEY = 'DUPLICATE_KEY',
}
