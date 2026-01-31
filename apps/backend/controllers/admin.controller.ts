import { Request, Response } from 'express';
import { User, Slot, Appointment, Resource, AuditLog } from '../models';
import { Op, fn, col } from 'sequelize';
import { ROLES, SLOT_STATUS } from '@smartslot/shared';

export const getStats = async (req: Request, res: Response) => {
    try {
        const [userCount, slotCount, appointmentCount, resourceCount] = await Promise.all([
            User.count({ where: { role: ROLES.CLIENT } }),
            Slot.count({ where: { status: SLOT_STATUS.AVAILABLE } }),
            Appointment.count(),
            Resource.count()
        ]);

        // Aggregate bookings by day for the last 7 days
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const bookingsByDay = await Appointment.findAll({
            where: {
                createdAt: { [Op.gte]: last7Days }
            },
            attributes: [
                [fn('date_trunc', 'day', col('createdAt')), 'day'],
                [fn('count', col('id')), 'count']
            ],
            group: [fn('date_trunc', 'day', col('createdAt'))],
            order: [[fn('date_trunc', 'day', col('createdAt')), 'ASC']],
            raw: true
        }) as any[];

        // Format chart data
        const formattedChart = bookingsByDay.map(d => ({
            day: new Date(d.day).toISOString().split('T')[0],
            count: parseInt(d.count)
        }));

        // Recent Audit Logs
        const recentLogs = await AuditLog.findAll({
            include: [{ model: User, as: 'performedBy', attributes: ['name'] }],
            order: [['timestamp', 'DESC']],
            limit: 5
        });

        res.json({
            summary: {
                users: userCount,
                slots: slotCount,
                appointments: appointmentCount,
                resources: resourceCount
            },
            charts: {
                bookingsByDay: formattedChart
            },
            recentLogs
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
