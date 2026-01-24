import express from 'express';
import {
  getAllUsers,
  toggleUserBlock,
  getAnalytics,
  getFarmerPerformance,
  getTransactionHistory
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth);
router.use(requireRole('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/block', toggleUserBlock);
router.get('/analytics', getAnalytics);
router.get('/farmers/performance', getFarmerPerformance);
router.get('/transactions', getTransactionHistory);

export default router;
