import pool from '../config/database.js';

// Get buyer's orders
export const getMyOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;

    const [orders] = await pool.execute(
      `SELECT 
        o.*,
        c.name as crop_name,
        c.image_url as crop_image,
        c.category,
        u.full_name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone,
        u.address as farmer_address,
        u.city as farmer_city,
        u.state as farmer_state,
        fp.farm_name,
        fp.farm_location
      FROM orders o
      INNER JOIN crops c ON o.crop_id = c.id
      INNER JOIN users u ON o.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC`,
      [buyerId]
    );

    res.json({ orders });
  } catch (err) {
    console.error('Get my orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get farmer's orders
export const getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const [orders] = await pool.execute(
      `SELECT 
        o.*,
        c.name as crop_name,
        c.image_url as crop_image,
        c.category,
        u.full_name as buyer_name,
        u.email as buyer_email,
        u.phone as buyer_phone,
        u.address as buyer_address
      FROM orders o
      INNER JOIN crops c ON o.crop_id = c.id
      INNER JOIN users u ON o.buyer_id = u.id
      WHERE o.farmer_id = ?
      ORDER BY o.created_at DESC`,
      [farmerId]
    );

    res.json({ orders });
  } catch (err) {
    console.error('Get farmer orders error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Update order status (farmer can confirm/deliver, buyer can cancel)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const validStatuses = ['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get order
    const [orders] = await pool.execute(
      'SELECT * FROM orders WHERE id = ?',
      [id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orders[0];

    // Check permissions
    if (userRole === 'farmer' && order.farmer_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this order' });
    }
    if (userRole === 'buyer' && order.buyer_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this order' });
    }

    // Status transition rules
    if (userRole === 'farmer') {
      if (status === 'confirmed' && order.status !== 'pending') {
        return res.status(400).json({ error: 'Can only confirm pending orders' });
      }
      if (status === 'delivered' && order.status !== 'confirmed' && order.status !== 'in_transit') {
        return res.status(400).json({ error: 'Order must be confirmed or in transit before delivery' });
      }
    }

    if (userRole === 'buyer' && status === 'cancelled' && order.status !== 'pending') {
      return res.status(400).json({ error: 'Can only cancel pending orders' });
    }

    // Update order
    await pool.execute(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [status, id]
    );

    // If status is confirmed, reveal farmer contact
    if (status === 'confirmed') {
      await pool.execute(
        'UPDATE orders SET farmer_contact_revealed = TRUE WHERE id = ?',
        [id]
      );
    }

    const [updatedOrders] = await pool.execute(
      `SELECT o.*,
              c.name as crop_name,
              u.full_name as ${userRole === 'farmer' ? 'buyer' : 'farmer'}_name,
              u.email as ${userRole === 'farmer' ? 'buyer' : 'farmer'}_email,
              u.phone as ${userRole === 'farmer' ? 'buyer' : 'farmer'}_phone
       FROM orders o
       INNER JOIN crops c ON o.crop_id = c.id
       INNER JOIN users u ON o.${userRole === 'farmer' ? 'buyer' : 'farmer'}_id = u.id
       WHERE o.id = ?`,
      [id]
    );

    res.json({
      message: 'Order status updated successfully',
      order: updatedOrders[0]
    });
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
};
