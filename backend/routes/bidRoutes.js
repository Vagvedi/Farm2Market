import express from 'express';
import {
  createBid,
  getMyBids,
  getFarmerBids,
  acceptBid,
  rejectBid,
  cancelBid
} from '../controllers/bidController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Buyer routes
router.post('/', requireAuth, requireRole('buyer'), createBid);
router.get('/my-bids', requireAuth, requireRole('buyer'), getMyBids);
router.put('/:id/cancel', requireAuth, requireRole('buyer'), cancelBid);

// Farmer routes
router.get('/farmer/requests', requireAuth, requireRole('farmer'), getFarmerBids);
router.put('/:id/accept', requireAuth, requireRole('farmer'), acceptBid);
router.put('/:id/reject', requireAuth, requireRole('farmer'), rejectBid);

export default router;
