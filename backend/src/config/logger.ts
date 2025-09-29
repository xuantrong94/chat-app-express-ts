import winston from 'winston';
import { env, isDevelopment, isProduction } from './env.js';
import type { Request, Response } from 'express';
// Custom log format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (stack) {
      logMessage += `\n${typeof stack === 'string' ? stack : JSON.stringify(stack)}`;
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  })
);

// Development format (more readable)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let logMessage = `${timestamp} ${level}: ${message}`;

    if (stack) {
      logMessage += `\n${typeof stack === 'string' ? stack : JSON.stringify(stack)}`;
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  })
);

// Create transports array
const transports = [];

// Console transport
transports.push(
  new winston.transports.Console({
    level: env.LOG_LEVEL,
    format: isDevelopment() ? devFormat : customFormat,
    handleExceptions: true,
    handleRejections: true,
  })
);

// File transports (only in production)
if (!isDevelopment()) {
  transports.push(
    // Combined log file
    new winston.transports.File({
      filename: env.LOG_FILE,
      level: 'info',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true,
    })
  );

  transports.push(
    // Error log file
    new winston.transports.File({
      filename: env.LOG_FILE.replace('.log', '-error.log'),
      level: 'error',
      format: customFormat,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      handleExceptions: true,
      handleRejections: true,
    })
  );
}

// Create logger instance
const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  exitOnError: false,
});

// Helper function for request logging
export const logRequest = (req: Request, res: Response, responseTime?: number) => {
  const { method, url, ip, headers } = req;
  const { statusCode } = res;

  logger.info('HTTP Request', {
    method,
    url,
    ip,
    userAgent: headers['user-agent'],
    statusCode,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
  });
};

if (!isProduction()) {
  // Enable request logging in development
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    })
  );
}

export default logger;
