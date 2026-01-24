// 🔥 LOAD ENV FIRST — NO LOGIC HERE
import './config/env.js';
import './config/database.js'; // Initialize database connection

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/', (req, res) => {
  res.send('Farm2Market Backend is running 🚀 - MySQL Edition');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: 'MySQL' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Database: MySQL`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
