import pool from '../config/database.js';

// Get farmer profile by ID
export const getFarmerProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const [users] = await pool.execute(
      `SELECT 
        u.id,
        u.full_name,
        u.email,
        u.phone,
        u.address,
        u.city,
        u.state,
        u.pincode,
        u.profile_image_url,
        u.created_at,
        fp.farm_name,
        fp.farm_location,
        fp.farm_description,
        fp.years_of_experience,
        fp.certifications,
        fp.rating,
        fp.total_ratings,
        fp.total_sales,
        fp.total_orders
      FROM users u
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE u.id = ? AND u.role = 'farmer' AND u.is_active = TRUE AND u.is_blocked = FALSE`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Farmer not found' });
    }

    // Get farmer's crops
    const [crops] = await pool.execute(
      'SELECT * FROM crops WHERE farmer_id = ? AND is_available = TRUE ORDER BY created_at DESC',
      [id]
    );

    // Get farmer's ratings
    const [ratings] = await pool.execute(
      `SELECT 
        r.*,
        u.full_name as buyer_name
      FROM ratings r
      INNER JOIN users u ON r.buyer_id = u.id
      WHERE r.farmer_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [id]
    );

    res.json({
      farmer: users[0],
      crops,
      ratings
    });
  } catch (err) {
    console.error('Get farmer profile error:', err);
    res.status(500).json({ error: 'Failed to fetch farmer profile' });
  }
};

// Get all farmers (for buyer to browse)
export const getAllFarmers = async (req, res) => {
  try {
    const { search, sort = 'rating', order = 'DESC' } = req.query;

    let query = `
      SELECT 
        u.id,
        u.full_name,
        u.city,
        u.state,
        u.profile_image_url,
        fp.farm_name,
        fp.rating,
        fp.total_ratings,
        fp.total_sales,
        fp.total_orders,
        COUNT(DISTINCT c.id) as total_crops
      FROM users u
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      LEFT JOIN crops c ON u.id = c.farmer_id AND c.is_available = TRUE
      WHERE u.role = 'farmer' AND u.is_active = TRUE AND u.is_blocked = FALSE
    `;

    const queryParams = [];

    if (search) {
      query += ` AND (u.full_name LIKE ? OR fp.farm_name LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    query += ` GROUP BY u.id, u.full_name, u.city, u.state, u.profile_image_url, fp.farm_name, fp.rating, fp.total_ratings, fp.total_sales, fp.total_orders`;

    const validSorts = ['rating', 'total_sales', 'total_orders', 'full_name'];
    const sortField = validSorts.includes(sort) ? sort : 'rating';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sortField === 'rating') {
      query += ` ORDER BY fp.rating ${sortOrder} NULLS LAST, u.full_name ASC`;
    } else if (sortField === 'total_sales') {
      query += ` ORDER BY fp.total_sales ${sortOrder} NULLS LAST`;
    } else if (sortField === 'total_orders') {
      query += ` ORDER BY fp.total_orders ${sortOrder} NULLS LAST`;
    } else {
      query += ` ORDER BY u.${sortField} ${sortOrder}`;
    }

    const [farmers] = await pool.execute(query, queryParams);

    res.json({ farmers });
  } catch (err) {
    console.error('Get all farmers error:', err);
    res.status(500).json({ error: 'Failed to fetch farmers' });
  }
};
