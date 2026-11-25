import express from 'express';
import { createLounge, getLoungeById } from '../controller/loungeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/v1/lounges
router.post('/', protect, createLounge);

// GET /api/v1/lounges/:id
router.get('/:id', protect, getLoungeById);

export default router;