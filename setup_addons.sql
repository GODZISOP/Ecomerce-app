-- Run this script in your Supabase SQL Editor

-- Step 1: Drop existing addons table if it exists to refresh schema
DROP TABLE IF EXISTS addons;

-- Step 2: Create the addons table with image_url
CREATE TABLE addons (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price_pkr NUMERIC NOT NULL,
  category TEXT DEFAULT 'General',
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Insert extra toppings and drinks
INSERT INTO addons (name, price_pkr, category, image_url) VALUES
  ('Extra Cheese - Small', 150, 'Toppings', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/cheese.png'),
  ('Extra Cheese - Regular', 200, 'Toppings', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/cheese.png'),
  ('Extra Cheese - Large', 300, 'Toppings', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/cheese.png'),
  ('Extra Meat - Small', 150, 'Toppings', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/meat.png'),
  ('Extra Meat - Regular', 200, 'Toppings', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/meat.png'),
  ('Extra Meat - Large', 300, 'Toppings', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/meat.png'),
  ('Pepsi 345 Ml', 100, 'Drinks', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/pepsi.png'),
  ('Pepsi 500 Ml', 120, 'Drinks', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/pepsi.png'),
  ('Sprite 345 Ml', 100, 'Drinks', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/sprite.png'),
  ('Sprite 500 Ml', 120, 'Drinks', 'https://zipqopowyrcsnpgjcdoi.supabase.co/storage/v1/object/public/medicines/sprite.png');

-- Step 4: Allow all users to read from the addons table
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on addons" 
ON addons FOR SELECT 
USING (true);
