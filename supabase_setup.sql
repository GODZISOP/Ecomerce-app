-- Run this in your Supabase SQL Editor at https://supabase.com/dashboard
-- Go to: Project > SQL Editor > New Query > paste this > Run

CREATE TABLE IF NOT EXISTS orders (
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

-- Disable Row Level Security so backend can read/write freely
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;

-- Allow all operations from service role (backend)
GRANT ALL ON orders TO anon, authenticated, service_role;
