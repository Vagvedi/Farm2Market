// 🔥 LOAD ENV FIRST — NO LOGIC HERE
import './config/env.js';

import express from 'express';
import cors from 'cors';
import cropRoutes from './routes/cropRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/crops', cropRoutes);

app.get('/', (req, res) => {
  res.send('Farm2Market Backend is running 🚀');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
