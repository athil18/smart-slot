import express from 'express';
import { createResource, getResources, updateResource, deleteResource } from '../controllers/resource.controller';
import { protect, authorize } from '../middleware/auth';
import { ROLES } from '@smartslot/shared';

const router = express.Router();

router.get('/', getResources);
router.post('/', protect, authorize(ROLES.ADMIN), createResource);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateResource);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteResource);

export default router;
