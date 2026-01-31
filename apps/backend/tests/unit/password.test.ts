import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/lib/password';

describe('Password Utilities', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const password = 'test123';
            const hashed = await hashPassword(password);

            expect(hashed).toBeDefined();
            expect(hashed).not.toBe(password);
            expect(hashed.startsWith('$2b$')).toBe(true);
        });
    });

    describe('verifyPassword', () => {
        it('should return true for matching password', async () => {
            const password = 'test123';
            const hashed = await hashPassword(password);
            const isMatch = await verifyPassword(password, hashed);

            expect(isMatch).toBe(true);
        });

        it('should return false for non-matching password', async () => {
            const password = 'test123';
            const hashed = await hashPassword(password);
            const isMatch = await verifyPassword('wrong', hashed);

            expect(isMatch).toBe(false);
        });
    });
});
