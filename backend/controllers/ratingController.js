import pool from '../config/database.js';

// Create rating (buyer rates farmer after order)
export const createRating = async (req, res) => {
  try {
    const { farmer_id, order_id, rating, review } = req.body;
    const buyerId = req.user.id;

    if (!farmer_id || !rating) {
      return res.status(400).json({ error: 'Farmer ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Verify order exists and belongs to buyer
    if (order_id) {
      const [orders] = await pool.execute(
        'SELECT id FROM orders WHERE id = ? AND buyer_id = ? AND farmer_id = ?',
        [order_id, buyerId, farmer_id]
      );

      if (orders.length === 0) {
        return res.status(404).json({ error: 'Order not found or invalid' });
      }

      // Check if already rated
      const [existingRatings] = await pool.execute(
        'SELECT id FROM ratings WHERE order_id = ? AND buyer_id = ?',
        [order_id, buyerId]
      );

      if (existingRatings.length > 0) {
        return res.status(400).json({ error: 'You have already rated this order' });
      }
    }

    // Create rating
    const [result] = await pool.execute(
      `INSERT INTO ratings (farmer_id, buyer_id, order_id, rating, review)
       VALUES (?, ?, ?, ?, ?)`,
      [farmer_id, buyerId, order_id || null, rating, review || null]
    );

    const [ratings] = await pool.execute(
      `SELECT r.*,
              u.full_name as buyer_name
       FROM ratings r
       INNER JOIN users u ON r.buyer_id = u.id
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Rating submitted successfully',
      rating: ratings[0]
    });
  } catch (err) {
    console.error('Create rating error:', err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

// Get farmer ratings
export const getFarmerRatings = async (req, res) => {
  try {
    const { id } = req.params;

    const [ratings] = await pool.execute(
      `SELECT 
        r.*,
        u.full_name as buyer_name,
        u.profile_image_url as buyer_image
      FROM ratings r
      INNER JOIN users u ON r.buyer_id = u.id
      WHERE r.farmer_id = ?
      ORDER BY r.created_at DESC`,
      [id]
    );

    res.json({ ratings });
  } catch (err) {
    console.error('Get farmer ratings error:', err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
};
