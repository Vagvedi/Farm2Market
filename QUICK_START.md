# Farm2Market - Quick Start Guide

## 🚀 3-Step Setup

### Step 1: Run SQL Trigger (CRITICAL)

1. Open **Supabase Dashboard** → **SQL Editor**
2. Copy entire contents of `supabase/trigger_profiles.sql`
3. Paste and click **Run**

**This creates the auto-profile trigger. Without this, profiles won't be created!**

---

### Step 2: Environment Variables

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=5000
```

**Frontend** (`frontend/.env`):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000/api
```

**Get keys from:** Supabase Dashboard → Settings → API

---

### Step 3: Run Project

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

---

## ✅ Verify It Works

1. **Sign up** a new user
2. **Check Supabase Dashboard:**
   - Authentication → Users (should see user)
   - Table Editor → profiles (should see profile with same ID)

If profile exists → ✅ Success!
If profile missing → ❌ Check trigger was run (Step 1)

---

## 📚 Full Documentation

- `SETUP_GUIDE.md` - Detailed setup and verification
- `IMPLEMENTATION_SUMMARY.md` - Complete feature list

---

## 🆘 Common Issues

**"Profiles not created"**
→ Run `supabase/trigger_profiles.sql` in Supabase SQL Editor

**"JWT authentication failed"**
→ Check environment variables are set correctly

**"CORS error"**
→ Ensure backend is running on port 5000

---

**That's it! You're ready to go! 🎉**
