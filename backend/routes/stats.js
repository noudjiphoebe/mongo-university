import express from 'express';
import { getStats } from '../controllers/statsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['admin']), getStats);

export default router;

