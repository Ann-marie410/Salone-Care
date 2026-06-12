import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'hospital' or 'pharmacy'
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');

    if (type === 'hospital') {
      // Fetch hospitals from emergency_contacts
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('contact_type', 'hospital');

      if (error) throw error;

      const defaultLat = 8.4949;
      const defaultLng = -13.2317;

      const hospitals = (data || []).map((h: any) => {
        const facilityLat = h.latitude ?? defaultLat;
        const facilityLng = h.longitude ?? defaultLng;
        return {
          id: h.id,
          name: h.name,
          address: h.description,
          phone: h.phone,
          latitude: facilityLat,
          longitude: facilityLng,
          type: 'hospital',
          distance: calculateDistance(lat, lng, facilityLat, facilityLng),
        };
      });

      return Response.json({ data: hospitals });
    } else if (type === 'pharmacy') {
      // Fetch pharmacies from pharmacies table
      const { data, error } = await supabase
        .from('pharmacies')
        .select('id, user_id, name, address, latitude, longitude, phone')
        .eq('approval_status', 'approved');

      if (error) throw error;

      const pharmacies = (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        phone: p.phone,
        latitude: p.latitude,
        longitude: p.longitude,
        type: 'pharmacy',
        distance: calculateDistance(lat, lng, p.latitude, p.longitude),
      }));

      // Sort by distance
      pharmacies.sort((a: any, b: any) => (a.distance || 0) - (b.distance || 0));

      return Response.json({ data: pharmacies });
    }

    return Response.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Facilities API error:', error);
    return Response.json({ error: 'Failed to fetch facilities' }, { status: 500 });
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Round to 1 decimal place
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
