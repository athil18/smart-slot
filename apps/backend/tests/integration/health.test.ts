import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Health Routes', () => {
    describe('GET /api/v1/health', () => {
        it('should return 200 with status ok', async () => {
            const res = await request(app).get('/api/v1/health');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.status).toBe('ok');
        });
    });

    describe('GET /api/v1/ready', () => {
        it('should return 200 with ready status', async () => {
            const res = await request(app).get('/api/v1/ready');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});

describe('404 Handling', () => {
    it('should return 404 for unknown routes', async () => {
        const res = await request(app).get('/api/v1/nonexistent');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.error.message).toBe('Route not found');
    });
});
