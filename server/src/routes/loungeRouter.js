import express from 'express';
import { createLounge, getLoungeById } from '../controller/loungeController.js';

const router = express.Router();

router.post('/', createLounge);
router.get('/:id', getLoungeById);

export default router;