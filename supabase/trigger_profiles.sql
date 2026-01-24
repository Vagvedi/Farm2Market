-- ============================================
-- AUTO-CREATE PROFILES TRIGGER
-- ============================================
-- WHY: When a user signs up via Supabase Auth, they are created in auth.users
--      but NOT automatically in the profiles table. This trigger ensures
--      every new user gets a profile row with default values.
--
-- SECURITY: Uses SECURITY DEFINER to bypass RLS during trigger execution
--           (required because trigger runs in system context, not user context)
-- ============================================

-- Step 1: Create the trigger function
-- This function will be called automatically when a new user is inserted into auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer -- 🔥 CRITICAL: Allows function to bypass RLS
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,                    -- Use the new user's UUID from auth.users
    coalesce(new.email, ''),   -- Use email as initial full_name (can be updated later)
    'farmer'                   -- Default role (can be changed by admin later)
  );
  return new;
end;
$$;

-- Step 2: Create the trigger on auth.users
-- This trigger fires AFTER a new row is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- VERIFICATION QUERIES (run these in Supabase SQL Editor)
-- ============================================
-- 1. Check if trigger exists:
    SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
--
-- 2. Check if function exists:
    SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
--
-- 3. Test: After a new user signs up, check:
    SELECT * FROM auth.users ORDER BY created_at DESC LIMIT 1;
    SELECT * FROM profiles ORDER BY created_at DESC LIMIT 1;
-- ============================================
