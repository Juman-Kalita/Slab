-- Step 1: Create tables
CREATE TABLE customers (
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

CREATE TABLE sites (
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

CREATE TABLE materials (
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

CREATE TABLE history_events (
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

CREATE TABLE inventory (
  material_type_id TEXT PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
