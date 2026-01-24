import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, full_name, role = 'buyer', phone, address, city, state, pincode } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.execute(
      `INSERT INTO users (email, password_hash, full_name, role, phone, address, city, state, pincode)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [email, password_hash, full_name, role, phone || null, address || null, city || null, state || null, pincode || null]
    );

    const userId = result.insertId;

    // If farmer, create farmer profile
    if (role === 'farmer') {
      await pool.execute(
        'INSERT INTO farmer_profiles (user_id, rating, total_ratings, total_sales, total_orders) VALUES (?, 0, 0, 0, 0)',
        [userId]
      );
    }

    // Generate JWT token
    const token = jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Get user data
    const [users] = await pool.execute(
      'SELECT id, email, full_name, role, phone, address, city, state, pincode, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: users[0]
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, full_name, role, is_active, is_blocked FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];

    if (!user.is_active || user.is_blocked) {
      return res.status(403).json({ error: 'Account is inactive or blocked' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Get full user data
    const [userData] = await pool.execute(
      'SELECT id, email, full_name, role, phone, address, city, state, pincode, profile_image_url, created_at FROM users WHERE id = ?',
      [user.id]
    );

    res.json({
      message: 'Login successful',
      token,
      user: userData[0]
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const [users] = await pool.execute(
      `SELECT id, email, full_name, role, phone, address, city, state, pincode, 
              profile_image_url, is_active, is_blocked, created_at, updated_at
       FROM users WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let profile = users[0];

    // If farmer, get farmer profile data
    if (profile.role === 'farmer') {
      const [farmerProfiles] = await pool.execute(
        'SELECT * FROM farmer_profiles WHERE user_id = ?',
        [userId]
      );
      profile.farmer_profile = farmerProfiles[0] || null;
    }

    res.json({ user: profile });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Update user profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { full_name, phone, address, city, state, pincode, profile_image_url } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (full_name !== undefined) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if (address !== undefined) {
      updateFields.push('address = ?');
      updateValues.push(address);
    }
    if (city !== undefined) {
      updateFields.push('city = ?');
      updateValues.push(city);
    }
    if (state !== undefined) {
      updateFields.push('state = ?');
      updateValues.push(state);
    }
    if (pincode !== undefined) {
      updateFields.push('pincode = ?');
      updateValues.push(pincode);
    }
    if (profile_image_url !== undefined) {
      updateFields.push('profile_image_url = ?');
      updateValues.push(profile_image_url);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updateValues.push(userId);

    await pool.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // If farmer, update farmer profile
    if (req.user.role === 'farmer') {
      const { farm_name, farm_location, farm_description, years_of_experience, certifications } = req.body;
      
      if (farm_name || farm_location || farm_description || years_of_experience || certifications) {
        const farmerFields = [];
        const farmerValues = [];

        if (farm_name !== undefined) {
          farmerFields.push('farm_name = ?');
          farmerValues.push(farm_name);
        }
        if (farm_location !== undefined) {
          farmerFields.push('farm_location = ?');
          farmerValues.push(farm_location);
        }
        if (farm_description !== undefined) {
          farmerFields.push('farm_description = ?');
          farmerValues.push(farm_description);
        }
        if (years_of_experience !== undefined) {
          farmerFields.push('years_of_experience = ?');
          farmerValues.push(years_of_experience);
        }
        if (certifications !== undefined) {
          farmerFields.push('certifications = ?');
          farmerValues.push(certifications);
        }

        if (farmerFields.length > 0) {
          farmerValues.push(userId);
          await pool.execute(
            `UPDATE farmer_profiles SET ${farmerFields.join(', ')} WHERE user_id = ?`,
            farmerValues
          );
        }
      }
    }

    // Get updated user
    const [users] = await pool.execute(
      'SELECT id, email, full_name, role, phone, address, city, state, pincode, profile_image_url, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
