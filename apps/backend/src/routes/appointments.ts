import { Router, type Request, type Response, type NextFunction } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { AppointmentService } from '../services/appointment.service.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// Apply authMiddleware to all routes
router.use(authMiddleware);

/**
 * GET /appointments/my
 * Get appointments for the current user
 */
router.get('/my', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const role = req.user?.role;
        const { status, page, limit } = req.query;

        if (!userId || !role) {
            throw new AppError('Unauthorized', 401);
        }

        const params: { status?: string; page?: string; limit?: string } = {};
        if (status) params.status = status as string;
        if (page) params.page = page as string;
        if (limit) params.limit = limit as string;

        const result = await AppointmentService.getUserAppointments(
            userId,
            role,
            params
        );

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /appointments/:id
 * Get specific appointment details
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const rawUserId = req.user?.userId;
        const rawRole = req.user?.role;

        const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
        const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;

        if (!userId || !role) {
            throw new AppError('Unauthorized', 401);
        }

        const appointment = await AppointmentService.getAppointmentById(
            String(id),
            String(userId),
            String(role)
        );
        res.json({ success: true, data: appointment });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /appointments
 * Create a new booking
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        const { slotId, notes, priority } = req.body;

        // Allow all client-type roles to book
        const clientRoles = ['client', 'student', 'scientist', 'entrepreneur', 'retiree', 'politician'];
        if (!clientRoles.includes(req.user?.role || '')) {
            throw new AppError('Only clients/students can book appointments', 403);
        }

        if (!userId) {
            throw new AppError('Unauthorized', 401);
        }

        const result = await AppointmentService.createAppointment({
            userId,
            slotId,
            notes,
            priority
        });

        res.status(201).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /appointments/:id/cancel
 * Cancel an appointment
 */
router.patch('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) {
            throw new AppError('Unauthorized', 401);
        }

        const result = await AppointmentService.cancelAppointment(id as string, userId, role);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * PATCH /appointments/:id
 * Reschedule an appointment
 */
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { newSlotId } = req.body;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) {
            throw new AppError('Unauthorized', 401);
        }

        const result = await AppointmentService.rescheduleAppointment(id as string, newSlotId, userId, role);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /appointments/:id
 * Hard delete (mapped to cancel for safety, or implement hard delete if strictly required)
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const role = req.user?.role;

        if (!userId || !role) {
            throw new AppError('Unauthorized', 401);
        }

        // Using cancel logic for safety as per optimized prompt recommendations
        await AppointmentService.cancelAppointment(id as string, userId, role);

        res.json({ success: true, data: { message: 'Appointment cancelled' } });
    } catch (error) {
        next(error);
    }
});

export default router;
