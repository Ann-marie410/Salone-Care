import { NextResponse } from 'next/server';

export async function GET() {
  const sql = `-- Run this SQL in your Supabase Dashboard SQL Editor
-- Go to: https://supabase.com/dashboard/project/_/sql/new

-- 1. Add approval_status column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS approval_status approval_status NOT NULL DEFAULT 'approved';

-- 2. Set existing doctors and pharmacies to pending
UPDATE profiles SET approval_status = 'pending'
  WHERE role IN ('doctor', 'pharmacy')
  AND (approval_status IS DISTINCT FROM 'rejected');

CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON profiles (approval_status);

-- 3. Add price column to medicines
ALTER TABLE medicines
  ADD COLUMN IF NOT EXISTS price NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

CREATE INDEX IF NOT EXISTS idx_medicines_price ON medicines (price);

-- 4. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies(id) ON DELETE CASCADE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  notes TEXT,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  medicine_id UUID REFERENCES medicines(id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Fix pharmacy_id mismatch — update seed pharmacy data to We Health Pharmacy
-- All medicines and orders currently use the seed pharmacy ID (30000000-...)
-- but the logged-in pharmacy user belongs to We Health Pharmacy (eb293ccb-...)
UPDATE medicines
  SET pharmacy_id = 'eb293ccb-9e7a-4ca9-b4eb-4ea48e5a549f'
  WHERE pharmacy_id = '30000000-0000-0000-0000-000000000001';

UPDATE orders
  SET pharmacy_id = 'eb293ccb-9e7a-4ca9-b4eb-4ea48e5a549f'
  WHERE pharmacy_id = '30000000-0000-0000-0000-000000000001';`;

  return NextResponse.json({
    message: 'Copy the SQL below and run it in your Supabase Dashboard SQL Editor',
    sql,
  });
}
