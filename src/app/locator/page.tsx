"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
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

type FilterType = 'all' | 'hospital' | 'pharmacy';

function StarRating({ rating = 4.5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= value) { clearInterval(timer); return value; }
        return prev + Math.ceil(value / 30);
      });
    }, 40);
    return () => clearInterval(timer);
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const TIME_SLOTS = [
  '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
  '13:00-14:00', '14:00-15:00', '15:00-16:00',
];

function getOpenStatus(): { open: boolean; label: string } {
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hour * 60 + minutes;
  const day = now.getDay();
  if (day === 0) return { open: false, label: 'Closed Sunday' };
  if (day === 6) {
    if (currentMinutes >= 480 && currentMinutes <= 900) return { open: true, label: 'Open 08:00-15:00' };
    return { open: false, label: 'Closed' };
  }
  if (currentMinutes >= 480 && currentMinutes <= 1020) return { open: true, label: 'Open 08:00-17:00' };
  if (currentMinutes < 480) return { open: false, label: 'Opens 08:00' };
  return { open: false, label: 'Closed 17:00' };
}

export default function LocatorPage() {
  const [hospitals, setHospitals] = useState<Facility[]>([]);
  const [pharmacies, setPharmacies] = useState<Facility[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    typeof navigator !== 'undefined' && !navigator.geolocation ? { lat: 8.4949, lng: -13.2317 } : null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [maxDistance, setMaxDistance] = useState(25);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<unknown>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setUserLocation({ lat: 8.4949, lng: -13.2317 })
      );
    }
  }, []);

  useEffect(() => {
    async function loadFacilities() {
      if (!userLocation) return;
      try {
        setLoading(true);
        setError(null);
        const [hospitalsRes, pharmaciesRes] = await Promise.all([
          fetch(`/api/facilities?type=hospital&lat=${userLocation.lat}&lng=${userLocation.lng}`),
          fetch(`/api/facilities?type=pharmacy&lat=${userLocation.lat}&lng=${userLocation.lng}`),
        ]);
        if (!hospitalsRes.ok || !pharmaciesRes.ok) throw new Error('Failed to load facilities');
        const [hospitalsData, pharmaciesData] = await Promise.all([hospitalsRes.json(), pharmaciesRes.json()]);
        setHospitals(hospitalsData.data || []);
        setPharmacies(pharmaciesData.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load facilities. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    loadFacilities();
  }, [userLocation]);

  const allFacilities = useMemo(() => {
    const facilities = [...hospitals.map((h) => ({ ...h, type: 'hospital' as const })), ...pharmacies.map((p) => ({ ...p, type: 'pharmacy' as const }))];
    return facilities
      .filter((f) => (f.distance || 0) <= maxDistance)
      .filter((f) => filterType === 'all' || f.type === filterType)
      .filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.address.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [hospitals, pharmacies, maxDistance, filterType, searchQuery]);

  const stats = useMemo(() => ({
    hospitals: hospitals.length,
    pharmacies: pharmacies.length,
    total: hospitals.length + pharmacies.length,
  }), [hospitals, pharmacies]);

  const iconMap = { hospital: '🏥', pharmacy: '💊' };
  const colorMap = { hospital: { bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600', light: 'from-blue-50 to-white' }, pharmacy: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', gradient: 'from-emerald-500 to-emerald-600', light: 'from-emerald-50 to-white' } };

  const initMap = useCallback(() => {
    if (!mapContainer.current || !userLocation) return;
    if (typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;
    if (mapInstance.current) {
      (mapInstance.current as any).remove();
      mapInstance.current = null;
    }

    const map = L.map(mapContainer.current, { zoomControl: false }).setView([userLocation.lat, userLocation.lng], 13);
    mapInstance.current = map;

    L.zoomControl({ position: 'bottomright' }).addTo(map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const userIcon = L.divIcon({
      html: `<div style="width:20px;height:20px;background:#0F6FFF;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(15,111,255,0.3),0 2px 8px rgba(0,0,0,0.2)"></div>`,
      className: '',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<div style="font-weight:600;font-size:13px">You are here</div>');

    [...hospitals.map((h) => ({ ...h, type: 'hospital' as const })), ...pharmacies.map((p) => ({ ...p, type: 'pharmacy' as const }))]
      .filter((f) => (f.distance || 0) <= maxDistance)
      .forEach((f) => {
        const isHospital = f.type === 'hospital';
        const markerColor = isHospital ? '#0F6FFF' : '#14B8A6';
        const icon = L.divIcon({
          html: `<div style="width:36px;height:36px;background:white;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid ${markerColor};font-size:16px">${isHospital ? '🏥' : '💊'}</div>`,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });
        L.marker([f.latitude, f.longitude], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:system-ui,sans-serif;min-width:200px">
              <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:#0F172A">${f.name}</div>
              <div style="font-size:12px;color:#64748B;margin-bottom:6px">${f.address}</div>
              <div style="font-size:12px;color:#0F6FFF;font-weight:600;margin-bottom:8px">${f.distance} km away</div>
              <a href="https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${f.latitude},${f.longitude}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:4px;background:#0F6FFF;color:white;padding:6px 14px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600">Get Directions</a>
            </div>
          `);
      });
  }, [userLocation, hospitals, pharmacies, maxDistance]);

  useEffect(() => {
    if (!mapContainer.current || !userLocation || loading) return;
    const loadLeaflet = async () => {
      if ((window as any).L) { initMap(); return; }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = initMap;
      document.head.appendChild(script);
    };
    loadLeaflet();
    return () => { if (mapInstance.current) { (mapInstance.current as any).remove(); mapInstance.current = null; } };
  }, [userLocation, loading, initMap]);

  const openStatus = getOpenStatus();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#0F6FFF] to-[#14B8A6] rounded-lg flex items-center justify-center text-white font-bold text-sm">SC</div>
              <span className="font-bold text-[#0F172A] text-lg">SaloneCare</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-3 py-2 transition">Sign In</Link>
              <Link href="/signup" className="text-sm bg-[#0F6FFF] text-white px-4 py-2 rounded-lg hover:bg-[#0A5CD6] transition font-semibold shadow-sm">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F6FFF] via-[#0A5CD6] to-[#0F172A]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#14B8A6] rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Healthcare Facilities Across Sierra Leone
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Find Healthcare<br />Near You
            </h1>
            <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mb-8">
              Locate hospitals, pharmacies, and healthcare services across Sierra Leone instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-lg">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospitals, pharmacies..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl text-[#0F172A] placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm"
                />
              </div>
              <button
                onClick={() => navigator.geolocation.getCurrentPosition(
                  (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                  () => {}
                )}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/15 backdrop-blur-sm text-white rounded-xl hover:bg-white/25 transition font-semibold border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Use My Location
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Hospitals Available', value: stats.hospitals, icon: '🏥', color: 'from-blue-500 to-blue-600' },
            { label: 'Pharmacies Nearby', value: stats.pharmacies, icon: '💊', color: 'from-emerald-500 to-emerald-600' },
            { label: 'Total Facilities', value: stats.total, icon: '📍', color: 'from-violet-500 to-violet-600' },
            { label: 'Coverage Area', value: 12, suffix: ' km', icon: '🌍', color: 'from-amber-500 to-amber-600' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-lg shadow-sm`}>{stat.icon}</div>
                <span className="text-2xl font-bold text-[#0F172A]">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                </span>
              </div>
              <p className="text-sm text-[#64748B] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as FilterType, label: 'All Facilities', icon: '📍' },
                { key: 'hospital' as FilterType, label: 'Hospitals', icon: '🏥' },
                { key: 'pharmacy' as FilterType, label: 'Pharmacies', icon: '💊' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    filterType === f.key
                      ? 'bg-[#0F6FFF] text-white shadow-sm'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0F6FFF]'
                  }`}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-3 py-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] w-full sm:w-48"
                />
              </div>
              <select
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="px-3 py-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
                <option value={100}>100+ km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map Column */}
          <div className="lg:w-[40%] order-2 lg:order-1">
            <div className={`${showMobileMap ? 'fixed inset-0 z-50' : 'relative'} lg:sticky lg:top-24`}>
              <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${showMobileMap ? 'h-full rounded-none' : ''}`}>
                <div className="relative">
                  <div ref={mapContainer} className={`${showMobileMap ? 'h-screen' : 'h-[400px] lg:h-[600px]'} bg-gradient-to-br from-blue-50 to-emerald-50`} />
                  {!loading && userLocation && (
                    <div className="absolute top-4 left-4 right-4 z-[1000]">
                      <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/50">
                        <p className="text-xs font-semibold text-[#0F172A]">
                          {allFacilities.length} facilities found
                        </p>
                        <p className="text-xs text-[#64748B] mt-0.5">{filterType === 'all' ? 'All types' : filterType === 'hospital' ? 'Hospitals' : 'Pharmacies'} within {maxDistance} km</p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => navigator.geolocation.getCurrentPosition(
                      (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                      () => {}
                    )}
                    className="absolute bottom-4 right-4 z-[1000] w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center hover:bg-gray-50 transition border border-gray-200"
                    title="Recenter"
                  >
                    <svg className="w-5 h-5 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMap(!showMobileMap)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#0F6FFF] text-white px-5 py-3 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                {showMobileMap ? 'Show List' : 'Show Map'}
              </button>
            </div>
          </div>

          {/* Facilities List Column */}
          <div className="lg:w-[60%] order-1 lg:order-2">
            {loading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-semibold">{error}</p>
                <button onClick={() => window.location.reload()} className="mt-3 text-sm text-red-600 underline">Try again</button>
              </div>
            )}

            {!loading && !error && allFacilities.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">No facilities found</h3>
                <p className="text-[#64748B]">Try adjusting your filters or search query</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-4">
                {allFacilities.map((facility) => {
                  const colors = colorMap[facility.type];
                  return (
                    <div
                      key={`${facility.type}-${facility.id}`}
                      className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#0F6FFF]/20 transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center text-xl shadow-sm shrink-0`}>
                          {iconMap[facility.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-[#0F172A] group-hover:text-[#0F6FFF] transition truncate">{facility.name}</h3>
                            <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                              {facility.type === 'hospital' ? 'Hospital' : 'Pharmacy'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <StarRating rating={4.0 + Math.random() * 1} />
                            {facility.distance && (
                              <span className="text-xs text-[#64748B] font-medium">{facility.distance} km</span>
                            )}
                          </div>
                          <p className="text-sm text-[#64748B] mb-3 truncate">{facility.address}</p>
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${
                              openStatus.open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${openStatus.open ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {openStatus.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`tel:${facility.phone}`}
                              className={`inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r ${colors.gradient} text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {facility.phone}
                            </a>
                            {userLocation && (
                              <a
                                href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.latitude},${facility.longitude}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border-2 border-gray-200 text-[#0F172A] rounded-xl text-sm font-semibold hover:border-[#0F6FFF] hover:text-[#0F6FFF] transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                Directions
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl p-8 sm:p-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-12 -right-12 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-sm font-medium px-4 py-1.5 rounded-full mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                Emergency Services
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">Need Emergency Assistance?</h2>
              <p className="text-red-100 text-lg">Call 117 for immediate medical emergency response</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href="tel:117" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-red-600 rounded-xl font-bold text-lg hover:bg-red-50 transition shadow-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call 117
              </a>
              <Link href="/emergency" className="inline-flex items-center gap-2 px-6 py-4 bg-white/15 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/25 transition border border-white/20">
                View Contacts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
