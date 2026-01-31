import { prisma } from '../lib/prisma.js';

export class SlotConflictService {
    /**
     * Checks for overlapping slots for a given resource or staff member.
     * Returns true if an overlap exists.
     */
    static async checkOverlap(
        input: {
            startTime: Date;
            endTime: Date;
            resourceId?: string;
            staffId?: string;
            excludeSlotId?: string;
        }
    ): Promise<boolean> {
        const { startTime, endTime, resourceId, staffId, excludeSlotId } = input;

        const where: any = {
            // Check for time overlap: (StartA < EndB) AND (EndA > StartB)
            startTime: { lt: endTime },
            endTime: { gt: startTime },
            // Exclude soft-deleted slots
            deletedAt: null,
            NOT: excludeSlotId ? { id: excludeSlotId } : undefined,
        };

        if (resourceId) {
            // Check resource overlap
            const resourceOverlap = await prisma.slot.findFirst({
                where: {
                    ...where,
                    resourceId,
                },
            });
            if (resourceOverlap) return true;
        }

        if (staffId) {
            // Check staff overlap
            const staffOverlap = await prisma.slot.findFirst({
                where: {
                    ...where,
                    staffId,
                },
            });
            if (staffOverlap) return true;
        }

        return false;
    }
}
