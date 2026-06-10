-- SaloneCare Phase 2: Seed data for testing

-- ---------------------------------------------------------------------------
-- Emergency Contacts
-- ---------------------------------------------------------------------------

INSERT INTO emergency_contacts (name, phone, contact_type, description) VALUES
  ('Emergency Services (117)', '117', 'emergency', 'National emergency number'),
  ('Connaught Hospital', '+232 22 228 394', 'hospital', 'Main referral hospital in Freetown'),
  ('Red Cross Sierra Leone', '+232 76 612 345', 'ambulance', 'Emergency ambulance and disaster response'),
  ('Police Emergency', '999', 'police', 'Sierra Leone Police emergency line');

-- ---------------------------------------------------------------------------
-- Sample Profiles (use placeholder UUIDs for demo)
-- ---------------------------------------------------------------------------

INSERT INTO profiles (id, role, full_name, phone, created_at, updated_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'doctor', 'Dr. James Sesay', '+232 76 123 456', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000002', 'doctor', 'Dr. Amara Bangura', '+232 76 234 567', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000003', 'patient', 'Mohamed Conteh', '+232 76 345 678', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000004', 'patient', 'Fatima Jalloh', '+232 76 456 789', NOW(), NOW()),
  ('10000000-0000-0000-0000-000000000005', 'pharmacy', 'Liberty Pharmacy', '+232 22 555 666', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Sample Doctors
-- ---------------------------------------------------------------------------

INSERT INTO doctors (id, user_id, specialization, hospital_affiliation, license_url, approval_status, bio, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cardiology', 'Connaught Hospital', 'https://example.com/license1.pdf', 'approved', 'Experienced cardiologist with 10+ years in private practice', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'General Practice', 'Freetown Medical Centre', 'https://example.com/license2.pdf', 'approved', 'General practitioner specializing in family medicine', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Sample Pharmacies
-- ---------------------------------------------------------------------------

INSERT INTO pharmacies (id, user_id, name, address, latitude, longitude, phone, approval_status, created_at, updated_at) VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 'Liberty Pharmacy', '123 Lumley St, Freetown', 8.4949, -13.2317, '+232 22 555 666', 'approved', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Sample Medicines
-- ---------------------------------------------------------------------------

INSERT INTO medicines (id, pharmacy_id, name, generic_name, dosage_form, strength, in_stock, quantity, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Aspirin', 'Acetylsalicylic acid', 'tablet', '100mg', true, 50, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Amoxicillin', 'Amoxicillin', 'capsule', '500mg', true, 30, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Paracetamol', 'Paracetamol', 'tablet', '500mg', true, 100, NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Sample Appointments
-- ---------------------------------------------------------------------------

INSERT INTO appointments (id, patient_id, doctor_id, scheduled_at, status, reason, created_at, updated_at) VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', NOW() + interval '2 days', 'pending', 'Chest pain consultation', NOW(), NOW()),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', NOW() + interval '3 days', 'pending', 'General checkup', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Sample Prescriptions
-- ---------------------------------------------------------------------------

INSERT INTO prescriptions (id, doctor_id, patient_id, appointment_id, prescription_code, status, notes, expires_at, created_at, updated_at) VALUES
  ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000001', 'RX-2024-001', 'valid', 'Take with food', NOW() + interval '30 days', NOW(), NOW());

-- ---------------------------------------------------------------------------
-- Sample Prescription Medicines
-- ---------------------------------------------------------------------------

INSERT INTO prescription_medicines (id, prescription_id, medicine_id, medicine_name, dosage, frequency, duration, instructions, created_at) VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'Aspirin', '100mg', 'Once daily', '7 days', 'Take in the morning with water', NOW());
