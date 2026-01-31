import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { logger } from '../lib/logger.js';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
    }
  }
}

/**
 * Request logging middleware with tracing
 * - Generates unique request ID (X-Request-Id header)
 * - Logs timing (duration in ms)
 * - Includes user ID if authenticated
 * 
 * Example log line:
 * {"level":30,"time":1706189100000,"requestId":"abc-123","method":"GET","url":"/api/v1/tasks","statusCode":200,"duration":"45ms","userId":"cluser123","ip":"::1"}
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startHrTime = process.hrtime.bigint();

  const requestId = (req.get('X-Request-Id') ?? randomUUID()) as string;
  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const endHrTime = process.hrtime.bigint();
    const durationNs = endHrTime - startHrTime;
    const durationMs = Number(durationNs) / 1_000_000;

    const logData = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${durationMs.toFixed(2)}ms`,
      userId: req.user?.userId ?? null,
      ip: req.ip,
    };

    if (durationMs > 200) {
      logger.warn(logData, '🚨 High Latency Request');
    } else {
      logger.info(logData);
    }
  });

  next();
}
