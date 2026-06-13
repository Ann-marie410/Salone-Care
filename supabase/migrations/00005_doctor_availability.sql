-- Add availability schedule to doctors table
-- Stores weekly availability as JSON: { "monday": ["09:00-12:00", "14:00-17:00"], ... }

ALTER TABLE doctors
  ADD COLUMN availability JSONB DEFAULT NULL;

CREATE INDEX idx_doctors_availability ON doctors (availability);
