import { prisma } from '../lib/prisma.js';

export class AnalyticsService {
    /**
     * Increments the usage count of a resource.
     * Useful for tracking equipment wear and tear.
     */
    static async trackResourceUsage(resourceId: string): Promise<void> {
        await prisma.resource.update({
            where: { id: resourceId },
            data: {
                usageCount: {
                    increment: 1,
                },
            },
        });
    }

    /**
     * Calculates a fatigue score for a staff member based on their recent appointments.
     * Returns a score from 0 (fresh) to 100 (exhausted).
     */
    static async getStaffFatigueScore(staffId: string): Promise<number> {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const dailySlots = await prisma.slot.findMany({
            where: {
                staffId,
                startTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: 'booked',
                deletedAt: null,
            },
        });

        // Simple heuristic: Each hour of work adds 20 points
        let totalWorkHours = 0;
        dailySlots.forEach((slot) => {
            const durationHours = (slot.endTime.getTime() - slot.startTime.getTime()) / (1000 * 60 * 60);
            totalWorkHours += durationHours;
        });

        const score = Math.min(100, totalWorkHours * 15); // max 100
        return score;
    }
}
