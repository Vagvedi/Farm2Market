-- PROFILES TABLE
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text check (role in ('farmer', 'buyer', 'admin')) not null,
  created_at timestamp with time zone default now()
);


-- CROPS TABLE
create table crops (
  id uuid default gen_random_uuid() primary key,
  farmer_id uuid references profiles(id) on delete cascade,
  name text not null,
  price_per_kg numeric not null,
  quantity_kg numeric not null,
  image_url text,
  created_at timestamp with time zone default now()
);


-- ORDERS TABLE
create table orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references profiles(id) on delete cascade,
  status text check (status in ('pending', 'accepted', 'delivered')) default 'pending',
  created_at timestamp with time zone default now()
);


-- ORDER ITEMS TABLE
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  crop_id uuid references crops(id) on delete cascade,
  quantity_kg numeric not null,
  price_at_order numeric not null
);
