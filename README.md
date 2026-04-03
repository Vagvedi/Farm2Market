# 🌾 Farm2Market - Agricultural Marketplace

A full-stack agricultural marketplace platform connecting farmers and buyers.

## 🚀 Quick Start

### Prerequisites
- Python (v3.8+)
- Node.js (v16+)
- MySQL (v8+) or Docker
- pip and npm/yarn

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

### Option 2: Local Development

#### 1. Database Setup

```bash
# Start MySQL (or use Docker)
# Create database: farm2market

# Navigate to backend
cd backend

# Run database migrations
alembic upgrade head
```

#### 2. Backend Setup

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MySQL credentials

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup

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
├── backend/           # Python FastAPI
│   ├── api/          # API routes
│   ├── core/         # Core configuration
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── alembic/      # Database migrations
│   ├── main.py       # FastAPI application entry
│   └── requirements.txt
├── frontend/         # Next.js React App
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Utilities and configurations
│   ├── public/       # Static assets
│   └── package.json
├── docker-compose.yml # Docker orchestration
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

## �️ Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Alembic
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: MySQL 8+
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: SQLAlchemy
- **API Documentation**: FastAPI auto-generated OpenAPI/Swagger
- **Containerization**: Docker & Docker Compose

## �📚 Documentation

- [Database Setup Guide](DATABASE_SETUP.md)
- [Migration Guide](MIGRATION_GUIDE.md)
- [Implementation Status](IMPLEMENTATION_STATUS.md)
- [Quick Start Guide](QUICK_START.md)
- [Setup Guide](SETUP_GUIDE.md)

## � API Documentation

When running the backend locally, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🐳 Docker Development

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Access individual services
docker-compose exec backend bash
docker-compose exec frontend bash
```

## 📝 License

MIT
