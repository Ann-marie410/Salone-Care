-- Add price column to medicines table for the pharmacy cart system

ALTER TABLE medicines
  ADD COLUMN price NUMERIC(10, 2) NOT NULL DEFAULT 0.00;

CREATE INDEX idx_medicines_price ON medicines (price);
