-- Clean Setup Script for Supabase
-- Run this ONCE to set up everything fresh

-- Step 1: Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
DROP POLICY IF EXISTS "Allow all operations on sites" ON sites;
DROP POLICY IF EXISTS "Allow all operations on materials" ON materials;
DROP POLICY IF EXISTS "Allow all operations on history_events" ON history_events;
DROP POLICY IF EXISTS "Allow all operations on inventory" ON inventory;

-- Step 2: Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS history_events CASCADE;
DROP TABLE IF EXISTS materials CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS inventory CASCADE;

-- Step 3: Create tables
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_name TEXT,
  contact_no TEXT,
  aadhar_photo TEXT,
  address TEXT,
  referral TEXT,
  created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  advance_deposit DECIMAL(10,2) DEFAULT 0
);

CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  location TEXT NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  last_settlement_date TIMESTAMPTZ,
  original_rent_charge DECIMAL(10,2) DEFAULT 0,
  original_issue_lc DECIMAL(10,2) DEFAULT 0,
  vehicle_no TEXT,
  challan_no TEXT
);

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  material_type_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  initial_quantity INTEGER NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  has_own_labor BOOLEAN DEFAULT FALSE
);

CREATE TABLE history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('Issued', 'Returned', 'Payment')),
  material_type_id TEXT,
  quantity INTEGER,
  amount DECIMAL(10,2),
  has_own_labor BOOLEAN,
  quantity_lost INTEGER,
  payment_method TEXT
);

CREATE TABLE inventory (
  material_type_id TEXT PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 0
);

-- Step 4: Create indexes for better performance
CREATE INDEX idx_sites_customer_id ON sites(customer_id);
CREATE INDEX idx_materials_site_id ON materials(site_id);
CREATE INDEX idx_history_events_site_id ON history_events(site_id);
CREATE INDEX idx_customers_name ON customers(name);

-- Step 5: Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sites" ON sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on history_events" ON history_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);

-- Step 7: Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Done! Now go to http://localhost:5173/setup to initialize inventory
