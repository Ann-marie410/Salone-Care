-- Add approval_status to profiles for unified approval tracking
-- Default to 'approved' for patients, 'pending' for doctors/pharmacies

ALTER TABLE profiles
  ADD COLUMN approval_status approval_status NOT NULL DEFAULT 'approved';

UPDATE profiles SET approval_status = 'pending' WHERE role IN ('doctor', 'pharmacy');

CREATE INDEX idx_profiles_approval_status ON profiles (approval_status);
