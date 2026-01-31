import { startServer, gracefulShutdown } from './app.js';
import { logger } from './lib/logger.js';

// ============================================
// CRITICAL: Global Error Handlers
// ============================================

// Handle uncaught synchronous exceptions
process.on('uncaughtException', (error: Error) => {
  logger.fatal({ error: error.message, stack: error.stack }, 'Uncaught exception - initiating graceful shutdown');
  gracefulShutdown('uncaughtException').finally(() => process.exit(1));
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.fatal({ reason }, 'Unhandled rejection - initiating graceful shutdown');
  gracefulShutdown('unhandledRejection').finally(() => process.exit(1));
});

// ============================================
// Graceful Shutdown Signals (Windows + Unix)
// ============================================

// SIGTERM - Kubernetes, Docker, PM2
process.on('SIGTERM', () => {
  logger.info('SIGTERM received - initiating graceful shutdown');
  gracefulShutdown('SIGTERM').finally(() => process.exit(0));
});

// SIGINT - Ctrl+C
process.on('SIGINT', () => {
  logger.info('SIGINT received - initiating graceful shutdown');
  gracefulShutdown('SIGINT').finally(() => process.exit(0));
});

// Windows-specific: Handle when nodemon or tsx restarts
process.on('SIGHUP', () => {
  logger.info('SIGHUP received - initiating graceful shutdown');
  gracefulShutdown('SIGHUP').finally(() => process.exit(0));
});

// ============================================
// Start Server
// ============================================

startServer();
