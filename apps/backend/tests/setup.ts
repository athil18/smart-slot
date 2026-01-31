import { vi } from 'vitest';

// Mock environment variables for testing
process.env['NODE_ENV'] = 'test';
process.env['PORT'] = '3001';
process.env['HOST'] = '127.0.0.1';
process.env['DATABASE_URL'] = 'postgresql://test:test@localhost:5432/test';
process.env['JWT_SECRET'] = 'test-jwt-secret-at-least-32-chars-long';
process.env['JWT_REFRESH_SECRET'] = 'test-jwt-refresh-secret-at-least-32-chars-long';
process.env['CORS_ORIGINS'] = 'http://localhost:3000';
