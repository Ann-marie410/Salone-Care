-- SaloneCare Phase 2: Initial database schema

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'pharmacy', 'admin');

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'completed'
);

CREATE TYPE prescription_status AS ENUM ('valid', 'invalid', 'expired', 'used');

-- ---------------------------------------------------------------------------
-- profiles (extends auth.users)
-- ---------------------------------------------------------------------------

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles (role);

-- ---------------------------------------------------------------------------
-- doctors
-- ---------------------------------------------------------------------------

CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles (id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  hospital_affiliation TEXT NOT NULL,
  license_url TEXT,
  stamp_url TEXT,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_user_id ON doctors (user_id);
CREATE INDEX idx_doctors_approval_status ON doctors (approval_status);
CREATE INDEX idx_doctors_specialization ON doctors (specialization);

-- ---------------------------------------------------------------------------
-- pharmacies
-- ---------------------------------------------------------------------------

CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT NOT NULL,
  stamp_url TEXT,
  approval_status approval_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pharmacies_user_id ON pharmacies (user_id);
CREATE INDEX idx_pharmacies_approval_status ON pharmacies (approval_status);
CREATE INDEX idx_pharmacies_location ON pharmacies (latitude, longitude);

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors (id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  ai_summary JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX idx_appointments_doctor_id ON appointments (doctor_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments (scheduled_at);
CREATE INDEX idx_appointments_status ON appointments (status);

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors (id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, doctor_id)
);

CREATE INDEX idx_conversations_patient_id ON conversations (patient_id);
CREATE INDEX idx_conversations_doctor_id ON conversations (doctor_id);
CREATE INDEX idx_conversations_appointment_id ON conversations (appointment_id);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages (conversation_id);
CREATE INDEX idx_messages_created_at ON messages (created_at);

-- ---------------------------------------------------------------------------
-- prescriptions
-- ---------------------------------------------------------------------------

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors (id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments (id) ON DELETE SET NULL,
  prescription_code TEXT NOT NULL UNIQUE,
  status prescription_status NOT NULL DEFAULT 'valid',
  stamp_url TEXT,
  notes TEXT,
  expires_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by_pharmacy_id UUID REFERENCES pharmacies (id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescriptions_doctor_id ON prescriptions (doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions (patient_id);
CREATE INDEX idx_prescriptions_code ON prescriptions (prescription_code);
CREATE INDEX idx_prescriptions_status ON prescriptions (status);

-- ---------------------------------------------------------------------------
-- medicines (catalog + pharmacy inventory via nullable pharmacy_id)
-- ---------------------------------------------------------------------------

CREATE TABLE medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID REFERENCES pharmacies (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  dosage_form TEXT,
  strength TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  quantity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medicines_pharmacy_id ON medicines (pharmacy_id);
CREATE INDEX idx_medicines_name ON medicines (name);

-- ---------------------------------------------------------------------------
-- prescription_medicines (links prescriptions to medicines with dosage)
-- ---------------------------------------------------------------------------

CREATE TABLE prescription_medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions (id) ON DELETE CASCADE,
  medicine_id UUID REFERENCES medicines (id) ON DELETE SET NULL,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT,
  instructions TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prescription_medicines_prescription_id ON prescription_medicines (prescription_id);

-- ---------------------------------------------------------------------------
-- emergency_contacts
-- ---------------------------------------------------------------------------

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  contact_type TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_emergency_contacts_active ON emergency_contacts (is_active);
CREATE INDEX idx_emergency_contacts_location ON emergency_contacts (latitude, longitude);

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER pharmacies_updated_at
  BEFORE UPDATE ON pharmacies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER medicines_updated_at
  BEFORE UPDATE ON medicines
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER emergency_contacts_updated_at
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
