# 🌾 Farm2Market - Agricultural Marketplace

A full-stack agricultural marketplace platform connecting farmers and buyers.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)
- npm or yarn

### 1. Database Setup

```bash
# Navigate to backend
cd backend

# Initialize database (creates tables)
npm run init-db

# (Optional) Load sample data
mysql -u root -p farm2market < ../database/seed.sql
```

### 2. Backend Setup

```bash
# Install dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start server
npm run dev
```

### 3. Frontend Setup

```bash
# Install dependencies
cd frontend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL

# Start dev server
npm run dev
```

## 📁 Project Structure

```
Farm2Market/
├── backend/           # Node.js + Express API
│   ├── config/       # Database & environment config
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Auth middleware
│   ├── routes/       # API routes
│   └── scripts/      # Database init script
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── services/
├── database/         # MySQL schema & seeds
└── docs/            # Documentation
```

## 🎯 Features

### Buyers
- Browse crops with search & filters
- View farmer profiles
- Place bids with custom pricing
- Track orders
- Rate farmers

### Farmers
- Add/edit crops
- Manage availability
- View & respond to bids
- Track sales
- Manage profile

### Admins
- User management
- Analytics dashboard
- Transaction history
- Farmer performance metrics

## 🔐 Default Credentials

After running seed data:
- **Admin**: admin@farm2market.com / admin123
- **Farmer**: farmer1@example.com / farmer123
- **Buyer**: buyer1@example.com / buyer123

⚠️ **Change passwords in production!**

## 📚 Documentation

- [Database Setup Guide](DATABASE_SETUP.md)
- [Migration Guide](MIGRATION_GUIDE.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MySQL
- **Frontend**: React, Vite
- **Auth**: JWT
- **Database**: MySQL 8+

## 📝 License

MIT
