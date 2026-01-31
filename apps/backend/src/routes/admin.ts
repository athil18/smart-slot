import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { hashPassword } from '../lib/password.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Admin routes require admin role
router.get('/stats', authMiddleware, requireRole('admin'), async (_req: Request, res: Response) => {
    try {
        const [userCount] = await Promise.all([
            prisma.user.count(),
        ]);

        const stats = {
            summary: {
                users: userCount,
                slots: 0,
                appointments: 0,
                resources: 0,
            },
            charts: { bookingsByDay: [] },
            recentLogs: [],
        };

        return res.json({ success: true, data: stats });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// GET /users - List all users
router.get('/users', authMiddleware, requireRole('admin'), async (_req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                organization: true,
                department: true,
                verificationStatus: true,
                verificationData: true,
                phone: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json({ success: true, data: users });
    } catch (error) {
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// POST /users - Create new user
router.post('/users', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        // Basic validation
        if (!email || !password || !role) {
            return res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ success: false, error: { message: 'User already exists' } });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                verificationStatus: role === 'admin' ? 'verified' : 'pending'
            },
            select: { id: true, name: true, email: true, role: true, verificationStatus: true, createdAt: true }
        });

        return res.status(201).json({ success: true, data: newUser });
    } catch (error) {
        logger.error({ error }, 'Failed to create user');
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// PUT /users/:id - Update user
router.put('/users/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;
        const { name, email, role } = req.body;

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });

        return res.json({ success: true, data: updatedUser });
    } catch (error) {
        logger.error({ error }, 'Failed to update user');
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// PATCH /users/:id/verify - Approve or reject verification
router.patch('/users/:id/verify', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;
        const { status, reason } = req.body;

        if (!['verified', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, error: { message: 'Invalid status' } });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: {
                verificationStatus: status,
                rejectionReason: status === 'rejected' ? reason : null,
                verifiedAt: status === 'verified' ? new Date() : null,
                verifiedBy: status === 'verified' ? (req.user?.userId as string) : null
            },
            select: { id: true, name: true, verificationStatus: true }
        });

        logger.info({ userId: id, status }, 'User verification updated');
        return res.json({ success: true, data: updatedUser });
    } catch (error) {
        logger.error({ error }, 'Failed to verify user');
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// DELETE /users/:id - Delete user
router.delete('/users/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;
        await prisma.user.delete({ where: { id } });
        return res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        logger.error({ error }, 'Failed to delete user');
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

export default router;
