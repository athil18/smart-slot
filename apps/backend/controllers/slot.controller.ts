import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Slot, Resource, User } from '../models';
import logger from '../utils/logger';

export const createSlot = async (req: Request, res: Response) => {
    try {
        const { startTime, endTime, resourceId, isRecurring } = req.body;
        const staffId = req.user?.id;

        if (!staffId) {
            return res.status(401).json({ message: 'User context missing' });
        }

        // Check for overlapping slots for the same staff
        const overlap = await Slot.findOne({
            where: {
                staffId,
                [Op.or]: [
                    {
                        startTime: { [Op.lt]: endTime, [Op.gte]: startTime }
                    },
                    {
                        endTime: { [Op.gt]: startTime, [Op.lte]: endTime }
                    }
                ]
            }
        });

        if (overlap) {
            return res.status(400).json({ message: 'Slot overlaps with an existing one' });
        }

        const slot = await Slot.create({
            staffId,
            resourceId,
            startTime,
            endTime,
            isRecurring
        });

        res.status(201).json(slot);
        logger.info(`Slot created by staff: ${staffId}`);
    } catch (error: any) {
        logger.error(`Slot Creation Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const getAvailableSlots = async (req: Request, res: Response) => {
    try {
        const { type, staff, date } = req.query as { type?: string; staff?: string; date?: string };
        let where: any = { status: 'available' };
        let resourceInclude: any = { model: Resource, as: 'resource' };

        // Filter by Resource Type
        if (type && type !== 'all') {
            resourceInclude.where = { type };
        }

        // Filter by Staff
        if (staff && staff !== 'all') {
            where.staffId = staff;
        }

        // Filter by Date
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            where.startTime = { [Op.between]: [startOfDay, endOfDay] };
        }

        const slots = await Slot.findAll({
            where,
            include: [
                { model: User, as: 'staff', attributes: ['name'] },
                resourceInclude
            ]
        });
        res.json(slots);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteSlot = async (req: Request, res: Response) => {
    try {
        const slot = await Slot.findByPk(req.params.id as string);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.status === 'booked') {
            return res.status(400).json({ message: 'Cannot delete a booked slot' });
        }

        await slot.destroy();
        res.json({ message: 'Slot removed' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
