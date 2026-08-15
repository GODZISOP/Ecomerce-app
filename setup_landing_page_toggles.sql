-- Run this script in your Supabase SQL Editor to enable 1-click Landing Page Toggles

ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_deal BOOLEAN DEFAULT false;
ALTER TABLE medicines ADD COLUMN IF NOT EXISTS is_special_offer BOOLEAN DEFAULT false;

-- Optional: Mark initial items as featured, deals, or special offers
UPDATE medicines SET is_featured = true WHERE id IN (1, 2, 3, 4);
UPDATE medicines SET is_deal = true WHERE category = 'Deals';
UPDATE medicines SET is_special_offer = true WHERE id IN (5, 6);
