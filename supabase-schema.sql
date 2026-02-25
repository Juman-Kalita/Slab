-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_name TEXT,
  contact_no TEXT,
  aadhar_photo TEXT,
  address TEXT,
  referral TEXT,
  created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  advance_deposit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sites table
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  location TEXT NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  last_settlement_date TIMESTAMPTZ,
  original_rent_charge DECIMAL(10, 2) DEFAULT 0,
  original_issue_lc DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  material_type_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  initial_quantity INTEGER NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  has_own_labor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create history_events table
CREATE TABLE IF NOT EXISTS history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('Issued', 'Returned', 'Payment')),
  material_type_id TEXT,
  quantity INTEGER,
  amount DECIMAL(10, 2),
  has_own_labor BOOLEAN,
  quantity_lost INTEGER,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  material_type_id TEXT PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sites_customer_id ON sites(customer_id);
CREATE INDEX IF NOT EXISTS idx_materials_site_id ON materials(site_id);
CREATE INDEX IF NOT EXISTS idx_history_events_site_id ON history_events(site_id);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
CREATE INDEX IF NOT EXISTS idx_sites_location ON sites(location);

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now - you can restrict later)
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sites" ON sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on history_events" ON history_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
