import pool from '../config/database.js';

// Get all users (with filters)
export const getAllUsers = async (req, res) => {
  try {
    const { role, is_active, is_blocked, search } = req.query;

    let query = `
      SELECT 
        u.*,
        fp.farm_name,
        fp.rating,
        fp.total_sales,
        fp.total_orders
      FROM users u
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE 1=1
    `;

    const queryParams = [];

    if (role) {
      query += ` AND u.role = ?`;
      queryParams.push(role);
    }
    if (is_active !== undefined) {
      query += ` AND u.is_active = ?`;
      queryParams.push(is_active === 'true');
    }
    if (is_blocked !== undefined) {
      query += ` AND u.is_blocked = ?`;
      queryParams.push(is_blocked === 'true');
    }
    if (search) {
      query += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [users] = await pool.execute(query, queryParams);

    res.json({ users });
  } catch (err) {
    console.error('Get all users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Block/Unblock user
export const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked, blocked_reason } = req.body;
    const adminId = req.user.id;

    if (typeof is_blocked !== 'boolean') {
      return res.status(400).json({ error: 'is_blocked must be a boolean' });
    }

    // Get user
    const [users] = await pool.execute('SELECT id, role FROM users WHERE id = ?', [id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user
    await pool.execute(
      'UPDATE users SET is_blocked = ?, blocked_reason = ? WHERE id = ?',
      [is_blocked, blocked_reason || null, id]
    );

    // Log admin action
    await pool.execute(
      'INSERT INTO admin_actions (admin_id, target_user_id, action_type, reason) VALUES (?, ?, ?, ?)',
      [adminId, id, is_blocked ? 'block' : 'unblock', blocked_reason || null]
    );

    res.json({
      message: `User ${is_blocked ? 'blocked' : 'unblocked'} successfully`
    });
  } catch (err) {
    console.error('Toggle user block error:', err);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Get analytics dashboard data
export const getAnalytics = async (req, res) => {
  try {
    // Top selling crops
    const [topCrops] = await pool.execute(
      `SELECT 
        crop_id,
        crop_name,
        category,
        total_orders,
        total_quantity_sold,
        total_revenue,
        farmer_name
      FROM crop_sales_stats
      ORDER BY total_revenue DESC
      LIMIT 10`
    );

    // Top farmers
    const [topFarmers] = await pool.execute(
      `SELECT 
        farmer_id,
        farmer_name,
        farm_name,
        rating,
        total_ratings,
        total_orders,
        total_revenue,
        total_quantity_sold
      FROM farmer_performance
      ORDER BY total_revenue DESC
      LIMIT 10`
    );

    // Top buyers
    const [topBuyers] = await pool.execute(
      `SELECT 
        buyer_id,
        buyer_name,
        total_bids_placed,
        total_orders,
        total_spent
      FROM buyer_activity
      ORDER BY total_spent DESC
      LIMIT 10`
    );

    // Overall statistics
    const [stats] = await pool.execute(
      `SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'farmer' AND is_active = TRUE) as total_farmers,
        (SELECT COUNT(*) FROM users WHERE role = 'buyer' AND is_active = TRUE) as total_buyers,
        (SELECT COUNT(*) FROM crops WHERE is_available = TRUE) as total_crops,
        (SELECT COUNT(*) FROM orders WHERE status IN ('confirmed', 'delivered')) as total_orders,
        (SELECT SUM(total_amount) FROM orders WHERE status IN ('confirmed', 'delivered')) as total_revenue,
        (SELECT COUNT(*) FROM bids WHERE status = 'pending') as pending_bids`
    );

    // Category distribution
    const [categoryStats] = await pool.execute(
      `SELECT 
        category,
        COUNT(*) as crop_count,
        SUM(available_quantity_kg) as total_quantity
      FROM crops
      WHERE is_available = TRUE AND category IS NOT NULL
      GROUP BY category
      ORDER BY crop_count DESC`
    );

    res.json({
      topCrops,
      topFarmers,
      topBuyers,
      stats: stats[0],
      categoryStats
    });
  } catch (err) {
    console.error('Get analytics error:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Get farmer performance details
export const getFarmerPerformance = async (req, res) => {
  try {
    const [farmers] = await pool.execute(
      `SELECT * FROM farmer_performance ORDER BY total_revenue DESC`
    );

    res.json({ farmers });
  } catch (err) {
    console.error('Get farmer performance error:', err);
    res.status(500).json({ error: 'Failed to fetch farmer performance' });
  }
};

// Get transaction history
export const getTransactionHistory = async (req, res) => {
  try {
    const { startDate, endDate, farmerId, buyerId } = req.query;

    let query = `
      SELECT 
        o.*,
        c.name as crop_name,
        c.category,
        u1.full_name as buyer_name,
        u2.full_name as farmer_name
      FROM orders o
      INNER JOIN crops c ON o.crop_id = c.id
      INNER JOIN users u1 ON o.buyer_id = u1.id
      INNER JOIN users u2 ON o.farmer_id = u2.id
      WHERE o.status IN ('confirmed', 'delivered')
    `;

    const queryParams = [];

    if (startDate) {
      query += ` AND o.created_at >= ?`;
      queryParams.push(startDate);
    }
    if (endDate) {
      query += ` AND o.created_at <= ?`;
      queryParams.push(endDate);
    }
    if (farmerId) {
      query += ` AND o.farmer_id = ?`;
      queryParams.push(farmerId);
    }
    if (buyerId) {
      query += ` AND o.buyer_id = ?`;
      queryParams.push(buyerId);
    }

    query += ` ORDER BY o.created_at DESC LIMIT 100`;

    const [transactions] = await pool.execute(query, queryParams);

    res.json({ transactions });
  } catch (err) {
    console.error('Get transaction history error:', err);
    res.status(500).json({ error: 'Failed to fetch transaction history' });
  }
};
