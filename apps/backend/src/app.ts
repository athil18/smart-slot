import express from 'express';
import type { Server } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from '@/config/env.js';
import { requestLogger, errorHandler } from '@/middleware/index.js';
import routes from '@/routes/index.js';
import { logger } from '@/lib/logger.js';
import { metricsMiddleware, getMetrics } from '@/middleware/metrics.js';

// ============================================
// Server Instance Reference (Critical for graceful shutdown)
// ============================================
let server: Server | null = null;
let isShuttingDown = false;

export function createApp(): express.Application {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // CORS configuration
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true,
    })
  );

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Metrics middleware
  app.use(metricsMiddleware);
  app.use(requestLogger);

  // Health check endpoint (critical for debugging connection issues)
  app.get('/health', (_req, res) => {
    if (isShuttingDown) {
      res.status(503).json({ status: 'shutting_down' });
      return;
    }
    res.json({
      status: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      port: env.PORT
    });
  });

  // Metrics endpoint
  // @ts-ignore
  app.get('/metrics', (req, res, next) => {
    getMetrics(req, res).catch(next);
  });

  // API routes
  app.use(env.API_PREFIX, routes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { message: 'Route not found' },
    });
  });

  // Error handler
  app.use(errorHandler);

  return app;
}

export function startServer(): void {
  const app = createApp();

  // ============================================
  // CRITICAL: Proper server binding with error handling
  // ============================================
  server = app.listen(env.PORT, env.HOST, () => {
    logger.info({
      message: '🚀 Server started',
      port: env.PORT,
      host: env.HOST,
      environment: env.NODE_ENV,
      apiPrefix: env.API_PREFIX,
      pid: process.pid,
    });
  });

  // ============================================
  // CRITICAL: Handle server-level errors
  // ============================================
  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      logger.fatal({ port: env.PORT }, `Port ${env.PORT} is already in use. Please kill the existing process or use a different port.`);
      console.error(`\n❌ PORT ${env.PORT} IS IN USE!\n`);
      console.error('Run this command to find and kill the process:');
      console.error(`   netstat -ano | findstr :${env.PORT}`);
      console.error(`   taskkill /F /PID <PID_NUMBER>\n`);
      process.exit(1);
    } else if (error.code === 'EACCES') {
      logger.fatal({ port: env.PORT }, `Port ${env.PORT} requires elevated privileges`);
      process.exit(1);
    } else {
      logger.fatal({ error }, 'Server error');
      process.exit(1);
    }
  });

  // ============================================
  // Configure keep-alive for Windows compatibility
  // ============================================
  server.keepAliveTimeout = 65000; // Slightly higher than typical load balancer timeout
  server.headersTimeout = 66000; // Slightly higher than keepAliveTimeout

  // ============================================
  // Track active connections for graceful shutdown
  // ============================================
  const connections = new Set<any>();

  server.on('connection', (conn) => {
    connections.add(conn);
    conn.on('close', () => connections.delete(conn));
  });

  // Store connections reference for shutdown
  (server as any)._connections = connections;
}

// ============================================
// Graceful Shutdown Handler
// ============================================
export async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress, ignoring signal');
    return;
  }

  isShuttingDown = true;
  logger.info({ signal }, 'Starting graceful shutdown...');

  // Set a hard timeout for shutdown (10 seconds)
  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000);

  try {
    if (server) {
      // Stop accepting new connections
      server.close((err) => {
        if (err) {
          logger.error({ error: err }, 'Error closing server');
        } else {
          logger.info('Server closed successfully');
        }
      });

      // Destroy all active connections
      const connections = (server as any)._connections as Set<any>;
      if (connections) {
        logger.info({ count: connections.size }, 'Closing active connections');
        for (const conn of connections) {
          conn.destroy();
        }
      }
    }

    // Give time for cleanup
    await new Promise(resolve => setTimeout(resolve, 1000));

    clearTimeout(shutdownTimeout);
    logger.info({ signal }, 'Graceful shutdown complete');
  } catch (error) {
    logger.error({ error }, 'Error during graceful shutdown');
    clearTimeout(shutdownTimeout);
    throw error;
  }
}

export function getServer(): Server | null {
  return server;
}
