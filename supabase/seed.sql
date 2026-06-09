-- SaloneCare Phase 2: Seed emergency contacts for Sierra Leone

INSERT INTO emergency_contacts (name, phone, contact_type, description) VALUES
  ('Emergency Services (117)', '117', 'emergency', 'National emergency number'),
  ('Connaught Hospital', '+232 22 228 394', 'hospital', 'Main referral hospital in Freetown'),
  ('Red Cross Sierra Leone', '+232 76 612 345', 'ambulance', 'Emergency ambulance and disaster response'),
  ('Police Emergency', '999', 'police', 'Sierra Leone Police emergency line');
