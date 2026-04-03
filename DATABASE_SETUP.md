# Database Setup Guide

## 🗄️ Initial Setup

### Step 1: Install MySQL

Make sure MySQL is installed and running on your system.

**Check if MySQL is running:**
```bash
# Windows
# Check Services or run:
mysql --version

# macOS/Linux
sudo systemctl status mysql
# or
mysql.server status
```

### Step 2: Initialize Database

Run the database initialization script:

```bash
cd backend
npm run init-db
```

This will:
- Create the `farm2market` database
- Create all required tables
- Set up views and triggers
- Insert initial admin user

### Step 3: Verify Tables

After running the init script, verify tables were created:

```bash
mysql -u root -p
```

Then in MySQL:
```sql
USE farm2market;
SHOW TABLES;
```

You should see:
- users
- farmer_profiles
- crops
- bids
- orders
- ratings
- admin_actions

### Step 4: (Optional) Load Sample Data

```bash
mysql -u root -p farm2market < database/seed.sql
```

## 🔧 Troubleshooting

### Issue: "MySQL connected successfully" but no tables

**Solution:**
1. Make sure you ran `npm run init-db`
2. Check if database exists:
   ```sql
   SHOW DATABASES;
   ```
3. If database doesn't exist, run the init script again
4. Check MySQL user permissions

### Issue: Connection refused

**Solution:**
1. Make sure MySQL server is running
2. Check your `.env` file credentials
3. Verify MySQL is listening on the correct port (default: 3306)

### Issue: Access denied

**Solution:**
1. Check your MySQL root password in `.env`
2. Make sure password doesn't have quotes (remove `"` if present)
3. Try connecting manually:
   ```bash
   mysql -u root -p
   ```

### Issue: Tables already exist

**Solution:**
The init script will skip existing tables. If you want to recreate:
```sql
DROP DATABASE IF EXISTS farm2market;
```
Then run `npm run init-db` again.

## 📝 Manual Setup (Alternative)

If the script doesn't work, you can run manually:

```bash
mysql -u root -p < database/schema.sql
```

## ✅ Verification

After setup, start the backend:

```bash
cd backend
npm run dev
```

You should see:
```
✅ MySQL connected successfully
🚀 Server running on port 5000
```

Then test the API:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","database":"MySQL"}
```
