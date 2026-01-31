import { Router, type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Publicly viewable
router.get('/', async (_req: Request, res: Response) => {
    try {
        const resources = await prisma.resource.findMany({
            where: { deletedAt: null },
            include: {
                maintenanceRecords: {
                    where: { status: 'pending' },
                    take: 1,
                    orderBy: { scheduledDate: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: resources });
    } catch (error) {
        logger.error({ error }, 'Failed to fetch resources');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// Admin only operations
router.post('/', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const { name, type, capacity } = req.body;
        const resource = await prisma.resource.create({
            data: { name, type, capacity: parseInt(capacity) || 1 }
        });
        res.status(201).json({ success: true, data: resource });
    } catch (error) {
        logger.error({ error }, 'Failed to create resource');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

router.put('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;
        const { name, type, capacity, status, version } = req.body;

        // Optimistic Concurrency Control
        // We find the resource first to check existence (optional, but good for error messaging)
        // ideally efficient: UPDATE ... WHERE id=? AND version=?

        // However, Prisma updateMany does not return the updated record easily without a second query 
        // or using interactive transaction.
        // Let's use simple check-then-act logic within a transaction or just updateMany and check count.

        const count = await prisma.resource.updateMany({
            where: {
                id,
                version: Number(version),
                deletedAt: null
            },
            data: {
                name,
                type,
                capacity: parseInt(capacity),
                status,
                version: { increment: 1 }
            }
        });

        if (count.count === 0) {
            // Check if it exists at all to differentiate 404 vs 409
            const exists = await prisma.resource.findUnique({ where: { id } });
            if (!exists || exists.deletedAt) {
                res.status(404).json({ success: false, error: { message: 'Resource not found' } });
            } else {
                res.status(409).json({ success: false, error: { message: 'Conflict: Resource has been modified by another user.' } });
            }
            return;
        }

        const resource = await prisma.resource.findUnique({ where: { id } });
        res.json({ success: true, data: resource });
    } catch (error) {
        logger.error({ error }, 'Failed to update resource');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

router.delete('/:id', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;

        // Soft delete
        await prisma.resource.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        res.json({ success: true, data: { message: 'Resource deleted' } });
    } catch (error) {
        logger.error({ error }, 'Failed to delete resource');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// Maintenance Management
router.post('/:id/maintenance', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;
        const { type, scheduledDate, notes } = req.body;

        const maintenance = await prisma.resourceMaintenance.create({
            data: {
                resourceId: id,
                type,
                scheduledDate: new Date(scheduledDate),
                notes,
                status: 'pending'
            }
        });

        res.status(201).json({ success: true, data: maintenance });
    } catch (error) {
        logger.error({ error }, 'Failed to schedule maintenance');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

router.patch('/maintenance/:recordId', authMiddleware, requireRole('admin'), async (req: Request, res: Response) => {
    try {
        const recordId = req.params['recordId'] as string;
        const { status, notes } = req.body;

        const updated = await prisma.resourceMaintenance.update({
            where: { id: recordId },
            data: { status, notes }
        });

        // If completed, update the resource's last maintenance date
        if (status === 'completed') {
            await prisma.resource.update({
                where: { id: updated.resourceId },
                data: { lastMaintenanceDate: new Date() }
            });
        }

        res.json({ success: true, data: updated });
    } catch (error) {
        logger.error({ error }, 'Failed to update maintenance record');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

export default router;
