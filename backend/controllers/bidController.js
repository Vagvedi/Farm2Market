import pool from '../config/database.js';

// Create bid/request (buyer)
export const createBid = async (req, res) => {
  try {
    const { crop_id, quantity_kg, bid_price_per_kg, message } = req.body;
    const buyerId = req.user.id;

    if (!crop_id || !quantity_kg || !bid_price_per_kg) {
      return res.status(400).json({ error: 'Crop ID, quantity, and bid price are required' });
    }

    if (quantity_kg <= 0 || bid_price_per_kg <= 0) {
      return res.status(400).json({ error: 'Quantity and bid price must be positive' });
    }

    // Get crop details
    const [crops] = await pool.execute(
      'SELECT * FROM crops WHERE id = ? AND is_available = TRUE',
      [crop_id]
    );

    if (crops.length === 0) {
      return res.status(404).json({ error: 'Crop not found or not available' });
    }

    const crop = crops[0];

    // Check if buyer is trying to buy from themselves
    if (crop.farmer_id === buyerId) {
      return res.status(400).json({ error: 'You cannot bid on your own crops' });
    }

    // Check availability
    if (quantity_kg > crop.available_quantity_kg) {
      return res.status(400).json({
        error: `Insufficient quantity. Available: ${crop.available_quantity_kg} KG`
      });
    }

    const original_price_per_kg = crop.price_per_kg;
    const total_amount = bid_price_per_kg * quantity_kg;

    // Create bid
    const [result] = await pool.execute(
      `INSERT INTO bids (buyer_id, crop_id, farmer_id, quantity_kg, original_price_per_kg, bid_price_per_kg, total_amount, message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [buyerId, crop_id, crop.farmer_id, quantity_kg, original_price_per_kg, bid_price_per_kg, total_amount, message || null]
    );

    const [bids] = await pool.execute(
      `SELECT b.*, 
              c.name as crop_name,
              c.image_url as crop_image,
              u.full_name as farmer_name
       FROM bids b
       INNER JOIN crops c ON b.crop_id = c.id
       INNER JOIN users u ON b.farmer_id = u.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Bid placed successfully',
      bid: bids[0]
    });
  } catch (err) {
    console.error('Create bid error:', err);
    res.status(500).json({ error: 'Failed to place bid' });
  }
};

// Get buyer's bids
export const getMyBids = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [bids] = await pool.execute(
      `SELECT 
        b.*,
        c.name as crop_name,
        c.image_url as crop_image,
        c.category,
        u.full_name as farmer_name,
        u.email as farmer_email,
        fp.farm_name
      FROM bids b
      INNER JOIN crops c ON b.crop_id = c.id
      INNER JOIN users u ON b.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE b.buyer_id = ?
      ORDER BY b.created_at DESC`,
      [buyerId]
    );

    res.json({ bids });
  } catch (err) {
    console.error('Get my bids error:', err);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
};

// Get bids for farmer (requests)
export const getFarmerBids = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const [bids] = await pool.execute(
      `SELECT 
        b.*,
        c.name as crop_name,
        c.image_url as crop_image,
        c.category,
        u.full_name as buyer_name,
        u.email as buyer_email,
        u.phone as buyer_phone
      FROM bids b
      INNER JOIN crops c ON b.crop_id = c.id
      INNER JOIN users u ON b.buyer_id = u.id
      WHERE b.farmer_id = ? AND b.status = 'pending'
      ORDER BY b.created_at DESC`,
      [farmerId]
    );

    res.json({ bids });
  } catch (err) {
    console.error('Get farmer bids error:', err);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
};

// Accept bid (farmer)
export const acceptBid = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    // Get bid
    const [bids] = await pool.execute(
      'SELECT * FROM bids WHERE id = ? AND farmer_id = ? AND status = "pending"',
      [id, farmerId]
    );

    if (bids.length === 0) {
      return res.status(404).json({ error: 'Bid not found or already processed' });
    }

    const bid = bids[0];

    // Check crop availability
    const [crops] = await pool.execute(
      'SELECT available_quantity_kg FROM crops WHERE id = ?',
      [bid.crop_id]
    );

    if (crops.length === 0 || crops[0].available_quantity_kg < bid.quantity_kg) {
      return res.status(400).json({ error: 'Insufficient crop quantity' });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update bid status
      await connection.execute(
        'UPDATE bids SET status = "accepted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
      );

      // Create order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (bid_id, buyer_id, farmer_id, crop_id, quantity_kg, price_per_kg, total_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [id, bid.buyer_id, bid.farmer_id, bid.crop_id, bid.quantity_kg, bid.bid_price_per_kg, bid.total_amount]
      );

      await connection.commit();

      // Get order with details
      const [orders] = await connection.execute(
        `SELECT o.*,
                c.name as crop_name,
                u.full_name as buyer_name,
                u.email as buyer_email,
                u.phone as buyer_phone
         FROM orders o
         INNER JOIN crops c ON o.crop_id = c.id
         INNER JOIN users u ON o.buyer_id = u.id
         WHERE o.id = ?`,
        [orderResult.insertId]
      );

      res.json({
        message: 'Bid accepted successfully',
        order: orders[0]
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Accept bid error:', err);
    res.status(500).json({ error: 'Failed to accept bid' });
  }
};

// Reject bid (farmer)
export const rejectBid = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    const [bids] = await pool.execute(
      'SELECT id FROM bids WHERE id = ? AND farmer_id = ? AND status = "pending"',
      [id, farmerId]
    );

    if (bids.length === 0) {
      return res.status(404).json({ error: 'Bid not found or already processed' });
    }

    await pool.execute(
      'UPDATE bids SET status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'Bid rejected successfully' });
  } catch (err) {
    console.error('Reject bid error:', err);
    res.status(500).json({ error: 'Failed to reject bid' });
  }
};

// Cancel bid (buyer)
export const cancelBid = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const [bids] = await pool.execute(
      'SELECT id FROM bids WHERE id = ? AND buyer_id = ? AND status = "pending"',
      [id, buyerId]
    );

    if (bids.length === 0) {
      return res.status(404).json({ error: 'Bid not found or already processed' });
    }

    await pool.execute(
      'UPDATE bids SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );

    res.json({ message: 'Bid cancelled successfully' });
  } catch (err) {
    console.error('Cancel bid error:', err);
    res.status(500).json({ error: 'Failed to cancel bid' });
  }
};
