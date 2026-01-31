import express from 'express';
import { createSlot, getAvailableSlots, deleteSlot } from '../controllers/slot.controller';
import { protect, authorize } from '../middleware/auth';
import { ROLES } from '@smartslot/shared';

const router = express.Router();

router.get('/', getAvailableSlots);
router.post('/', protect, authorize(ROLES.STAFF, ROLES.ADMIN), createSlot);
router.delete('/:id', protect, authorize(ROLES.STAFF, ROLES.ADMIN), deleteSlot);

export default router;
