import express from 'express';
import { generateDescription } from '../controllers/aiController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-description', protect, admin, generateDescription);

export default router;
