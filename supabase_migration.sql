-- Supabase SQL Migration for Food Order App
-- Run this in your Supabase SQL Editor

-- Enable RLS
alter table if exists profiles enable row level security;
alter table if exists menu_items enable row level security;
alter table if exists orders enable row level security;
alter table if exists order_items enable row level security;
alter table if exists favorites enable row level security;

-- Drop existing tables if they exist (be careful in production!)
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists favorites cascade;
drop table if exists menu_items cascade;
drop table if exists profiles cascade;

-- Profiles table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text unique,
  phone text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Menu items table
create table menu_items (
  id serial primary key,
  name text not null,
  photo text,
  description text,
  price decimal(10,2) not null,
  stock integer default 10,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table orders (
  id serial primary key,
  user_id uuid references profiles(id) on delete set null,
  user_name text,
  phone text,
  address text,
  total_price decimal(10,2),
  status text default 'pending' check (status in ('pending', 'preparing', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order items table
create table order_items (
  id serial primary key,
  order_id integer references orders(id) on delete cascade,
  item_name text,
  price decimal(10,2),
  quantity integer
);

-- Favorites table
create table favorites (
  id serial primary key,
  user_id uuid references profiles(id) on delete cascade,
  menu_item_id integer references menu_items(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, menu_item_id)
);

-- RLS Policies

-- Profiles: users can read all profiles, update own
create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

-- Menu items: readable by all, admin only for write
create policy "Menu items are viewable by everyone"
  on menu_items for select using (true);

create policy "Only admins can insert menu items"
  on menu_items for insert with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can update menu items"
  on menu_items for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Only admins can delete menu items"
  on menu_items for delete using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Orders: users can see own orders, admins see all
create policy "Users can view own orders"
  on orders for select using (
    user_id = auth.uid() or
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Users can create orders"
  on orders for insert with check (user_id = auth.uid());

create policy "Admins can update orders"
  on orders for update using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Order items: linked to orders policy
create policy "Order items viewable by order owner"
  on order_items for select using (
    exists (
      select 1 from orders 
      where orders.id = order_items.order_id 
      and (orders.user_id = auth.uid() or exists (select 1 from profiles where id = auth.uid() and role = 'admin'))
    )
  );

create policy "Users can create order items"
  on order_items for insert with check (true);

-- Favorites: users manage own
create policy "Users can view own favorites"
  on favorites for select using (user_id = auth.uid());

create policy "Users can insert own favorites"
  on favorites for insert with check (user_id = auth.uid());

create policy "Users can delete own favorites"
  on favorites for delete using (user_id = auth.uid());

-- Function to reduce stock
create or replace function reduce_stock(item_id integer, qty integer)
returns void as $$
begin
  update menu_items set stock = greatest(0, stock - qty) where id = item_id;
end;
$$ language plpgsql security definer;

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email, role)
  values (new.id, new.raw_user_meta_data->>'name', new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Insert sample menu items
insert into menu_items (name, photo, description, price, stock, category) values
('Fish Amok', 'FishAmok.jpg', 'Traditional Khmer fish curry steamed in banana leaf', 4.50, 10, 'khmer'),
('Beef Lok Lak', 'BeefLokLak.jpg', 'Stir fried beef cubes with pepper sauce and rice', 4.50, 10, 'khmer'),
('Khmer Noodle Soup', 'KhmerNoodle.jpg', 'Classic Cambodian noodle soup with fresh herbs', 3.50, 5, 'khmer'),
('Bai Sach Jruk', 'BaySachJruk.jpg', 'Grilled pork with rice and pickled vegetables', 3.00, 4, 'khmer'),
('Burger', 'Burgur.jpg', 'Juicy beef burger with cheese and fries', 4.50, 10, 'fastfood'),
('Fried Chicken', 'FriedChicken.jpg', 'Crispy fried chicken with dipping sauce', 4.00, 9, 'fastfood'),
('Hot Dog', 'HotDog.jpg', 'Classic hot dog with mustard and ketchup', 3.00, 6, 'fastfood'),
('French Fries', 'FrenchFried.jpg', 'Crispy golden fries with ketchup', 2.50, 8, 'fastfood'),
('Spaghetti Bolognese', 'Spaghetti.jpg', 'Classic pasta with beef tomato sauce', 4.50, 10, 'pasta'),
('Carbonara', 'Carbonara.jpg', 'Creamy pasta with bacon and egg sauce', 4.50, 10, 'pasta'),
('Pesto Pasta', 'PestoPasta.jpg', 'Pasta with fresh basil pesto sauce', 4.00, 10, 'pasta'),
('Bibimbap', 'Bibimbap.jpg', 'Mixed rice bowl with vegetables and egg', 4.50, 10, 'korean'),
('Tteokbokki', 'Tteokbokki.jpg', 'Spicy rice cakes in red pepper sauce', 4.00, 6, 'korean'),
('Korean Fried Chicken', 'KoreanFriedChicken.jpg', 'Crispy chicken with sweet and spicy glaze', 4.50, 10, 'korean'),
('Kimbab', 'Kimbab.jpg', 'Korean rice rolls with vegetables and egg', 3.50, 10, 'korean'),
('Fresh Lime Juice', 'FreshLimeJuice.jpg', 'Freshly squeezed lime juice with ice', 2.00, 10, 'drink'),
('Sugar Cane Juice', 'SugarCaneJuice.jpg', 'Fresh sugar cane juice served cold', 2.00, 10, 'drink'),
('Iced Coffee', 'IceCoffee.jpg', 'Cambodian style iced coffee with condensed milk', 2.50, 10, 'drink'),
('Coconut Shake', 'CoconutShake.jpg', 'Fresh coconut blended with ice and milk', 1.00, 10, 'drink'),
('Banh Janeuk', '699db52d5e4ee.jpg', 'Chewy Khmer glutinous rice balls in sweet ginger soup', 2.00, 7, 'dessert'),
('Nom Akor', '699db5496c466.jpg', 'Soft steamed rice cakes with sweet coconut cream', 1.50, 10, 'dessert'),
('Nom Korng', '699db634f0bf1.jpg', 'Crispy Cambodian donuts with palm sugar filling', 1.50, 10, 'dessert'),
('Nom Plae Ai', '699db7a14c37e.jpg', 'Sticky rice sweet balls with palm sugar and coconut', 2.00, 10, 'dessert'),
('Num Ansom Chek', '699db7f7be6d1.jpg', 'Traditional steamed sticky rice cake with banana', 1.50, 10, 'dessert'),
('Sankhya Lapov', '699db856a61c6.jpg', 'Creamy Cambodian pumpkin custard', 3.50, 10, 'dessert'),
('Pizza', '69a3cb1116556.jpg', 'Classic Italian flatbread with tomato sauce and mozzarella', 3.50, 10, 'fastfood'),
('Matcha Latte', '69c62476c0b64.jpg', 'Smooth matcha blended with fresh milk', 2.00, 6, 'drink');
