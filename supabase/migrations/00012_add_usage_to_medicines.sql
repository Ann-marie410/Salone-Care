ALTER TABLE medicines
  ADD COLUMN usage TEXT;

CREATE INDEX idx_medicines_usage ON medicines (usage);
