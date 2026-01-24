import express from 'express';
import {
  getFarmerProfile,
  getAllFarmers
} from '../controllers/farmerController.js';

const router = express.Router();

// Public routes
router.get('/', getAllFarmers);
router.get('/:id', getFarmerProfile);

export default router;
