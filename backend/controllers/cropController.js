import pool from '../config/database.js';

// Get all crops (with search and sort)
export const getAllCrops = async (req, res) => {
  try {
    const { search, category, sort = 'created_at', order = 'DESC', minPrice, maxPrice, farmerId } = req.query;

    let query = `
      SELECT 
        c.*,
        u.id as farmer_user_id,
        u.full_name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone,
        u.city as farmer_city,
        u.state as farmer_state,
        fp.farm_name,
        fp.rating as farmer_rating,
        fp.total_ratings as farmer_total_ratings
      FROM crops c
      INNER JOIN users u ON c.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE c.is_available = TRUE AND u.is_active = TRUE AND u.is_blocked = FALSE
    `;

    const queryParams = [];

    // Search filter
    if (search) {
      query += ` AND (c.name LIKE ? OR c.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Category filter
    if (category) {
      query += ` AND c.category = ?`;
      queryParams.push(category);
    }

    // Price filters
    if (minPrice) {
      query += ` AND c.price_per_kg >= ?`;
      queryParams.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      query += ` AND c.price_per_kg <= ?`;
      queryParams.push(parseFloat(maxPrice));
    }

    // Farmer filter
    if (farmerId) {
      query += ` AND c.farmer_id = ?`;
      queryParams.push(parseInt(farmerId));
    }

    // Sort
    const validSorts = ['name', 'price_per_kg', 'created_at', 'available_quantity_kg', 'farmer_rating'];
    const sortField = validSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    if (sortField === 'farmer_rating') {
      query += ` ORDER BY fp.rating ${sortOrder}, c.created_at DESC`;
    } else {
      query += ` ORDER BY c.${sortField} ${sortOrder}`;
    }

    const [crops] = await pool.execute(query, queryParams);

    res.json({ crops });
  } catch (err) {
    console.error('Get all crops error:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
};

// Get single crop by ID
export const getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    const [crops] = await pool.execute(
      `SELECT 
        c.*,
        u.id as farmer_user_id,
        u.full_name as farmer_name,
        u.email as farmer_email,
        u.phone as farmer_phone,
        u.address as farmer_address,
        u.city as farmer_city,
        u.state as farmer_state,
        u.pincode as farmer_pincode,
        fp.farm_name,
        fp.farm_location,
        fp.farm_description,
        fp.years_of_experience,
        fp.certifications,
        fp.rating as farmer_rating,
        fp.total_ratings as farmer_total_ratings,
        fp.total_sales,
        fp.total_orders
      FROM crops c
      INNER JOIN users u ON c.farmer_id = u.id
      LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
      WHERE c.id = ? AND c.is_available = TRUE`,
      [id]
    );

    if (crops.length === 0) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    res.json({ crop: crops[0] });
  } catch (err) {
    console.error('Get crop by ID error:', err);
    res.status(500).json({ error: 'Failed to fetch crop' });
  }
};

// Get crops by farmer
export const getCropsByFarmer = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const [crops] = await pool.execute(
      'SELECT * FROM crops WHERE farmer_id = ? ORDER BY created_at DESC',
      [farmerId]
    );

    res.json({ crops });
  } catch (err) {
    console.error('Get crops by farmer error:', err);
    res.status(500).json({ error: 'Failed to fetch crops' });
  }
};

// Add crop (farmer only)
export const createCrop = async (req, res) => {
  try {
    const { name, description, category, price_per_kg, quantity_kg, image_url } = req.body;
    const farmerId = req.user.id;

    if (!name || !price_per_kg || !quantity_kg) {
      return res.status(400).json({ error: 'Name, price, and quantity are required' });
    }

    if (price_per_kg <= 0 || quantity_kg <= 0) {
      return res.status(400).json({ error: 'Price and quantity must be positive' });
    }

    const [result] = await pool.execute(
      `INSERT INTO crops (farmer_id, name, description, category, price_per_kg, quantity_kg, available_quantity_kg, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [farmerId, name, description || null, category || null, price_per_kg, quantity_kg, quantity_kg, image_url || null]
    );

    const [crops] = await pool.execute('SELECT * FROM crops WHERE id = ?', [result.insertId]);

    res.status(201).json({
      message: 'Crop added successfully',
      crop: crops[0]
    });
  } catch (err) {
    console.error('Create crop error:', err);
    res.status(500).json({ error: 'Failed to add crop' });
  }
};

// Update crop (farmer only)
export const updateCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;
    const { name, description, category, price_per_kg, quantity_kg, available_quantity_kg, image_url, is_available } = req.body;

    // Verify crop belongs to farmer
    const [existingCrops] = await pool.execute(
      'SELECT id FROM crops WHERE id = ? AND farmer_id = ?',
      [id, farmerId]
    );

    if (existingCrops.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    if (price_per_kg !== undefined) {
      updateFields.push('price_per_kg = ?');
      updateValues.push(price_per_kg);
    }
    if (quantity_kg !== undefined) {
      updateFields.push('quantity_kg = ?');
      updateValues.push(quantity_kg);
    }
    if (available_quantity_kg !== undefined) {
      updateFields.push('available_quantity_kg = ?');
      updateValues.push(available_quantity_kg);
    }
    if (image_url !== undefined) {
      updateFields.push('image_url = ?');
      updateValues.push(image_url);
    }
    if (is_available !== undefined) {
      updateFields.push('is_available = ?');
      updateValues.push(is_available);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(id);

    await pool.execute(
      `UPDATE crops SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    const [crops] = await pool.execute('SELECT * FROM crops WHERE id = ?', [id]);

    res.json({
      message: 'Crop updated successfully',
      crop: crops[0]
    });
  } catch (err) {
    console.error('Update crop error:', err);
    res.status(500).json({ error: 'Failed to update crop' });
  }
};

// Delete crop (farmer only)
export const deleteCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const farmerId = req.user.id;

    // Verify crop belongs to farmer
    const [existingCrops] = await pool.execute(
      'SELECT id FROM crops WHERE id = ? AND farmer_id = ?',
      [id, farmerId]
    );

    if (existingCrops.length === 0) {
      return res.status(404).json({ error: 'Crop not found or you do not have permission' });
    }

    await pool.execute('DELETE FROM crops WHERE id = ?', [id]);

    res.json({ message: 'Crop deleted successfully' });
  } catch (err) {
    console.error('Delete crop error:', err);
    res.status(500).json({ error: 'Failed to delete crop' });
  }
};

// Get categories
export const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.execute(
      'SELECT DISTINCT category FROM crops WHERE category IS NOT NULL AND is_available = TRUE ORDER BY category'
    );

    res.json({ categories: categories.map(c => c.category) });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};
