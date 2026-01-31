import { prisma } from '../lib/prisma.js';
import { ConflictResolutionService } from './conflict-resolution.service.js';
import { AnalyticsService } from './analytics.service.js';
import { AIService } from './ai.service.js';
import { AppError } from '../middleware/error-handler.js';
import { logger } from '../lib/logger.js';
import { paginate } from '../utils/pagination.js';

interface CreateAppointmentDTO {
    userId: string;
    slotId: string;
    notes?: string;
    priority?: string;
}

export class AppointmentService {
    /**
     * Get appointments for a user with pagination
     */
    static async getUserAppointments(
        userId: string,
        role: string,
        params: { status?: string; page?: string; limit?: string }
    ) {
        const where: any = {};
        if (role === 'client') {
            where.clientId = userId;
        } else if (role === 'staff') {
            where.slot = { staffId: userId };
        } else if (role !== 'admin') {
            // Safer default for other roles (student, scientist, etc.)
            // Assuming they act as clients for now unless specified otherwise
            where.clientId = userId;
        }

        if (params.status) {
            where.status = params.status;
        }

        return paginate(
            prisma.appointment,
            {
                where,
                include: {
                    slot: {
                        include: {
                            staff: { select: { name: true } },
                            resource: { select: { name: true, type: true } }
                        }
                    }
                },
                orderBy: { slot: { startTime: 'asc' } }
            },
            {
                page: params.page ? Number(params.page) : undefined,
                limit: params.limit ? Number(params.limit) : undefined
            }
        );
    }

    /**
     * Get appointment by ID with security check
     */
    static async getAppointmentById(id: string, userId: string, role: string) {
        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                slot: {
                    include: {
                        staff: { select: { name: true } },
                        resource: { select: { name: true, type: true } }
                    }
                },
                client: { select: { name: true, email: true } }
            }
        });

        if (!appointment) {
            throw new AppError('Appointment not found', 404);
        }

        // Security check
        if (
            role !== 'admin' &&
            appointment.clientId !== userId &&
            appointment.slot.staffId !== userId
        ) {
            throw new AppError('Forbidden', 403);
        }

        return appointment;
    }

    /**
     * Create a new appointment
     */
    static async createAppointment(dto: CreateAppointmentDTO) {
        const { userId, slotId, notes, priority } = dto;

        // 1. Conflict Detection
        const conflict = await ConflictResolutionService.detectConflicts(slotId);
        if (conflict.conflict) {
            const alternatives = await ConflictResolutionService.suggestAlternatives(slotId);
            const error: any = new AppError((conflict.message || 'Slot conflict detected') as string, 400);
            error.alternatives = alternatives; // Attach alternatives to error object
            throw error;
        }

        return prisma.$transaction(async (tx) => {
            const slot = await tx.slot.findUnique({ where: { id: slotId } });

            if (!slot) throw new AppError('Slot not found', 404);
            if (slot.status !== 'available') throw new AppError('Slot is no longer available', 409);

            // 2. Create Appointment
            const appointment = await tx.appointment.create({
                data: {
                    clientId: userId,
                    slotId,
                    notes: notes || null,
                    priority: priority || 'normal',
                    status: 'confirmed'
                },
                include: {
                    slot: {
                        include: {
                            staff: { select: { name: true } },
                            resource: { select: { name: true, type: true } }
                        }
                    }
                }
            });

            // 3. Update Slot
            await tx.slot.update({
                where: { id: slotId },
                data: { status: 'booked' }
            });

            // 4. Analytics
            if (slot.resourceId) {
                // Fire and forget analytics
                AnalyticsService.trackResourceUsage(slot.resourceId).catch(err =>
                    logger.error({ error: err }, 'Analytics error')
                );
            }

            // 5. AI Workflow
            this.triggerAIWorkflow(appointment, slot, notes ?? '', priority || 'normal').catch(err =>
                logger.error({ error: err }, 'AI Workflow error')
            );

            return appointment;
        });
    }

    /**
     * Trigger AI tasks (detached from main transaction for speed)
     */
    private static async triggerAIWorkflow(appointment: any, slot: any, notes?: string, priority?: string) {
        try {
            const aiTasks = await AIService.generateWorkflowTasks({
                resourceName: slot.resource?.name || 'Unknown Resource',
                resourceType: slot.resource?.type || 'other',
                priority: priority || 'normal',
                notes: notes || ''
            });

            await Promise.all(aiTasks.map(t =>
                prisma.task.create({
                    data: {
                        title: t.title,
                        description: t.description,
                        status: 'active',
                        userId: slot.staffId
                    }
                })
            ));
            logger.info({ appointmentId: appointment.id, count: aiTasks.length }, 'AI workflow tasks generated');
        } catch (error) {
            logger.error({ error }, 'Failed to generate AI workflow tasks');
        }
    }

    /**
     * Cancel an appointment
     */
    static async cancelAppointment(id: string, userId: string, role: string) {
        const appointment = await this.getAppointmentById(id, userId, role);

        return prisma.$transaction(async (tx) => {
            const app = await tx.appointment.update({
                where: { id },
                data: { status: 'cancelled' },
                include: { slot: true }
            });

            await tx.slot.update({
                where: { id: appointment.slotId },
                data: { status: 'available' }
            });

            return app;
        });
    }

    /**
     * Reschedule appointment
     */
    static async rescheduleAppointment(id: string, newSlotId: string, userId: string, role: string) {
        const appointment = await this.getAppointmentById(id, userId, role);

        if (appointment.clientId !== userId && role !== 'admin') {
            throw new AppError('Only the client can reschedule', 403);
        }

        return prisma.$transaction(async (tx) => {
            // Free old slot
            await tx.slot.update({
                where: { id: appointment.slotId },
                data: { status: 'available' }
            });

            // Book new slot
            const newSlot = await tx.slot.findUnique({ where: { id: newSlotId } });
            if (!newSlot || newSlot.status !== 'available') {
                throw new AppError('New slot is not available', 409);
            }

            await tx.slot.update({
                where: { id: newSlotId },
                data: { status: 'booked' }
            });

            // Update appointment
            return tx.appointment.update({
                where: { id },
                data: { slotId: newSlotId, status: 'confirmed' },
                include: {
                    slot: {
                        include: {
                            staff: { select: { name: true } },
                            resource: { select: { name: true, type: true } }
                        }
                    }
                }
            });
        });
    }
}
