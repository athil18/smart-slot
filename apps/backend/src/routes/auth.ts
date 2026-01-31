// @ts-nocheck
import { Router } from 'express';
import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { generateTokenPair, verifyRefreshToken } from '../lib/jwt.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rate-limiter.js';
import { logger } from '../lib/logger.js';
import { env } from '../config/env.js';

/* eslint-disable @typescript-eslint/no-misused-promises */
const router = Router();

// @ts-ignore
router.use('/register', (req: Request, res: Response, next: any) => {
  authRateLimiter(req, res, next);
});
// @ts-ignore
router.use('/login', (req: Request, res: Response, next: any) => {
  authRateLimiter(req, res, next);
});

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax' as const, // Lax is safer for local dev with different ports
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/', // Set to root so it can be cleared/seen everywhere
};

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const { email, password, name, role, phone, organization, department, verificationData } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: { message: 'Email already registered' },
      });
      return;
    }

    const hashedPassword = await hashPassword(password);

    // Map role to access level (1-5)
    const roleToAccessLevel: Record<string, number> = {
      student: 1,
      retiree: 1,
      staff: 2,
      scientist: 3,
      entrepreneur: 3,
      politician: 4,
      admin: 5
    };

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'student',
        phone,
        organization,
        department,
        verificationData: verificationData ? JSON.stringify(verificationData) : null,
        accessLevel: roleToAccessLevel[role] || 1,
        verificationStatus: role === 'admin' ? 'verified' : 'pending'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        verificationStatus: true,
        createdAt: true
      },
    });

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json({
      success: true,
      data: { user, accessToken: tokens.accessToken },
    });
  } catch (error) {
    logger.error({ error }, 'Registration failed');
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' },
    });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: { message: 'Invalid credentials' },
      });
      return;
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });

    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken: tokens.accessToken,
      },
    });
  } catch (error) {
    logger.error({ error }, 'Login failed');
    res.status(500).json({
      success: false,
      error: { message: 'Login failed' },
    });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.json({ success: true, data: { message: 'Logged out' } });
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken as string | undefined;
    if (!refreshToken) {
      res.status(401).json({
        success: false,
        error: { message: 'No refresh token' },
      });
      return;
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });
    res.cookie('refreshToken', tokens.refreshToken, REFRESH_COOKIE_OPTIONS);
    // Return user object for frontend state sync (per prompt_15)
    res.json({
      success: true,
      data: {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken: tokens.accessToken
      },
    });
  } catch (error) {
    logger.warn({ error }, 'Refresh token invalid');
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.status(401).json({
      success: false,
      error: { message: 'Invalid refresh token' },
    });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: { message: 'User not found' },
      });
      return;
    }

    res.json({ success: true, data: { user } });
  } catch (error) {
    logger.error({ error }, 'Get user failed');
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user' },
    });
  }
});

export default router;
