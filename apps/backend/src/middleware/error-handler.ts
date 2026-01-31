import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Map known error types to status codes and messages
 */
function mapError(err: Error): { statusCode: number; message: string; isOperational: boolean } {
  // Prisma known errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaErr = err as Error & { code: string };
    switch (prismaErr.code) {
      case 'P2002': return { statusCode: 409, message: 'A record with this value already exists', isOperational: true };
      case 'P2025': return { statusCode: 404, message: 'Record not found', isOperational: true };
      default: return { statusCode: 400, message: 'Database operation failed', isOperational: true };
    }
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    return { statusCode: 400, message: 'Validation failed', isOperational: true };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return { statusCode: 401, message: 'Invalid token', isOperational: true };
  }
  if (err.name === 'TokenExpiredError') {
    return { statusCode: 401, message: 'Token expired', isOperational: true };
  }

  // Syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    return { statusCode: 400, message: 'Invalid JSON', isOperational: true };
  }

  // AppError instances
  if (err instanceof AppError) {
    return { statusCode: err.statusCode, message: err.message, isOperational: err.isOperational };
  }

  // Unknown errors
  return { statusCode: 500, message: 'Internal Server Error', isOperational: false };
}

/**
 * Global error handler middleware
 * - Maps known errors to appropriate status codes
 * - Unified JSON response shape
 * - Stack traces in development only
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { statusCode, message, isOperational } = mapError(err);

  logger.error({
    message: err.message,
    name: err.name,
    stack: err.stack,
    statusCode,
    isOperational,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
