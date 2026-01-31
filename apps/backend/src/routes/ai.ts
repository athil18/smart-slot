import { Router, type Request, type Response } from 'express';
import { AIService } from '../services/ai.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Apply authMiddleware
router.use(authMiddleware);

/**
 * POST /ai/audit
 * Audits a given prompt across 7 dimensions.
 */
router.post('/audit', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, error: { message: 'Prompt is required' } });
        }

        const result = await AIService.auditPrompt(prompt);
        return res.json({ success: true, data: result });
    } catch (error) {
        logger.error({ error }, 'Failed to audit prompt');
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

/**
 * POST /ai/refactor
 * Returns refactored versions of a prompt.
 */
router.post('/refactor', async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ success: false, error: { message: 'Prompt is required' } });
        }
        const result = await AIService.refactorPrompt(prompt);
        return res.json({ success: true, data: result });
    } catch (error) {
        logger.error({ error }, 'Failed to refactor prompt');
        return res.status(500).json({ success: false, error: { message: 'Internal server error' } });
    }
});

export default router;
