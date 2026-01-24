-- ============================================
-- FARM2MARKET - SAMPLE DATA
-- ============================================
-- This file contains sample data for testing
-- ============================================

USE farm2market;

-- Sample Farmers (password: farmer123)
INSERT INTO users (email, password_hash, full_name, role, phone, address, city, state, pincode) VALUES
('farmer1@example.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Rajesh Kumar', 'farmer', '9876543210', 'Farm House, Village Road', 'Pune', 'Maharashtra', '411001'),
('farmer2@example.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Priya Sharma', 'farmer', '9876543211', 'Green Fields, Main Street', 'Nashik', 'Maharashtra', '422001'),
('farmer3@example.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Amit Patel', 'farmer', '9876543212', 'Organic Farm, Highway Road', 'Ahmedabad', 'Gujarat', '380001')
ON DUPLICATE KEY UPDATE email=email;

-- Sample Buyers (password: buyer123)
INSERT INTO users (email, password_hash, full_name, role, phone, address, city, state, pincode) VALUES
('buyer1@example.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Suresh Mehta', 'buyer', '9876543213', 'Apartment 101, City Center', 'Mumbai', 'Maharashtra', '400001'),
('buyer2@example.com', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Anita Desai', 'buyer', '9876543214', 'House No. 25, Suburb', 'Delhi', 'Delhi', '110001')
ON DUPLICATE KEY UPDATE email=email;

-- Farmer Profiles
INSERT INTO farmer_profiles (user_id, farm_name, farm_location, farm_description, years_of_experience) VALUES
(1, 'Kumar Organic Farm', 'Pune, Maharashtra', 'Specialized in organic vegetables and fruits. Certified organic farming.', 15),
(2, 'Sharma Green Fields', 'Nashik, Maharashtra', 'Premium quality crops with sustainable farming practices.', 10),
(3, 'Patel Agro Products', 'Ahmedabad, Gujarat', 'Large scale farming with modern techniques and equipment.', 20)
ON DUPLICATE KEY UPDATE farm_name=farm_name;

-- Sample Crops
INSERT INTO crops (farmer_id, name, description, category, price_per_kg, quantity_kg, available_quantity_kg, image_url, is_available) VALUES
(1, 'Organic Tomatoes', 'Fresh organic tomatoes, pesticide-free', 'Vegetables', 50.00, 500.00, 500.00, NULL, TRUE),
(1, 'Organic Potatoes', 'Premium quality organic potatoes', 'Vegetables', 30.00, 1000.00, 1000.00, NULL, TRUE),
(2, 'Premium Wheat', 'High quality wheat grains', 'Grains', 25.00, 2000.00, 2000.00, NULL, TRUE),
(2, 'Fresh Corn', 'Sweet corn, freshly harvested', 'Vegetables', 40.00, 800.00, 800.00, NULL, TRUE),
(3, 'Basmati Rice', 'Premium basmati rice, long grain', 'Grains', 80.00, 1500.00, 1500.00, NULL, TRUE),
(3, 'Organic Onions', 'Fresh organic onions', 'Vegetables', 35.00, 1200.00, 1200.00, NULL, TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Note: Password hashes are placeholders. In production, use proper bcrypt hashing.
