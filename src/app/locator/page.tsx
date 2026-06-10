"use client";

import { useEffect, useState } from 'react';

type Facility = {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  type: 'hospital' | 'pharmacy';
  distance?: number;
};

export default function LocatorPage() {
  const [hospitals, setHospitals] = useState<Facility[]>([]);
  const [pharmacies, setPharmacies] = useState<Facility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Request user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          // Default to Freetown center
          setUserLocation({ lat: 8.465, lng: -13.2317 });
        }
      );
    }
  }, []);

  useEffect(() => {
    async function loadFacilities() {
      // Load hospitals (using emergency contacts as placeholder)
      const hospitalsRes = await fetch('/api/emergency-contacts');
      const hospitalsJson = await hospitalsRes.json();
      const hospitalContacts = hospitalsJson.data?.filter(
        (c: any) => c.contact_type === 'hospital'
      ) || [];

      // Load pharmacies
      const pharmaciesRes = await fetch('/api/pharmacies');
      const pharmaciesJson = await pharmaciesRes.json();

      // Convert to facility format
      setHospitals(
        hospitalContacts.map((h: any) => ({
          id: h.id,
          name: h.name,
          address: h.description,
          phone: h.phone,
          latitude: 8.4949,
          longitude: -13.2317,
          type: 'hospital' as const,
        }))
      );

      setPharmacies(
        pharmaciesJson.data?.map((p: any) => ({
          id: p.id,
          name: p.name,
          address: p.address,
          phone: p.phone,
          latitude: p.latitude,
          longitude: p.longitude,
          type: 'pharmacy' as const,
        })) || []
      );
    }

    loadFacilities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-purple-600 text-white p-6">
        <h1 className="text-3xl font-bold">Hospital & Pharmacy Locator</h1>
        <p className="text-sm mt-2">Find healthcare facilities near you</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {!userLocation && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
            <p className="text-blue-800">Requesting your location...</p>
          </div>
        )}

        {/* Hospitals */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🏥 Hospitals
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {hospitals.length > 0 ? (
              hospitals.map((h) => (
                <div key={h.id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
                  <h3 className="font-bold mb-2">{h.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{h.address}</p>
                  <a href={`tel:${h.phone}`} className="text-purple-600 font-semibold hover:underline">
                    {h.phone}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No hospitals found in your area</p>
            )}
          </div>
        </section>

        {/* Pharmacies */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            💊 Pharmacies
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {pharmacies.length > 0 ? (
              pharmacies.map((p) => (
                <div key={p.id} className="bg-white p-4 rounded shadow hover:shadow-lg transition">
                  <h3 className="font-bold mb-2">{p.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{p.address}</p>
                  <a href={`tel:${p.phone}`} className="text-purple-600 font-semibold hover:underline">
                    {p.phone}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-gray-600">No pharmacies found in your area</p>
            )}
          </div>
        </section>

        {/* Map Placeholder */}
        <div className="mt-8 bg-gray-200 rounded h-96 flex items-center justify-center border-2 border-dashed border-gray-400">
          <p className="text-gray-600">Map integration (OpenStreetMap/Leaflet.js) coming soon</p>
        </div>
      </div>
    </div>
  );
}
