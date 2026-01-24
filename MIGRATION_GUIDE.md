# Farm2Market - Migration from Supabase to MySQL

## 🗄️ Database Setup

### Step 1: Install MySQL

Make sure MySQL is installed on your system:
- **Windows**: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
- **macOS**: `brew install mysql`
- **Linux**: `sudo apt-get install mysql-server`

### Step 2: Create Database

1. Start MySQL server:
   ```bash
   # Windows (if installed as service, it should auto-start)
   # macOS/Linux
   sudo systemctl start mysql
   # or
   mysql.server start
   ```

2. Login to MySQL:
   ```bash
   mysql -u root -p
   ```

3. Run the schema file:
   ```sql
   source database/schema.sql
   ```

   Or from command line:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

4. (Optional) Load sample data:
   ```bash
   mysql -u root -p farm2market < database/seed.sql
   ```

### Step 3: Configure Backend

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update `.env` with your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=farm2market
   JWT_SECRET=your-super-secret-jwt-key-change-this
   ```

### Step 4: Install Dependencies

```bash
cd backend
npm install
```

### Step 5: Start Backend

```bash
npm run dev
```

## 🔄 Key Changes from Supabase

### Authentication
- **Before**: Supabase Auth with JWT
- **Now**: Custom JWT authentication with MySQL user storage
- **Password hashing**: bcryptjs (10 rounds)

### Database
- **Before**: PostgreSQL (Supabase)
- **Now**: MySQL
- **UUIDs**: Changed to AUTO_INCREMENT integers
- **RLS**: Removed (handled in application layer)

### API Endpoints

#### New Endpoints:
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update profile

- `GET /api/farmers` - Get all farmers
- `GET /api/farmers/:id` - Get farmer profile

- `POST /api/bids` - Create bid (buyer)
- `GET /api/bids/my-bids` - Get buyer's bids
- `GET /api/bids/farmer/requests` - Get farmer's requests
- `PUT /api/bids/:id/accept` - Accept bid (farmer)
- `PUT /api/bids/:id/reject` - Reject bid (farmer)

- `POST /api/ratings` - Create rating
- `GET /api/ratings/farmer/:id` - Get farmer ratings

- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/analytics` - Get analytics
- `GET /api/admin/farmers/performance` - Get farmer performance
- `GET /api/admin/transactions` - Get transaction history

#### Updated Endpoints:
- `GET /api/crops` - Now supports search, sort, filters
- `GET /api/crops/categories` - Get all categories
- `GET /api/crops/farmer/my-crops` - Get farmer's crops
- `PUT /api/crops/:id` - Update crop (with availability)
- `DELETE /api/crops/:id` - Delete crop

## 📊 Database Schema

### Tables:
1. **users** - All users (buyers, farmers, admins)
2. **farmer_profiles** - Extended farmer information
3. **crops** - Products listed by farmers
4. **bids** - Buyer requests/bids
5. **orders** - Accepted bids become orders
6. **ratings** - Ratings and reviews
7. **admin_actions** - Admin action logs

### Views:
1. **crop_sales_stats** - Crop sales analytics
2. **farmer_performance** - Farmer performance metrics
3. **buyer_activity** - Buyer activity statistics

## 🔐 User Roles

1. **buyer** - Can browse, search, bid, place orders
2. **farmer** - Can add/edit crops, manage bids, accept/reject
3. **admin** - Full access, analytics, user management

## 🚀 Next Steps

1. Update frontend to use new API endpoints
2. Implement new features (search, bidding, farmer profiles, admin dashboard)
3. Test all functionality
4. Deploy to production

## ⚠️ Important Notes

- **Password Hashing**: All passwords are hashed with bcrypt (10 rounds)
- **JWT Tokens**: Include userId, email, and role
- **Transactions**: Used for critical operations (accepting bids)
- **Indexes**: Added for performance on frequently queried fields
- **Full-text Search**: Enabled on crop name and description
