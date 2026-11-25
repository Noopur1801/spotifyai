import express from 'express';
import { requestAiSegue } from '../controller/aiController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/v1/lounges/:id/ai/segue
router.post('/:id/ai/segue', protect, authorize('host', 'co_dj'), requestAiSegue);

export default router;