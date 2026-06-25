-- Run this in Supabase SQL Editor to fix the id column type issue
-- https://supabase.com/dashboard/project/zipqopowyrcsnpgjcdoi/sql/new

-- Step 1: Drop existing table (if it exists)
DROP TABLE IF EXISTS orders;

-- Step 2: Recreate with TEXT id (no UUID)
CREATE TABLE orders (
  id TEXT PRIMARY KEY DEFAULT 'ord-' || substr(md5(random()::text), 1, 9),
  tracking_code TEXT UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  shipping_fee NUMERIC NOT NULL DEFAULT 150,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 3: Disable Row Level Security
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Step 4: Grant full access
GRANT ALL ON orders TO anon, authenticated, service_role;
