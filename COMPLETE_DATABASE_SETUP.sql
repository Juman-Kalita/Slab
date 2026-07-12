-- =============================================================================
-- SLAB RENTAL — COMPLETE DATABASE SETUP
-- Recreates the entire schema the app expects. Safe to run on an empty project.
-- Run in Supabase → SQL Editor. Idempotent (IF NOT EXISTS / ON CONFLICT).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- USERS (admin / employees) — created first (history_events references it)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true
);

-- ---------------------------------------------------------------------------
-- CUSTOMERS
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  registration_name TEXT,
  contact_no TEXT,
  contacts TEXT,                       -- JSON string: [{"name":"..","number":".."}]
  aadhar_photo TEXT,
  address TEXT,
  referral TEXT,
  created_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  advance_deposit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- SITES
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  location TEXT NOT NULL,
  issue_date TIMESTAMPTZ NOT NULL,
  grace_period_end_date TIMESTAMPTZ,
  amount_paid DECIMAL(10, 2) DEFAULT 0,
  last_settlement_date TIMESTAMPTZ,
  original_rent_charge DECIMAL(10, 2) DEFAULT 0,
  original_issue_lc DECIMAL(10, 2) DEFAULT 0,
  vehicle_no TEXT,
  challan_no TEXT,
  total_due_override DECIMAL(10, 2),
  use_override BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- MATERIALS (currently-held quantities per site)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- HISTORY EVENTS (issue / return / payment / invoice)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS history_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('Issued', 'Returned', 'Payment', 'Invoice')),
  material_type_id TEXT,
  quantity INTEGER,
  amount DECIMAL(10, 2),
  has_own_labor BOOLEAN,
  quantity_lost INTEGER,
  payment_method TEXT,
  payment_screenshot TEXT,
  employee_id UUID REFERENCES users(id),
  transport_charges DECIMAL(10, 2),
  vehicle_no TEXT,
  challan_no TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- INVENTORY (leave empty — app falls back to built-in default stock)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventory (
  material_type_id TEXT PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- ACTIVITY LOG (audit trail)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- INDEXES
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sites_customer_id       ON sites(customer_id);
CREATE INDEX IF NOT EXISTS idx_materials_site_id        ON materials(site_id);
CREATE INDEX IF NOT EXISTS idx_history_events_site_id   ON history_events(site_id);
CREATE INDEX IF NOT EXISTS idx_history_events_employee  ON history_events(employee_id);
CREATE INDEX IF NOT EXISTS idx_customers_name           ON customers(name);
CREATE INDEX IF NOT EXISTS idx_sites_location           ON sites(location);
CREATE INDEX IF NOT EXISTS idx_users_username           ON users(username);
CREATE INDEX IF NOT EXISTS idx_activity_log_user        ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_timestamp   ON activity_log(timestamp DESC);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY — permissive (client uses the publishable/anon key)
-- ---------------------------------------------------------------------------
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites          ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials      ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory      ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log   ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','customers','sites','materials','history_events','inventory','activity_log']
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Allow all on %1$s" ON %1$s;', t);
    EXECUTE format('CREATE POLICY "Allow all on %1$s" ON %1$s FOR ALL USING (true) WITH CHECK (true);', t);
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- updated_at TRIGGERS
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sites_updated_at ON sites;
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- SEED: default admin (username: solvix / password: sahil123)
-- ---------------------------------------------------------------------------
INSERT INTO users (username, password_hash, role, full_name, is_active)
VALUES ('solvix', 'sahil123', 'admin', 'Admin User', true)
ON CONFLICT (username) DO NOTHING;
