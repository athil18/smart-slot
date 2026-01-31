import { Router, type Request, type Response } from 'express'; // @ts-nocheck
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { logger } from '../lib/logger.js';
import { SlotConflictService } from '../services/slot-conflict.service.js';
import { SmartSlotService } from '../services/smart-slot.service.js';
import { AIService } from '../services/ai.service.js';

const router = Router();

// Publicly viewable slots
router.get('/', async (req: Request, res: Response) => {
    try {
        const date = req.query['date'] as string | undefined;
        const type = req.query['type'] as string | undefined;
        const staffId = req.query['staffId'] as string | undefined;

        const where: any = {};
        if (date) {
            const startOfDay = new Date(date as string);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date as string);
            endOfDay.setHours(23, 59, 59, 999);

            where.startTime = {
                gte: startOfDay,
                lte: endOfDay
            };
        }

        if (type) {
            where.resource = { type };
        }

        if (staffId) {
            where.staffId = staffId;
        }

        where.deletedAt = null;

        // P2 Enhancement: Run smart scoring for this resource if applicable
        const resourceIdReq = req.query['resourceId'] as string | undefined;
        const resourceIdWhere = where['resourceId'] as string | undefined;
        const resourceId = resourceIdReq || resourceIdWhere;
        if (resourceId) {
            await SmartSlotService.scoreSlots(resourceId);
        }

        const slots = await prisma.slot.findMany({
            where,
            include: {
                staff: { select: { id: true, name: true } },
                resource: { select: { id: true, name: true, type: true } }
            },
            orderBy: [
                { smartScore: 'desc' } as any,
                { startTime: 'asc' } as any
            ]
        });

        res.json({ success: true, data: slots });
    } catch (error) {
        logger.error({ error }, 'Failed to fetch slots');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});


// Staff/Admin only: Create slots
router.post('/', authMiddleware, requireRole('staff', 'admin'), async (req: Request, res: Response) => {
    try {
        const { resourceId, startTime, endTime, isRecurring } = req.body;
        const staffId = req.user?.userId;

        if (!staffId) {
            res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
            return;
        }

        const start = new Date(startTime);
        const end = new Date(endTime);

        const hasOverlap = await SlotConflictService.checkOverlap({
            startTime: start,
            endTime: end,
            resourceId,
            staffId
        });

        if (hasOverlap) {
            res.status(409).json({
                success: false,
                error: { message: 'Slot check failed: Overlap detected with existing slot.' }
            });
            return;
        }

        const slot = await prisma.slot.create({
            data: {
                staffId,
                resourceId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                isRecurring: !!isRecurring,
                status: 'available'
            },
            include: {
                staff: { select: { name: true } },
                resource: { select: { name: true, type: true } }
            }
        });

        // P3: Apply AI Reasoning Agent for optimization feedback
        const aiAnalysis = await AIService.applyReasoningAgent(
            `Create slot: ${startTime} to ${endTime} for ${resourceId}`,
            `Staff: ${staffId}, Resource: ${resourceId}`
        );

        res.status(201).json({
            success: true,
            data: {
                ...slot,
                aiExplanation: aiAnalysis.recommendation.explanation,
                aiReasoningSteps: aiAnalysis.reasoningSteps
            }
        });
    } catch (error) {
        logger.error({ error }, 'Failed to create slot');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

// Staff/Admin only: Bulk Create slots
router.post('/bulk', authMiddleware, requireRole('staff', 'admin'), async (req: Request, res: Response) => {
    try {
        const { resourceId, startTime, endTime, daysOfWeek, repeatCount } = req.body; // daysOfWeek: [0-6], repeatCount: weeks
        const staffId = req.user?.userId;

        if (!staffId) {
            res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
            return;
        }

        const baseStart = new Date(startTime);
        const baseEnd = new Date(endTime);
        const duration = baseEnd.getTime() - baseStart.getTime();
        const slotsToCreate: any[] = [];

        // Generate connection candidates
        for (let i = 0; i < (repeatCount || 1); i++) {
            const weekOffset = i * 7 * 24 * 60 * 60 * 1000;

            for (const day of (daysOfWeek || [baseStart.getDay()])) {
                // Calculate date for this specific occurrence
                const currentStart = new Date(baseStart.getTime() + weekOffset);
                // Adjust to target day of week
                const currentDay = currentStart.getDay();
                const dayDiff = day - currentDay + (day < currentDay ? 7 : 0);

                // If we are just repeating generic "weeks", simple offset might be better, 
                // but strict Day-of-Week logic is safer for "Every Mon/Wed"
                currentStart.setDate(currentStart.getDate() + dayDiff);

                // Validate it's not in the past relative to request if desired (skipping for now)

                const currentEnd = new Date(currentStart.getTime() + duration);

                slotsToCreate.push({
                    staffId,
                    resourceId,
                    startTime: currentStart,
                    endTime: currentEnd,
                    isRecurring: true,
                    status: 'available',
                    version: 1
                });
            }
        }

        // Transactional Check & Write
        await prisma.$transaction(async (tx) => {
            // 1. Check all overlaps purely in DB or via Logic
            // Optimization: Check range of entire batch first? 
            // For safety P0, we check each candidate. In P2 bulk Optimization, we can range-check.

            for (const slot of slotsToCreate) {
                const hasOverlap = await SlotConflictService.checkOverlap({
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    resourceId,
                    staffId
                });

                if (hasOverlap) throw new Error(`Overlap detected for ${slot.startTime.toISOString()}`);
            }

            // 2. Bulk insert
            // createMany is not supported in SQLite sometimes with relations? No, it is standard in Prisma for SQLite.
            // But we can't use createMany if we need to return IDs easily (though not critical here).
            // Actually, Prisma createMany is supported in SQLite.

            await tx.slot.createMany({
                data: slotsToCreate
            });
        });

        res.status(201).json({ success: true, data: { count: slotsToCreate.length, message: 'Bulk slots created successfully' } });
    } catch (error: any) {
        logger.error({ error }, 'Failed to create bulk slots');
        const isConflict = error.message.includes('Overlap detected');
        res.status(isConflict ? 409 : 500).json({
            success: false,
            error: { message: isConflict ? error.message : 'Internal server error' }
        });
    }
});

// Staff/Admin only: Delete slots
router.delete('/:id', authMiddleware, requireRole('staff', 'admin'), async (req: Request, res: Response) => {
    try {
        const id = req.params['id'] as string;
        const userId = req.user?.userId;

        const slot = await prisma.slot.findUnique({ where: { id } });
        if (!slot) {
            res.status(404).json({ success: false, error: { message: 'Slot not found' } });
            return;
        }

        // Only the staff who created it or an admin can delete
        if (slot.staffId !== userId && req.user?.role !== 'admin') {
            res.status(403).json({ success: false, error: { message: 'Forbidden' } });
            return;
        }

        if (slot.status === 'booked') {
            res.status(400).json({ success: false, error: { message: 'Cannot delete a booked slot. Cancel the appointment first.' } });
            return;
        }

        // Soft delete
        await prisma.slot.update({
            where: { id },
            data: { deletedAt: new Date() }
        });

        res.json({ success: true, data: { message: 'Slot deleted' } });
    } catch (error) {
        logger.error({ error }, 'Failed to delete slot');
        res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

export default router;
