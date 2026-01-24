import express from 'express';
import {
  getAllCrops,
  getCropById,
  getCropsByFarmer,
  createCrop,
  updateCrop,
  deleteCrop,
  getCategories
} from '../controllers/cropController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllCrops);
router.get('/categories', getCategories);
router.get('/:id', getCropById);

// Farmer routes
router.get('/farmer/my-crops', requireAuth, requireRole('farmer'), getCropsByFarmer);
router.post('/', requireAuth, requireRole('farmer'), createCrop);
router.put('/:id', requireAuth, requireRole('farmer'), updateCrop);
router.delete('/:id', requireAuth, requireRole('farmer'), deleteCrop);

export default router;
