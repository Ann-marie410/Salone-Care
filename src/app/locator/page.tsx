"use client";

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);

  // Request user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied, using Freetown default:', error);
          // Default to Freetown center
          setUserLocation({ lat: 8.4949, lng: -13.2317 });
        }
      );
    } else {
      setUserLocation({ lat: 8.4949, lng: -13.2317 });
    }
  }, []);

  // Load facilities when location is available
  useEffect(() => {
    async function loadFacilities() {
      if (!userLocation) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch hospitals
        const hospitalsRes = await fetch(
          `/api/facilities?type=hospital&lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        if (!hospitalsRes.ok) throw new Error('Failed to load hospitals');
        const hospitalsData = await hospitalsRes.json();
        setHospitals(hospitalsData.data || []);

        // Fetch pharmacies
        const pharmaciesRes = await fetch(
          `/api/facilities?type=pharmacy&lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        if (!pharmaciesRes.ok) throw new Error('Failed to load pharmacies');
        const pharmaciesData = await pharmaciesRes.json();
        setPharmacies(pharmaciesData.data || []);

        setLoading(false);
      } catch (err) {
        console.error('Failed to load facilities:', err);
        setError('Failed to load facilities. Please try again.');
        setLoading(false);
      }
    }

    loadFacilities();
  }, [userLocation]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainer.current || !userLocation || loading) return;

    // Dynamically load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      // Load CSS
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };

    const initMap = () => {
      const L = (window as any).L;
      const map = L.map(mapContainer.current).setView([userLocation.lat, userLocation.lng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add user location marker
      L.circleMarker([userLocation.lat, userLocation.lng], {
        radius: 8,
        fillColor: '#1e40af',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup('Your Location');

      // Add hospital markers (red)
      hospitals.forEach((h) => {
        L.circleMarker([h.latitude, h.longitude], {
          radius: 10,
          fillColor: '#ef4444',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindPopup(`<div class="font-semibold">${h.name}</div><div class="text-sm">${h.address}</div><div class="text-xs text-gray-600">${h.distance} km away</div>`);
      });

      // Add pharmacy markers (green)
      pharmacies.forEach((p) => {
        L.circleMarker([p.latitude, p.longitude], {
          radius: 8,
          fillColor: '#22c55e',
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })
          .addTo(map)
          .bindPopup(`<div class="font-semibold">${p.name}</div><div class="text-sm">${p.address}</div><div class="text-xs text-gray-600">${p.distance} km away</div>`);
      });
    };

    loadLeaflet();
  }, [userLocation, hospitals, pharmacies, loading]);

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold">🏥 SaloneCare</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 rounded hover:bg-blue-700 transition">Sign In</Link>
            <Link href="/signup" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 transition font-semibold">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-white py-8 px-4 border-b border-blue-100">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">
            Hospital & Pharmacy Locator
          </h1>
          <p className="text-gray-600 text-lg">Find healthcare facilities near you with real-time distance</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {!userLocation && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-blue-800 font-semibold">📍 Requesting your location...</p>
            <p className="text-sm text-blue-700 mt-1">We'll use your location to show nearby facilities</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-red-800 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {loading && userLocation && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-6">
            <p className="text-blue-800 font-semibold">🔄 Loading facilities...</p>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Hospitals */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              🏥 <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-700">Hospitals</span>
            </h2>
            <div className="space-y-3">
              {hospitals.length > 0 ? (
                hospitals.map((h) => (
                  <div key={h.id} className="bg-gradient-to-br from-red-50 to-white p-4 rounded-lg border-l-4 border-red-500 shadow hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{h.name}</h3>
                      {h.distance && (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {h.distance} km
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">📍 {h.address}</p>
                    <a
                      href={`tel:${h.phone}`}
                      className="inline-block bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded hover:from-red-600 hover:to-red-700 transition font-semibold text-sm"
                    >
                      📞 {h.phone}
                    </a>
                  </div>
                ))
              ) : (
                !loading && (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600">No hospitals found in your area</p>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Pharmacies */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
              💊 <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">Pharmacies</span>
            </h2>
            <div className="space-y-3">
              {pharmacies.length > 0 ? (
                pharmacies.map((p) => (
                  <div key={p.id} className="bg-gradient-to-br from-green-50 to-white p-4 rounded-lg border-l-4 border-green-500 shadow hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{p.name}</h3>
                      {p.distance && (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          {p.distance} km
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">📍 {p.address}</p>
                    <a
                      href={`tel:${p.phone}`}
                      className="inline-block bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded hover:from-green-600 hover:to-green-700 transition font-semibold text-sm"
                    >
                      📞 {p.phone}
                    </a>
                  </div>
                ))
              ) : (
                !loading && (
                  <div className="bg-gray-50 p-6 rounded-lg text-center">
                    <p className="text-gray-600">No pharmacies found in your area</p>
                  </div>
                )
              )}
            </div>
          </section>
        </div>

        {/* Map Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-900">
            🗺️ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">Interactive Map</span>
          </h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div
              ref={mapContainer}
              className="w-full h-96 bg-gradient-to-br from-blue-100 to-blue-50"
            />
            <div className="p-4 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                🔵 Blue = Your Location | 🔴 Red = Hospital | 🟢 Green = Pharmacy
              </p>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="mt-8 bg-gradient-to-r from-blue-50 to-white p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-3">💡 How to Use</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✓ Allow location access to see facilities nearest to you</li>
            <li>✓ Distances are calculated in real-time based on your location</li>
            <li>✓ Click on any marker on the map for more details</li>
            <li>✓ Use your phone's call button to contact facilities directly</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
