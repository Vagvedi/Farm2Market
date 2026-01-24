-- Enable RLS
alter table profiles enable row level security;
alter table crops enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;


create policy "Users can view own profile"
on profiles
for select
using (auth.uid() = id);


create policy "Users can insert own profile"
on profiles
for insert
with check (auth.uid() = id);


create policy "Anyone can view crops"
on crops
for select
using (true);


create policy "Farmers can add crops"
on crops
for insert
with check (
  auth.uid() = farmer_id
);


create policy "Farmers update own crops"
on crops
for update
using (auth.uid() = farmer_id);


create policy "Farmers delete own crops"
on crops
for delete
using (auth.uid() = farmer_id);



create policy "Buyers can create orders"
on orders
for insert
with check (auth.uid() = buyer_id);


create policy "Buyers view own orders"
on orders
for select
using (auth.uid() = buyer_id);


create policy "Buyers add order items"
on order_items
for insert
with check (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.buyer_id = auth.uid()
  )
);


create policy "Buyers view own order items"
on order_items
for select
using (
  exists (
    select 1 from orders
    where orders.id = order_items.order_id
    and orders.buyer_id = auth.uid()
  )
);
