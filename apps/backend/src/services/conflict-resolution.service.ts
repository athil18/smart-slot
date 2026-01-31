import { prisma } from '../lib/prisma.js';
import { AnalyticsService } from './analytics.service.js';

export class ConflictResolutionService {
    /**
     * Comprehensive conflict check for a proposed appointment.
     * Checks for overlaps, maintenance, and staff capacity.
     */
    static async detectConflicts(slotId: string) {
        const slot = await prisma.slot.findUnique({
            where: { id: slotId },
            include: {
                resource: {
                    include: {
                        maintenanceRecords: {
                            where: { status: 'pending' },
                        },
                    },
                },
            },
        });

        if (!slot) return { conflict: true, message: 'Slot not found' };
        if (slot.status !== 'available') return { conflict: true, message: 'Slot is no longer available' };

        // 1. Check for Resource Maintenance
        if (slot.resource?.maintenanceRecords.length) {
            const maintenance = slot.resource.maintenanceRecords.find(
                (m) =>
                    m.scheduledDate.getTime() <= slot.endTime.getTime() &&
                    m.scheduledDate.getTime() >= slot.startTime.getTime()
            );
            if (maintenance) {
                return { conflict: true, message: `Resource "${slot.resource.name}" is scheduled for maintenance.` };
            }
        }

        // 2. Check for Staff Fatigue
        const fatigue = await AnalyticsService.getStaffFatigueScore(slot.staffId);
        if (fatigue > 85) {
            return { conflict: true, message: 'Staff member is at maximum capacity for today.' };
        }

        return { conflict: false };
    }

    /**
     * Suggests alternative slots for the same resource or staff member.
     */
    static async suggestAlternatives(slotId: string) {
        const originalSlot = await prisma.slot.findUnique({ where: { id: slotId } });
        if (!originalSlot) return [];

        const alternatives = await prisma.slot.findMany({
            where: {
                OR: [
                    { resourceId: originalSlot.resourceId },
                    { staffId: originalSlot.staffId },
                ],
                startTime: { gte: originalSlot.startTime },
                status: 'available',
                id: { not: slotId },
                deletedAt: null,
            },
            take: 3,
            orderBy: { startTime: 'asc' },
        });

        return alternatives;
    }
}
