import { register, Histogram, collectDefaultMetrics } from 'prom-client';
import type { Request, Response, NextFunction } from 'express';

// Enable default metrics collection (CPU, Memory, etc.)
collectDefaultMetrics();

/**
 * HTTP Request Duration metric
 */
const httpRequestDurationMicroseconds = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // seconds
});

/**
 * Metrics middleware to track request duration and status codes
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
    const start = process.hrtime();

    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationInSeconds = duration[0] + duration[1] / 1e9;
        const route = req.route?.path ?? req.originalUrl;

        httpRequestDurationMicroseconds
            .labels(req.method, route, res.statusCode.toString())
            .observe(durationInSeconds);
    });

    next();
}

/**
 * Endpoint to expose metrics for Prometheus scraping
 */
export async function getMetrics(_req: Request, res: Response): Promise<void> {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
}
