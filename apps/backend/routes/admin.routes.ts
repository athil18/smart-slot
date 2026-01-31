import express from 'express';
import { getStats } from '../controllers/admin.controller';
import { protect, authorize } from '../middleware/auth';
import { ROLES } from '@smartslot/shared';

const router = express.Router();

router.get('/stats', getStats);

export default router;
