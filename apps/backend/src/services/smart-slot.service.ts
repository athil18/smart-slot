import { prisma } from '../lib/prisma.js';

export class SmartSlotService {
    /**
     * Assigns a "Smart Score" to available slots based on demand and resource health.
     * High score = Preferred for booking.
     */
    static async scoreSlots(resourceId: string) {
        const slots = await prisma.slot.findMany({
            where: {
                resourceId,
                status: 'available',
                deletedAt: null,
            },
            include: {
                resource: true,
            }
        });

        const scoredSlots = slots.map((slot) => {
            let score = 50; // Base score

            // 1. Demand Prediction (Heuristic: Mornings are popular)
            const hour = slot.startTime.getHours();
            if (hour >= 9 && hour <= 11) {
                score += 20;
                slot.demandPrediction = 'high';
            } else if (hour >= 13 && hour <= 15) {
                score += 10;
                slot.demandPrediction = 'medium';
            } else {
                slot.demandPrediction = 'low';
            }

            // 2. Resource Health (Encourage using "available" but healthy resources)
            if (slot.resource?.usageCount && slot.resource.usageCount < 50) {
                score += 10;
            }

            return prisma.slot.update({
                where: { id: slot.id },
                data: {
                    smartScore: score,
                    demandPrediction: slot.demandPrediction,
                },
            });
        });

        return Promise.all(scoredSlots);
    }
}
