import express from 'express';
import { createCrop } from '../controllers/cropController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, createCrop); // 🔐 protected

export default router;
