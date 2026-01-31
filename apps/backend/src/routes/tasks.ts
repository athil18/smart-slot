import { Router } from 'express';
import type { Request, Response } from 'express';
import { taskRepository } from '../repositories/task.repository.js';
import { createTaskSchema, listTasksSchema } from '../validators/task.validators.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { logger } from '../lib/logger.js';

/* eslint-disable @typescript-eslint/no-misused-promises */
const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const parsed = listTasksSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const result = await taskRepository.findManyWithPagination({
      userId,
      page: parsed.data.page,
      limit: parsed.data.limit,
      sortBy: parsed.data.sortBy,
      order: parsed.data.order,
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      ...(parsed.data.search !== undefined && { search: parsed.data.search }),
    });

    res.json({ success: true, data: result });
  } catch (error) {
    logger.error({ error }, 'List tasks failed');
    res.status(500).json({ success: false, error: { message: 'Failed to list tasks' } });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const id = req.params['id'] as string;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Task ID required' } });
      return;
    }
    const task = await taskRepository.findById(id);

    if (!task) {
      res.status(404).json({ success: false, error: { message: 'Task not found' } });
      return;
    }

    if (task.userId !== userId) {
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      return;
    }

    res.json({ success: true, data: { task } });
  } catch (error) {
    logger.error({ error }, 'Get task failed');
    res.status(500).json({ success: false, error: { message: 'Failed to get task' } });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const task = await taskRepository.create({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      status: parsed.data.status,
      user: { connect: { id: userId } },
    });

    res.status(201).json({ success: true, data: { task } });
  } catch (error) {
    logger.error({ error }, 'Create task failed');
    res.status(500).json({ success: false, error: { message: 'Failed to create task' } });
  }
});

router.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const id = req.params['id'] as string;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Task ID required' } });
      return;
    }

    const { updateTaskSchema } = await import('../validators/task.validators.js');
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        error: { message: 'Validation failed', details: parsed.error.flatten() },
      });
      return;
    }

    const existingTask = await taskRepository.findById(id);
    if (!existingTask) {
      res.status(404).json({ success: false, error: { message: 'Task not found' } });
      return;
    }

    if (existingTask.userId !== userId) {
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      return;
    }

    if (parsed.data.updatedAt) {
      const clientUpdatedAt = new Date(parsed.data.updatedAt).getTime();
      const serverUpdatedAt = existingTask.updatedAt.getTime();
      if (clientUpdatedAt !== serverUpdatedAt) {
        res.status(409).json({
          success: false,
          error: { message: 'Conflict: Task was modified. Refresh and try again.' },
        });
        return;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) updateData['title'] = parsed.data.title;
    if (parsed.data.description !== undefined) updateData['description'] = parsed.data.description;
    if (parsed.data.status !== undefined) updateData['status'] = parsed.data.status;

    const task = await taskRepository.update(id, updateData);

    res.json({ success: true, data: { task } });
  } catch (error) {
    logger.error({ error }, 'Update task failed');
    res.status(500).json({ success: false, error: { message: 'Failed to update task' } });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const id = req.params['id'] as string;
    if (!id) {
      res.status(400).json({ success: false, error: { message: 'Task ID required' } });
      return;
    }

    const existingTask = await taskRepository.findByIdActive(id);
    if (!existingTask) {
      res.status(404).json({ success: false, error: { message: 'Task not found' } });
      return;
    }

    if (existingTask.userId !== userId) {
      res.status(403).json({ success: false, error: { message: 'Forbidden' } });
      return;
    }

    await taskRepository.softDelete(id);

    res.json({ success: true, data: { message: 'Task deleted' } });
  } catch (error) {
    logger.error({ error }, 'Delete task failed');
    res.status(500).json({ success: false, error: { message: 'Failed to delete task' } });
  }
});

export default router;
