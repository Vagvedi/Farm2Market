-- ============================================
-- FARM2MARKET - MySQL DATABASE SCHEMA
-- ============================================
-- Database: farm2market
-- Character Set: utf8mb4
-- Collation: utf8mb4_unicode_ci
-- ============================================

CREATE DATABASE IF NOT EXISTS farm2market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE farm2market;

-- ============================================
-- USERS TABLE
-- ============================================
-- Stores all users (buyers, farmers, admins)
-- ============================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role ENUM('buyer', 'farmer', 'admin') NOT NULL DEFAULT 'buyer',
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    profile_image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_is_blocked (is_blocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- FARMER PROFILES TABLE
-- ============================================
-- Extended profile information for farmers
-- ============================================
CREATE TABLE farmer_profiles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    farm_name VARCHAR(255),
    farm_location TEXT,
    farm_description TEXT,
    years_of_experience INT,
    certifications TEXT,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_ratings INT DEFAULT 0,
    total_sales DECIMAL(12,2) DEFAULT 0.00,
    total_orders INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_rating (rating),
    INDEX idx_total_sales (total_sales)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- CROPS TABLE
-- ============================================
-- Products/crops listed by farmers
-- ============================================
CREATE TABLE crops (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price_per_kg DECIMAL(10,2) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    available_quantity_kg DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(500),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_is_available (is_available),
    INDEX idx_category (category),
    FULLTEXT idx_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BIDS/REQUESTS TABLE
-- ============================================
-- Buyer requests/bids for crops
-- ============================================
CREATE TABLE bids (
    id INT PRIMARY KEY AUTO_INCREMENT,
    buyer_id INT NOT NULL,
    crop_id INT NOT NULL,
    farmer_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    original_price_per_kg DECIMAL(10,2) NOT NULL,
    bid_price_per_kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_crop_id (crop_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ORDERS TABLE
-- ============================================
-- Accepted bids become orders
-- ============================================
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bid_id INT NOT NULL UNIQUE,
    buyer_id INT NOT NULL,
    farmer_id INT NOT NULL,
    crop_id INT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'in_transit', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_address TEXT,
    contact_phone VARCHAR(20),
    farmer_contact_revealed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bid_id) REFERENCES bids(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (crop_id) REFERENCES crops(id) ON DELETE CASCADE,
    INDEX idx_buyer_id (buyer_id),
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RATINGS TABLE
-- ============================================
-- Ratings and reviews for farmers
-- ============================================
CREATE TABLE ratings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    farmer_id INT NOT NULL,
    buyer_id INT NOT NULL,
    order_id INT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_farmer_id (farmer_id),
    INDEX idx_buyer_id (buyer_id),
    UNIQUE KEY unique_order_rating (order_id, buyer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADMIN ACTIONS TABLE
-- ============================================
-- Track admin actions (blocks, unblocks, etc.)
-- ============================================
CREATE TABLE admin_actions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NOT NULL,
    target_user_id INT NOT NULL,
    action_type ENUM('block', 'unblock', 'delete', 'modify') NOT NULL,
    reason TEXT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_target_user_id (target_user_id),
    INDEX idx_action_type (action_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ANALYTICS VIEWS (for admin dashboard)
-- ============================================

-- View: Crop Sales Statistics
CREATE VIEW crop_sales_stats AS
SELECT 
    c.id AS crop_id,
    c.name AS crop_name,
    c.category,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(o.quantity_kg) AS total_quantity_sold,
    SUM(o.total_amount) AS total_revenue,
    AVG(o.price_per_kg) AS avg_selling_price,
    u.id AS farmer_id,
    u.full_name AS farmer_name
FROM crops c
LEFT JOIN orders o ON c.id = o.crop_id AND o.status IN ('confirmed', 'delivered')
LEFT JOIN users u ON c.farmer_id = u.id
GROUP BY c.id, c.name, c.category, u.id, u.full_name;

-- View: Farmer Performance
CREATE VIEW farmer_performance AS
SELECT 
    u.id AS farmer_id,
    u.full_name AS farmer_name,
    u.email,
    fp.farm_name,
    fp.rating,
    fp.total_ratings,
    COUNT(DISTINCT o.id) AS total_orders,
    COUNT(DISTINCT b.id) AS total_bids_received,
    SUM(CASE WHEN o.status IN ('confirmed', 'delivered') THEN o.total_amount ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN o.status IN ('confirmed', 'delivered') THEN o.quantity_kg ELSE 0 END) AS total_quantity_sold,
    COUNT(DISTINCT c.id) AS total_crops_listed,
    AVG(CASE WHEN r.rating IS NOT NULL THEN r.rating ELSE NULL END) AS avg_rating
FROM users u
LEFT JOIN farmer_profiles fp ON u.id = fp.user_id
LEFT JOIN crops c ON u.id = c.farmer_id
LEFT JOIN bids b ON u.id = b.farmer_id
LEFT JOIN orders o ON u.id = o.farmer_id
LEFT JOIN ratings r ON u.id = r.farmer_id
WHERE u.role = 'farmer' AND u.is_active = TRUE
GROUP BY u.id, u.full_name, u.email, fp.farm_name, fp.rating, fp.total_ratings;

-- View: Buyer Activity
CREATE VIEW buyer_activity AS
SELECT 
    u.id AS buyer_id,
    u.full_name AS buyer_name,
    u.email,
    COUNT(DISTINCT b.id) AS total_bids_placed,
    COUNT(DISTINCT o.id) AS total_orders,
    SUM(CASE WHEN o.status IN ('confirmed', 'delivered') THEN o.total_amount ELSE 0 END) AS total_spent,
    MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN bids b ON u.id = b.buyer_id
LEFT JOIN orders o ON u.id = o.buyer_id
WHERE u.role = 'buyer' AND u.is_active = TRUE
GROUP BY u.id, u.full_name, u.email;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: Update farmer profile when order is confirmed/delivered
DELIMITER //
CREATE TRIGGER update_farmer_stats_on_order
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status IN ('confirmed', 'delivered') AND OLD.status NOT IN ('confirmed', 'delivered') THEN
        UPDATE farmer_profiles
        SET 
            total_sales = total_sales + NEW.total_amount,
            total_orders = total_orders + 1
        WHERE user_id = NEW.farmer_id;
    END IF;
END//
DELIMITER ;

-- Trigger: Update crop availability when order is confirmed
DELIMITER //
CREATE TRIGGER update_crop_availability_on_order
AFTER UPDATE ON orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE crops
        SET available_quantity_kg = available_quantity_kg - NEW.quantity_kg
        WHERE id = NEW.crop_id;
    END IF;
END//
DELIMITER ;

-- Trigger: Update farmer rating when new rating is added
DELIMITER //
CREATE TRIGGER update_farmer_rating_on_new_rating
AFTER INSERT ON ratings
FOR EACH ROW
BEGIN
    UPDATE farmer_profiles
    SET 
        rating = (
            SELECT AVG(rating) 
            FROM ratings 
            WHERE farmer_id = NEW.farmer_id
        ),
        total_ratings = (
            SELECT COUNT(*) 
            FROM ratings 
            WHERE farmer_id = NEW.farmer_id
        )
    WHERE user_id = NEW.farmer_id;
END//
DELIMITER ;

-- ============================================
-- INITIAL ADMIN USER (password: admin123)
-- ============================================
-- Default password hash for 'admin123' (bcrypt with salt rounds 10)
-- You should change this after first login!
-- Insert initial admin user (password: admin123)
-- Note: This is a placeholder hash. In production, use proper bcrypt hashing.
INSERT IGNORE INTO users (email, password_hash, full_name, role, is_active) 
VALUES (
    'admin@farm2market.com',
    '$2b$10$rOzJqZqZqZqZqZqZqZqZqOZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
    'System Admin',
    'admin',
    TRUE
);

-- Note: The password hash above is a placeholder. 
-- In production, use proper bcrypt hashing in your application code.
