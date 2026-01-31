import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/jwt.js';
import type { DecodedToken } from '../lib/jwt.js';
import { logger } from '../lib/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: { message: 'No token provided' },
    });
    return;
  }

  const token = authHeader.slice(7);

  // Development Bypass: Allow 'dev-bypass-token' to act as admin
  if (token === 'dev-bypass-token') {
    req.user = {
      userId: 'u_admin',
      email: 'admin@example.com',
      role: 'admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    };
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    logger.warn({ error }, 'Invalid access token');
    res.status(401).json({
      success: false,
      error: { message: 'Invalid or expired token' },
    });
  }
}
