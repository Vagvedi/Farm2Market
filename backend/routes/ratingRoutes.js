import express from 'express';
import {
  createRating,
  getFarmerRatings
} from '../controllers/ratingController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route
router.get('/farmer/:id', getFarmerRatings);

// Buyer route
router.post('/', requireAuth, requireRole('buyer'), createRating);

export default router;
