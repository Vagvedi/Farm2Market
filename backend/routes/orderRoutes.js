import express from 'express';
import {
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Buyer routes
router.get('/my-orders', requireAuth, requireRole('buyer'), getMyOrders);
router.put('/:id/status', requireAuth, requireRole('buyer', 'farmer'), updateOrderStatus);

// Farmer routes
router.get('/farmer/orders', requireAuth, requireRole('farmer'), getFarmerOrders);

export default router;
