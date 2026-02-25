-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for authenticated users)
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on sites" ON sites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on materials" ON materials FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on history_events" ON history_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on inventory" ON inventory FOR ALL USING (true) WITH CHECK (true);
