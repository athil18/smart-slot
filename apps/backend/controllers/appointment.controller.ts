import { Request, Response } from 'express';
import { Appointment, Slot, AuditLog, User, Resource } from '../models';
import { sequelize } from '../utils/db';
import logger from '../utils/logger';
import { APPOINTMENT_STATUS, ROLES, SLOT_STATUS } from '@smartslot/shared';

export const bookAppointment = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { slotId, priority, notes } = req.body;
        const clientId = req.user?.id;

        if (!clientId) {
            await t.rollback();
            return res.status(401).json({ message: 'User context missing' });
        }

        const slot = await Slot.findByPk(slotId, { transaction: t });
        if (!slot || slot.status !== SLOT_STATUS.AVAILABLE) {
            await t.rollback();
            return res.status(400).json({ message: 'Slot not available' });
        }

        // Mark slot as booked
        slot.status = SLOT_STATUS.BOOKED;
        await slot.save({ transaction: t });

        const appointment = await Appointment.create({
            clientId,
            slotId,
            priority,
            notes
        }, { transaction: t });

        // Log the action
        await AuditLog.create({
            action: 'BOOK_APPOINTMENT',
            performedById: clientId,
            details: { appointmentId: appointment.id, slotId }
        }, { transaction: t });

        await t.commit();
        res.status(201).json(appointment);
        logger.info(`Appointment booked: ${appointment.id} by client ${clientId}`);
    } catch (error: any) {
        await t.rollback();
        logger.error(`Booking Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

export const cancelAppointment = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const appointment = await Appointment.findByPk(req.params.id as string, { transaction: t });
        if (!appointment) {
            await t.rollback();
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const user = req.user;
        if (!user) {
            await t.rollback();
            return res.status(401).json({ message: 'Context missing' });
        }

        // Check if user is owner or staff/admin
        if (appointment.clientId !== user.id && ![ROLES.STAFF, ROLES.ADMIN].includes(user.role as any)) {
            await t.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        appointment.status = APPOINTMENT_STATUS.CANCELLED;
        await appointment.save({ transaction: t });

        // Free the slot
        const slot = await Slot.findByPk(appointment.slotId, { transaction: t });
        if (slot) {
            slot.status = SLOT_STATUS.AVAILABLE;
            await slot.save({ transaction: t });
        }

        await AuditLog.create({
            action: 'CANCEL_APPOINTMENT',
            performedById: user.id,
            details: { appointmentId: appointment.id }
        }, { transaction: t });

        await t.commit();
        res.json({ message: 'Appointment cancelled' });
    } catch (error: any) {
        await t.rollback();
        res.status(500).json({ message: error.message });
    }
};

export const getMyAppointments = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Context missing' });
        }

        const appointments = await Appointment.findAll({
            where: { clientId: userId },
            include: [{
                model: Slot,
                as: 'slot',
                include: [
                    { model: User, as: 'staff', attributes: ['name'] },
                    { model: Resource, as: 'resource', attributes: ['name'] }
                ]
            }]
        });
        res.json(appointments);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rescheduleAppointment = async (req: Request, res: Response) => {
    const t = await sequelize.transaction();
    try {
        const { appointmentId, newSlotId } = req.body;
        const clientId = req.user?.id;

        if (!clientId) {
            await t.rollback();
            return res.status(401).json({ message: 'Context missing' });
        }

        const oldAppointment = await Appointment.findByPk(appointmentId, { transaction: t });
        if (!oldAppointment) {
            await t.rollback();
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (oldAppointment.clientId !== clientId) {
            await t.rollback();
            return res.status(403).json({ message: 'Not authorized' });
        }

        const newSlot = await Slot.findByPk(newSlotId, { transaction: t });
        if (!newSlot || newSlot.status !== SLOT_STATUS.AVAILABLE) {
            await t.rollback();
            return res.status(400).json({ message: 'New slot not available' });
        }

        // 1. Free old slot
        const oldSlot = await Slot.findByPk(oldAppointment.slotId, { transaction: t });
        if (oldSlot) {
            oldSlot.status = SLOT_STATUS.AVAILABLE;
            await oldSlot.save({ transaction: t });
        }

        // 2. Mark old appointment as rescheduled
        oldAppointment.status = APPOINTMENT_STATUS.RESCHEDULED;
        await oldAppointment.save({ transaction: t });

        // 3. Create new appointment
        const newAppointment = await Appointment.create({
            clientId,
            slotId: newSlotId,
            priority: oldAppointment.priority,
            notes: `Rescheduled from ${appointmentId}. ${oldAppointment.notes || ''}`,
            rescheduledFrom: appointmentId
        }, { transaction: t });

        // 4. Mark new slot as booked
        newSlot.status = SLOT_STATUS.BOOKED;
        await newSlot.save({ transaction: t });

        // Log the action
        await AuditLog.create({
            action: 'RESCHEDULE_APPOINTMENT',
            performedById: clientId,
            details: { oldAppointmentId: appointmentId, newAppointmentId: newAppointment.id }
        }, { transaction: t });

        await t.commit();
        res.json(newAppointment);
        logger.info(`Appointment rescheduled: ${appointmentId} -> ${newAppointment.id}`);
    } catch (error: any) {
        await t.rollback();
        logger.error(`Rescheduling Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};
