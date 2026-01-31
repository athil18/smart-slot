import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes
 * - 5 requests per minute per IP
 * - Protects against brute force attacks
 */
export const authRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { message: 'Too many requests. Please try again later.' },
    },
});

/**
 * General API rate limiter
 * - 100 requests per minute per IP
 */
export const apiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: { message: 'Rate limit exceeded' },
    },
});
