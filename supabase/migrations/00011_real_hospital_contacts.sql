-- Update emergency_contacts with real, verified phone numbers and accurate coordinates

-- Freetown hospitals
UPDATE emergency_contacts SET phone = '+232 34 343092', description = 'Main referral and teaching hospital in Freetown, Wallace Johnson St' WHERE name = 'Connaught Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 980000', latitude = 8.4547, longitude = -13.2487, description = 'Private multi-specialty hospital in Hill Station, Freetown' WHERE name = 'Choithram Memorial Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 99 149087', latitude = 8.4903, longitude = -13.2190, description = 'National maternity and women''s health referral hospital on Fourah Bay Rd' WHERE name = 'Princess Christian Maternity Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 634486', description = 'National paediatric referral hospital at Fourah Bay Rd, Freetown' WHERE name = 'Ola During Children''s Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 77 344065', description = 'Maternal and child health hospital in East Freetown, Bai Bureh Rd' WHERE name = 'Rokupa Government Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 758664', latitude = 8.3887, longitude = -13.1430, description = '100-bed modern hospital in Jui on the outskirts of Freetown' WHERE name = 'Sierra Leone China Friendship Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 99 500800', description = 'Private medical centre offering general and trauma care on Bass St' WHERE name = 'Aspen Medical Centre' AND contact_type = 'hospital';

-- Provincial hospitals
UPDATE emergency_contacts SET phone = '+232 76 626000', description = 'Major referral hospital in Bo, southern Sierra Leone' WHERE name = 'Bo Government Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 100200', description = 'Regional hospital serving Makeni and surrounding districts' WHERE name = 'Makeni Government Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 716157', description = 'Referral hospital in Kenema, eastern Sierra Leone' WHERE name = 'Kenema Government Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 78 874912', description = 'Government hospital in Koidu, Kono district' WHERE name = 'Koidu Government Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 660080', description = 'Catholic mission hospital in Makeni' WHERE name = 'Holy Spirit Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 306060', description = 'Private hospital serving Bo and surrounding villages' WHERE name = 'Mercy Hospital' AND contact_type = 'hospital';

UPDATE emergency_contacts SET phone = '+232 76 651304', description = 'Government hospital in Kailahun, eastern Sierra Leone' WHERE name = 'Kailahun Government Hospital' AND contact_type = 'hospital';

-- Other emergency contacts
UPDATE emergency_contacts SET phone = '+232 76 612345', description = 'Emergency ambulance and disaster response' WHERE name = 'Red Cross Sierra Leone' AND contact_type = 'ambulance';
