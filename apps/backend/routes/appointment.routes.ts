import express from 'express';
import { bookAppointment, cancelAppointment, getMyAppointments, rescheduleAppointment } from '../controllers/appointment.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/', protect, bookAppointment);
router.post('/reschedule', protect, rescheduleAppointment);
router.delete('/:id', protect, cancelAppointment);
router.get('/my', protect, getMyAppointments);

export default router;
