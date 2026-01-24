# Farm2Market - Setup & Verification Guide

## 📋 Table of Contents
1. [Database Setup (Trigger for Profiles)](#database-setup)
2. [Verifying Auth Flow](#verifying-auth-flow)
3. [Environment Variables](#environment-variables)
4. [Running the Project](#running-the-project)

---

## 🗄️ Database Setup (Trigger for Profiles)

### Step 1: Run the Trigger SQL

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `supabase/trigger_profiles.sql`
4. Click **Run**

**What this does:**
- Creates a function `handle_new_user()` that automatically inserts a profile when a user signs up
- Creates a trigger `on_auth_user_created` that fires after INSERT on `auth.users`
- Uses `SECURITY DEFINER` to bypass RLS (required for system-level operations)

### Step 2: Verify Trigger Creation

Run these queries in Supabase SQL Editor:

```sql
-- Check if trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';

-- Check if function exists
SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
```

Both should return 1 row each.

---

## ✅ Verifying Auth Flow

### Method 1: Supabase Dashboard

1. **Sign up a new user** via the frontend
2. **Check `auth.users` table:**
   - Go to **Authentication** → **Users** in Supabase Dashboard
   - You should see the new user with email, created_at, etc.

3. **Check `profiles` table:**
   - Go to **Table Editor** → `profiles`
   - You should see a row with:
     - `id` = same as the user's UUID from auth.users
     - `full_name` = user's email (initially)
     - `role` = 'farmer' (default)
     - `created_at` = timestamp

### Method 2: SQL Queries

Run in Supabase SQL Editor:

```sql
-- Get latest user
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- Get corresponding profile
SELECT * 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 1;

-- Verify they match
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 5;
```

**Expected Result:** Every user in `auth.users` should have a corresponding row in `profiles`.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=5000
```

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:5000/api
```

**Where to find these:**
- Supabase Dashboard → **Settings** → **API**
- Copy `Project URL` and `anon public` key

---

## 🚀 Running the Project

### Backend

```bash
cd backend
npm install
npm run dev  # or npm start
```

Backend runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or Vite's default port)

---

## 🧪 Testing the Flow

1. **Sign Up:**
   - Go to frontend
   - Click "Sign Up"
   - Enter email and password
   - Check Supabase Dashboard → `auth.users` and `profiles` tables

2. **Login:**
   - Use the same credentials
   - Should redirect to Marketplace

3. **Add Crop (Farmer):**
   - Navigate to "My Crops"
   - Click "+ Add New Crop"
   - Fill form and submit
   - Verify in Supabase Dashboard → `crops` table

4. **Browse Marketplace:**
   - Navigate to "Marketplace"
   - See all available crops
   - Add items to cart

5. **Place Order:**
   - Add crops to cart
   - Click "Place Order"
   - Verify in Supabase Dashboard → `orders` and `order_items` tables

6. **View Orders:**
   - Navigate to "My Orders"
   - See order history

---

## 🔍 Troubleshooting

### Profiles not being created?

1. **Check trigger exists:**
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

2. **Check function exists:**
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
   ```

3. **Manually test the function:**
   ```sql
   -- This should work (but don't run in production)
   SELECT public.handle_new_user();
   ```

4. **Check RLS policies:**
   - Ensure `profiles` table has RLS enabled
   - The trigger function uses `SECURITY DEFINER`, so it should bypass RLS

### JWT authentication failing?

1. **Check backend middleware:**
   - Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
   - Check that token is being sent in `Authorization: Bearer <token>` header

2. **Check frontend:**
   - Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
   - Check browser console for errors

### RLS blocking operations?

- The trigger function uses `SECURITY DEFINER`, so it bypasses RLS
- User operations should work because RLS policies allow:
  - Users to insert their own profile (with `auth.uid() = id`)
  - Farmers to insert crops (with `auth.uid() = farmer_id`)
  - Buyers to create orders (with `auth.uid() = buyer_id`)

---

## 📝 Notes

- **RLS is ENABLED** on all tables (as required)
- **No service_role key** is used in frontend (security best practice)
- **Profiles are auto-created** via database trigger (best practice)
- **JWT authentication** is verified in backend middleware
- **Session persistence** is handled by Supabase Auth (stored in localStorage)

---

## 🎯 Next Steps (Optional Enhancements)

1. Add role-based routing (farmer vs buyer)
2. Add image upload functionality
3. Add order status updates (farmer can accept/deliver)
4. Add notifications
5. Add search/filter in marketplace
6. Add pagination for large datasets
