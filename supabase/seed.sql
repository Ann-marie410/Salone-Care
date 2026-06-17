-- SaloneCare Phase 2: Seed data for testing

-- Temporarily disable foreign key constraints for seeding
SET session_replication_role = replica;

-- ---------------------------------------------------------------------------
-- Emergency Contacts
-- ---------------------------------------------------------------------------

INSERT INTO emergency_contacts (name, phone, contact_type, description, latitude, longitude) VALUES
  ('Emergency Services (117)', '117', 'emergency', 'National emergency number', NULL, NULL),
  ('Connaught Hospital', '+232 34 343092', 'hospital', 'Main referral and teaching hospital in Freetown', 8.4870, -13.2345),
  ('Choithram Memorial Hospital', '+232 76 980000', 'hospital', 'Private multi-specialty hospital in Hill Station, Freetown', 8.4547, -13.2487),
  ('Princess Christian Maternity Hospital', '+232 99 149087', 'hospital', 'National maternity and women''s health referral hospital on Fourah Bay Rd', 8.4903, -13.2190),
  ('Ola During Children''s Hospital', '+232 76 634486', 'hospital', 'National paediatric referral hospital at Fourah Bay Rd', 8.4830, -13.2400),
  ('Rokupa Government Hospital', '+232 77 344065', 'hospital', 'Maternal and child health hospital in East Freetown', 8.4700, -13.2450),
  ('Sierra Leone China Friendship Hospital', '+232 76 758664', 'hospital', '100-bed modern hospital in Jui on the outskirts of Freetown', 8.3887, -13.1430),
  ('Aspen Medical Centre', '+232 99 500800', 'hospital', 'Private medical centre offering general and trauma care on Bass St', 8.4960, -13.2720),
  ('Bo Government Hospital', '+232 76 626000', 'hospital', 'Major referral hospital in Bo, southern Sierra Leone', 7.9610, -11.7390),
  ('Makeni Government Hospital', '+232 76 100200', 'hospital', 'Regional hospital serving Makeni and surrounding districts', 8.8820, -12.0430),
  ('Kenema Government Hospital', '+232 76 716157', 'hospital', 'Referral hospital in Kenema, eastern Sierra Leone', 7.8770, -11.1900),
  ('Koidu Government Hospital', '+232 78 874912', 'hospital', 'Government hospital in Koidu, Kono district', 8.6440, -10.9700),
  ('Holy Spirit Hospital', '+232 76 660080', 'hospital', 'Catholic mission hospital in Makeni', 8.8700, -12.0500),
  ('Mercy Hospital', '+232 76 306060', 'hospital', 'Private hospital serving Bo and surrounding villages', 7.9540, -11.7440),
  ('Port Loko Government Hospital', '+232 76 307070', 'hospital', 'Government hospital in Port Loko', 8.8410, -12.8260),
  ('Kabala Government Hospital', '+232 76 308080', 'hospital', 'Government hospital in Kabala, Koinadugu district', 9.5890, -11.5570),
  ('Magburaka Government Hospital', '+232 76 309090', 'hospital', 'Government hospital in Magburaka, Tonkolili district', 8.7230, -11.9490),
  ('Kailahun Government Hospital', '+232 76 651304', 'hospital', 'Government hospital in Kailahun, eastern Sierra Leone', 8.2820, -10.5690),
  ('Pujehun Government Hospital', '+232 76 311110', 'hospital', 'Government hospital in Pujehun, southern Sierra Leone', 7.3520, -11.7200),
  ('Kambia Government Hospital', '+232 76 312120', 'hospital', 'Government hospital in Kambia, northern Sierra Leone', 9.1250, -12.9220),
  ('Bonthe Government Hospital', '+232 76 313130', 'hospital', 'Government hospital on Bonthe Island', 7.5270, -12.5060),
  ('Red Cross Sierra Leone', '+232 76 612345', 'ambulance', 'Emergency ambulance and disaster response', NULL, NULL),
  ('Police Emergency', '999', 'police', 'Sierra Leone Police emergency line', NULL, NULL);

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

INSERT INTO medicines (id, pharmacy_id, name, generic_name, dosage_form, strength, in_stock, quantity, price, created_at, updated_at) VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Aspirin', 'Acetylsalicylic acid', 'tablet', '100mg', true, 50, 8.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'Amoxicillin', 'Amoxicillin', 'capsule', '500mg', true, 30, 20.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'Paracetamol', 'Paracetamol', 'tablet', '500mg', true, 100, 10.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'ORS (Oral Rehydration Salts)', 'Oral rehydration salts', 'powder', '20.5g sachet', true, 80, 10.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'Ibuprofen', 'Ibuprofen', 'tablet', '400mg', true, 45, 12.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', 'Chloroquine', 'Chloroquine phosphate', 'tablet', '250mg', true, 60, 15.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000007', '30000000-0000-0000-0000-000000000001', 'Vitamin C Tablets', 'Ascorbic acid', 'tablet', '500mg', true, 90, 15.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000001', 'Multivitamins', 'Multivitamin complex', 'tablet', '--', true, 70, 25.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000001', 'Cough Syrup (Simple)', 'Dextromethorphan', 'syrup', '100ml', true, 35, 20.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000010', '30000000-0000-0000-0000-000000000001', 'Malaria Rapid Test Kit', 'Malaria antigen test', 'kit', '1 test', true, 40, 25.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000011', '30000000-0000-0000-0000-000000000001', 'Zinc Tablets', 'Zinc sulfate', 'tablet', '20mg', true, 85, 10.00, NOW(), NOW()),
  ('40000000-0000-0000-0000-000000000012', '30000000-0000-0000-0000-000000000001', 'Antacids', 'Aluminium hydroxide + Magnesium hydroxide', 'tablet', '--', true, 55, 12.00, NOW(), NOW());

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

-- Re-enable foreign key constraints
SET session_replication_role = DEFAULT;
