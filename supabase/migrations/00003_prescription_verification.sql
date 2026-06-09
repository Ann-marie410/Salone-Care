-- SaloneCare Phase 2: Secure prescription verification for pharmacies

CREATE OR REPLACE FUNCTION public.verify_prescription_by_code(p_code TEXT)
RETURNS TABLE (
  id UUID,
  prescription_code TEXT,
  status prescription_status,
  patient_name TEXT,
  doctor_name TEXT,
  expires_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pharmacies p
    WHERE p.user_id = auth.uid() AND p.approval_status = 'approved'
  ) THEN
    RAISE EXCEPTION 'Only approved pharmacy users can verify prescriptions';
  END IF;

  RETURN QUERY
  SELECT
    pr.id,
    pr.prescription_code,
    pr.status,
    pp.full_name AS patient_name,
    dp.full_name AS doctor_name,
    pr.expires_at,
    pr.notes,
    pr.created_at
  FROM prescriptions pr
  JOIN profiles pp ON pp.id = pr.patient_id
  JOIN doctors d ON d.id = pr.doctor_id
  JOIN profiles dp ON dp.id = d.user_id
  WHERE pr.prescription_code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.mark_prescription_used(p_code TEXT)
RETURNS prescriptions AS $$
DECLARE
  result prescriptions;
  pharmacy_uuid UUID;
BEGIN
  SELECT id INTO pharmacy_uuid
  FROM pharmacies
  WHERE user_id = auth.uid() AND approval_status = 'approved';

  IF pharmacy_uuid IS NULL THEN
    RAISE EXCEPTION 'Only approved pharmacy users can mark prescriptions as used';
  END IF;

  UPDATE prescriptions
  SET
    status = 'used',
    verified_at = NOW(),
    verified_by_pharmacy_id = pharmacy_uuid
  WHERE prescription_code = p_code AND status = 'valid'
  RETURNING * INTO result;

  IF result IS NULL THEN
    RAISE EXCEPTION 'Prescription not found or not valid';
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
