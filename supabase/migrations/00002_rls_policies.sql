-- SaloneCare Phase 2: Row Level Security policies

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_doctor_id()
RETURNS UUID AS $$
  SELECT id FROM doctors WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.current_pharmacy_id()
RETURNS UUID AS $$
  SELECT id FROM pharmacies WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'User'),
    CASE
      WHEN NEW.raw_user_meta_data ->> 'role' IN ('patient', 'doctor', 'pharmacy', 'admin')
      THEN (NEW.raw_user_meta_data ->> 'role')::user_role
      ELSE 'patient'::user_role
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin())
  WITH CHECK (auth.uid() = id OR is_admin());

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  WITH CHECK (is_admin() OR auth.uid() = id);

-- ---------------------------------------------------------------------------
-- doctors
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view approved doctors"
  ON doctors FOR SELECT
  USING (
    approval_status = 'approved'
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "Doctors can insert own record"
  ON doctors FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Doctors can update own record"
  ON doctors FOR UPDATE
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can delete doctors"
  ON doctors FOR DELETE
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- pharmacies
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view approved pharmacies"
  ON pharmacies FOR SELECT
  USING (
    approval_status = 'approved'
    OR user_id = auth.uid()
    OR is_admin()
  );

CREATE POLICY "Pharmacy users can insert own record"
  ON pharmacies FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Pharmacy users can update own record"
  ON pharmacies FOR UPDATE
  USING (user_id = auth.uid() OR is_admin())
  WITH CHECK (user_id = auth.uid() OR is_admin());

CREATE POLICY "Admins can delete pharmacies"
  ON pharmacies FOR DELETE
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- appointments
-- ---------------------------------------------------------------------------

CREATE POLICY "Patients and doctors can view their appointments"
  ON appointments FOR SELECT
  USING (
    patient_id = auth.uid()
    OR doctor_id = current_doctor_id()
    OR is_admin()
  );

CREATE POLICY "Patients can book appointments"
  ON appointments FOR INSERT
  WITH CHECK (patient_id = auth.uid());

CREATE POLICY "Patients and doctors can update appointments"
  ON appointments FOR UPDATE
  USING (
    patient_id = auth.uid()
    OR doctor_id = current_doctor_id()
    OR is_admin()
  )
  WITH CHECK (
    patient_id = auth.uid()
    OR doctor_id = current_doctor_id()
    OR is_admin()
  );

-- ---------------------------------------------------------------------------
-- conversations
-- ---------------------------------------------------------------------------

CREATE POLICY "Participants can view conversations"
  ON conversations FOR SELECT
  USING (
    patient_id = auth.uid()
    OR doctor_id = current_doctor_id()
    OR is_admin()
  );

CREATE POLICY "Participants can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    patient_id = auth.uid()
    OR doctor_id = current_doctor_id()
  );

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------

CREATE POLICY "Conversation participants can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.patient_id = auth.uid()
          OR c.doctor_id = current_doctor_id()
          OR is_admin()
        )
    )
  );

CREATE POLICY "Conversation participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
        AND (
          c.patient_id = auth.uid()
          OR c.doctor_id = current_doctor_id()
        )
    )
  );

-- ---------------------------------------------------------------------------
-- prescriptions
-- ---------------------------------------------------------------------------

CREATE POLICY "Patients and doctors can view prescriptions"
  ON prescriptions FOR SELECT
  USING (
    patient_id = auth.uid()
    OR doctor_id = current_doctor_id()
    OR verified_by_pharmacy_id = current_pharmacy_id()
    OR is_admin()
  );

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (doctor_id = current_doctor_id());

CREATE POLICY "Doctors and pharmacies can update prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    doctor_id = current_doctor_id()
    OR verified_by_pharmacy_id = current_pharmacy_id()
    OR is_admin()
  )
  WITH CHECK (
    doctor_id = current_doctor_id()
    OR verified_by_pharmacy_id = current_pharmacy_id()
    OR is_admin()
  );

-- ---------------------------------------------------------------------------
-- medicines
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view catalog medicines"
  ON medicines FOR SELECT
  USING (
    pharmacy_id IS NULL
    OR pharmacy_id = current_pharmacy_id()
    OR is_admin()
    OR EXISTS (
      SELECT 1 FROM pharmacies p
      WHERE p.id = medicines.pharmacy_id AND p.approval_status = 'approved'
    )
  );

CREATE POLICY "Pharmacy users can manage inventory"
  ON medicines FOR INSERT
  WITH CHECK (
    pharmacy_id = current_pharmacy_id()
    OR is_admin()
  );

CREATE POLICY "Pharmacy users can update inventory"
  ON medicines FOR UPDATE
  USING (pharmacy_id = current_pharmacy_id() OR is_admin())
  WITH CHECK (pharmacy_id = current_pharmacy_id() OR is_admin());

CREATE POLICY "Pharmacy users can delete inventory"
  ON medicines FOR DELETE
  USING (pharmacy_id = current_pharmacy_id() OR is_admin());

-- ---------------------------------------------------------------------------
-- prescription_medicines
-- ---------------------------------------------------------------------------

CREATE POLICY "Prescription participants can view items"
  ON prescription_medicines FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM prescriptions pr
      WHERE pr.id = prescription_medicines.prescription_id
        AND (
          pr.patient_id = auth.uid()
          OR pr.doctor_id = current_doctor_id()
          OR is_admin()
          OR EXISTS (
            SELECT 1 FROM pharmacies p
            WHERE p.user_id = auth.uid() AND p.approval_status = 'approved'
          )
        )
    )
  );

CREATE POLICY "Doctors can add prescription items"
  ON prescription_medicines FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions pr
      WHERE pr.id = prescription_id AND pr.doctor_id = current_doctor_id()
    )
  );

-- ---------------------------------------------------------------------------
-- emergency_contacts (public read, admin write)
-- ---------------------------------------------------------------------------

CREATE POLICY "Anyone can view active emergency contacts"
  ON emergency_contacts FOR SELECT
  USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage emergency contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update emergency contacts"
  ON emergency_contacts FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete emergency contacts"
  ON emergency_contacts FOR DELETE
  USING (is_admin());

-- ---------------------------------------------------------------------------
-- Realtime (Phase 9)
-- ---------------------------------------------------------------------------

ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
