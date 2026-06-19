"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';

type Facility = {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  latitude: number;
  longitude: number;
  type: 'hospital' | 'pharmacy';
  distance?: number;
};

type FilterType = 'all' | 'hospital' | 'pharmacy';

type RouteInfo = {
  distance: string;
  duration: string;
  coordinates: [number, number][];
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return `${h}h ${m}m`;
}

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev >= value) { clearInterval(timer); return value; }
        return prev + Math.ceil(value / 30);
      });
    }, 40);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{count}{suffix}</span>;
}

function getOpenStatus(): { open: boolean; label: string } {
  const now = new Date();
  const h = now.getHours() * 60 + now.getMinutes();
  const d = now.getDay();
  if (d === 0) return { open: false, label: 'Closed Sunday' };
  if (d === 6) return h >= 480 && h <= 900 ? { open: true, label: 'Open 08:00-15:00' } : { open: false, label: 'Closed' };
  return h >= 480 && h <= 1020 ? { open: true, label: 'Open 08:00-17:00' } : { open: false, label: h < 480 ? 'Opens 08:00' : 'Closed 17:00' };
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
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [maxDistance, setMaxDistance] = useState(25);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [routeTarget, setRouteTarget] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const routeLayer = useRef<any>(null);
  const routeMarkers = useRef<any[]>([]);
  const facilityMarkers = useRef<any[]>([]);
  const userMarker = useRef<any>(null);

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
        setLoading(true); setError(null);
        const [hospitalsRes, pharmaciesRes] = await Promise.all([
          fetch(`/api/facilities?type=hospital&lat=${userLocation.lat}&lng=${userLocation.lng}`),
          fetch(`/api/facilities?type=pharmacy&lat=${userLocation.lat}&lng=${userLocation.lng}`),
        ]);
        if (!hospitalsRes.ok) { const t = await hospitalsRes.text(); console.error('Hospitals API error:', hospitalsRes.status, t); throw new Error('Failed to load facilities'); }
        if (!pharmaciesRes.ok) { const t = await pharmaciesRes.text(); console.error('Pharmacies API error:', pharmaciesRes.status, t); throw new Error('Failed to load facilities'); }
        const [hospitalsData, pharmaciesData] = await Promise.all([hospitalsRes.json(), pharmaciesRes.json()]);
        setHospitals(hospitalsData.data || []);
        setPharmacies(pharmaciesData.data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load facilities. Please try again.');
      } finally { setLoading(false); }
    }
    loadFacilities();
  }, [userLocation]);

  const allFacilities = useMemo(() => {
    const all = [...hospitals.map((h) => ({ ...h, type: 'hospital' as const })), ...pharmacies.map((p) => ({ ...p, type: 'pharmacy' as const }))];
    const hasQuery = submittedQuery.trim().length > 0;
    return all
      .filter((f) => hasQuery || f.type === 'hospital' || (f.distance || 0) <= maxDistance)
      .filter((f) => filterType === 'all' || f.type === filterType)
      .filter((f) => f.name.toLowerCase().includes(submittedQuery.toLowerCase()) || (f.address && f.address.toLowerCase().includes(submittedQuery.toLowerCase())));
  }, [hospitals, pharmacies, maxDistance, filterType, submittedQuery]);

  const stats = useMemo(() => ({
    hospitals: hospitals.length, pharmacies: pharmacies.length, total: hospitals.length + pharmacies.length,
  }), [hospitals, pharmacies]);

  const iconMap: Record<string, string> = { hospital: '🏥', pharmacy: '💊' };
  const colorMap: Record<string, { badge: string; gradient: string; light: string; icon: string }> = {
    hospital: { badge: 'bg-blue-50 text-blue-700', gradient: 'from-blue-500 to-blue-600', light: 'bg-blue-50', icon: 'text-blue-600' },
    pharmacy: { badge: 'bg-emerald-50 text-emerald-700', gradient: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50', icon: 'text-emerald-600' },
  };

  const openInGoogleMaps = useCallback((facility: Facility) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${facility.latitude},${facility.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  }, [userLocation]);

  const clearRoute = useCallback(() => {
    if (routeLayer.current) { routeLayer.current.remove(); routeLayer.current = null; }
    routeMarkers.current.forEach((m: any) => m.remove());
    routeMarkers.current = [];
    setRouteInfo(null);
    setRouteTarget(null);
  }, []);

  const showRoute = useCallback(async (facility: Facility) => {
    if (!userLocation) return;
    clearRoute();
    setRouteTarget(facility.id);
    setRouteLoading(true);

    const L = (window as any).L;
    if (!L || !mapInstance.current) { setRouteLoading(false); return; }

    const map = mapInstance.current;
    const startLng = userLocation.lng;
    const startLat = userLocation.lat;
    const endLng = facility.longitude;
    const endLat = facility.latitude;

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (!data.routes?.[0]) throw new Error('No route found');

      const route = data.routes[0];
      const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);

      routeLayer.current = L.polyline(coords, {
        color: '#0F6FFF', weight: 4, opacity: 0.8, dashArray: null, lineCap: 'round', lineJoin: 'round',
      }).addTo(map);

      const animLayer = L.polyline([coords[0]], {
        color: '#14B8A6', weight: 4, opacity: 0.6, dashArray: '10, 10',
      }).addTo(map);

      let step = 1;
      const anim = setInterval(() => {
        if (step >= coords.length) { clearInterval(anim); return; }
        animLayer.setLatLngs(coords.slice(0, step + 1));
        step++;
      }, 30);

      const startIcon = L.divIcon({
        html: `<div style="width:14px;height:14px;background:#0F6FFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2)"></div>`,
        className: '', iconSize: [14, 14], iconAnchor: [7, 7],
      });
      const endIcon = L.divIcon({
        html: `<div style="width:36px;height:36px;background:white;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.15);border:2px solid #0F6FFF;font-size:16px">🏥</div>`,
        className: '', iconSize: [36, 36], iconAnchor: [18, 18],
      });

      const sMarker = L.marker([startLat, startLng], { icon: startIcon, zIndexOffset: 1000 }).addTo(map);
      const eMarker = L.marker([endLat, endLng], { icon: endIcon, zIndexOffset: 1000 }).addTo(map);
      routeMarkers.current = [sMarker, eMarker];

      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });

      const distKm = (route.distance / 1000).toFixed(1);
      const durMin = route.duration / 60;
      setRouteInfo({ distance: `${distKm} km`, duration: formatDuration(durMin), coordinates: coords });
    } catch {
      const coords: [number, number][] = [[startLat, startLng], [endLat, endLng]];
      routeLayer.current = L.polyline(coords, {
        color: '#0F6FFF', weight: 3, opacity: 0.7, dashArray: '8, 8',
      }).addTo(map);
      map.fitBounds(L.latLngBounds(coords), { padding: [50, 50] });
      const d = facility.distance || 0;
      setRouteInfo({ distance: `${d} km`, duration: `~${formatDuration(d * 3)}`, coordinates: coords });
    }
    setRouteLoading(false);
  }, [userLocation, clearRoute]);

  const initMap = useCallback(() => {
    if (!mapContainer.current || !userLocation) return;
    if (typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }

    const map = L.map(mapContainer.current, { zoomControl: false, zoomSnap: 0.5, zoomDelta: 1 })
      .setView([userLocation.lat, userLocation.lng], 13);
    mapInstance.current = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map);

    const pulseHtml = `
      <div style="position:relative;width:28px;height:28px">
        <div style="position:absolute;inset:0;background:rgba(15,111,255,0.25);border-radius:50%;animation:pulse 2s infinite"></div>
        <div style="position:absolute;inset:4px;background:#0F6FFF;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>
      </div>
      <style>@keyframes pulse{0%{transform:scale(1);opacity:0.6}50%{transform:scale(2.5);opacity:0}100%{transform:scale(1);opacity:0.6}}</style>`;

    const userIcon = L.divIcon({
      html: pulseHtml, className: '', iconSize: [28, 28], iconAnchor: [14, 14],
    });
    userMarker.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(map)
      .bindPopup('<div style="font-weight:600;font-size:13px">You are here</div>');

    const all = [...hospitals.map((h) => ({ ...h, type: 'hospital' as const })), ...pharmacies.map((p) => ({ ...p, type: 'pharmacy' as const }))];

    all.forEach((f) => {
      const isHospital = f.type === 'hospital';
      const markerColor = isHospital ? '#0F6FFF' : '#14B8A6';
      const icon = L.divIcon({
        html: `<div style="width:38px;height:38px;background:white;border-radius:12px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(15,111,255,0.2);border:2.5px solid ${markerColor};font-size:17px;transition:transform 0.2s">${isHospital ? '🏥' : '💊'}</div>`,
        className: '', iconSize: [38, 38], iconAnchor: [19, 19],
      });
      const mapLat = userLocation!.lat;
      const mapLng = userLocation!.lng;
      const marker = L.marker([f.latitude, f.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:220px">
            <div style="font-weight:700;font-size:15px;margin-bottom:4px;color:#0F172A">${f.name}</div>
            <div style="font-size:12px;color:#64748B;margin-bottom:4px">${f.address || ''}</div>
            ${f.description ? `<div style="font-size:11px;color:#64748B;margin-bottom:4px;line-height:1.4">${f.description}</div>` : ''}
            <div style="font-size:12px;color:#64748B;margin-bottom:4px">${f.phone ? '📞 ' + f.phone : ''}</div>
            <div style="font-size:12px;color:#0F6FFF;font-weight:600;margin-bottom:8px">${f.distance ? f.distance + ' km away' : 'Distance unknown'}</div>
            <a href="https://www.google.com/maps/dir/?api=1&origin=${mapLat},${mapLng}&destination=${f.latitude},${f.longitude}&travelmode=driving" target="_blank" style="display:inline-flex;align-items:center;gap:4px;background:#0F6FFF;color:white;padding:6px 14px;border-radius:8px;border:none;cursor:pointer;font-size:12px;font-weight:600;text-decoration:none">Get Directions</a>
            <button onclick="window.__showRoute && window.__showRoute('${f.id}')" style="display:inline-flex;align-items:center;gap:4px;background:white;color:#0F6FFF;padding:6px 14px;border-radius:8px;border:2px solid #0F6FFF;cursor:pointer;font-size:12px;font-weight:600;margin-left:6px">Show on Map</button>
          </div>
        `);
      marker._facilityId = f.id;
      facilityMarkers.current.push(marker);
    });
  }, [userLocation, hospitals, pharmacies]);

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
    return () => { if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; } };
  }, [userLocation, loading, initMap]);

  useEffect(() => {
    (window as any).__showRoute = (id: string) => {
      const f = allFacilities.find((x) => x.id === id);
      if (f) showRoute(f);
    };
  }, [allFacilities, showRoute]);

  const openStatus = getOpenStatus();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0F6FFF] to-[#14B8A6] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">SC</div>
              <span className="font-bold text-[#0F172A] text-lg tracking-tight">Salone<span className="text-[#0F6FFF]">Care</span></span>
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition">Sign In</Link>
              <Link href="/signup" className="text-sm bg-[#0F6FFF] text-white px-5 py-2 rounded-xl hover:bg-[#0A5CD6] transition font-semibold shadow-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0F6FFF] via-[#0A5CD6] to-[#0F172A]">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#14B8A6]/10 blur-3xl" />
          <svg viewBox="0 0 400 400" className="absolute top-20 right-20 w-64 h-64 text-white/5">
            <path d="M200 50C120 50 50 120 50 200s70 150 150 150 150-70 150-150S280 50 200 50zm0 260c-60 0-110-50-110-110S140 90 200 90s110 50 110 110-50 110-110 110z" fill="currentColor"/>
            <path d="M200 110l-15 45h-45l35 25-15 45 40-30 40 30-15-45 35-25h-45z" fill="currentColor"/>
          </svg>
          <svg viewBox="0 0 400 400" className="absolute bottom-10 left-10 w-48 h-48 text-[#14B8A6]/5">
            <path d="M200 50C120 50 50 120 50 200s70 150 150 150 150-70 150-150S280 50 200 50zm0 260c-60 0-110-50-110-110S140 90 200 90s110 50 110 110-50 110-110 110z" fill="currentColor"/>
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-white/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Healthcare Facilities Across Sierra Leone
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tight">
              Find Healthcare<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-white">Near You</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mb-8 leading-relaxed">
              Locate hospitals, pharmacies, and healthcare services across Sierra Leone instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 max-w-lg">
                <div className="relative group">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#0F6FFF] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { setSubmittedQuery(searchQuery); } }}
                    placeholder="Search by hospital name, pharmacy..."
                    className="w-full pl-12 pr-4 py-3.5 bg-white/95 backdrop-blur-sm rounded-2xl text-[#0F172A] placeholder-gray-400 shadow-xl focus:outline-none focus:ring-2 focus:ring-[#14B8A6] text-sm border border-white/20"
                  />
                </div>
              </div>
              <button
                onClick={() => setSubmittedQuery(searchQuery)}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#14B8A6] text-white rounded-2xl hover:bg-[#0F9E8E] transition font-semibold shadow-lg hover:shadow-xl active:scale-[0.97]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                Search
              </button>
              <button
                onClick={() => navigator.geolocation.getCurrentPosition(
                  (p) => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude }),
                  () => {}
                )}
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-2xl hover:bg-white/20 transition font-semibold border border-white/20 active:scale-[0.97]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Use My Location
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-7 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: 'Hospitals Available', value: stats.hospitals, icon: '🏥', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50' },
            { label: 'Pharmacies Nearby', value: stats.pharmacies, icon: '💊', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Facilities', value: stats.total, icon: '📍', color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50' },
            { label: 'Coverage Area', value: 14, suffix: ' cities', icon: '🌍', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100/80 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-110 transition-transform duration-300`}>{stat.icon}</div>
                <span className="text-2xl font-bold text-[#0F172A]"><AnimatedCounter value={stat.value} suffix={stat.suffix || ''} /></span>
              </div>
              <p className="text-xs text-[#64748B] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* FILTER BAR */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/80 p-3 sm:p-4 mb-5">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-1.5">
              {[
                { key: 'all' as FilterType, label: 'All Facilities', icon: '📍' },
                { key: 'hospital' as FilterType, label: 'Hospitals', icon: '🏥' },
                { key: 'pharmacy' as FilterType, label: 'Pharmacies', icon: '💊' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilterType(f.key)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97] ${
                    filterType === f.key ? 'bg-[#0F6FFF] text-white shadow-sm' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0F6FFF]'
                  }`}
                >
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSubmittedQuery(e.target.value); }}
                  placeholder="Search by name..."
                  className="pl-9 pr-3 py-2 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] w-full sm:w-44 transition-all"
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
              {routeInfo && (
                <button onClick={clearRoute} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition border border-red-200 active:scale-[0.97]">
                  Clear Route
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-5">
          {/* MAP COLUMN */}
          <div className="lg:w-[40%] order-2 lg:order-1">
            <div className={`${showMobileMap ? 'fixed inset-0 z-50' : 'relative'} lg:sticky lg:top-20`}>
              <div className={`bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden ${showMobileMap ? 'h-full rounded-none' : ''}`}>
                <div className="relative">
                  <div ref={mapContainer} className={`${showMobileMap ? 'h-screen' : 'h-[350px] lg:h-[620px]'} bg-gradient-to-br from-blue-50 to-emerald-50`} />

                  {routeInfo && (
                    <div className="absolute bottom-4 left-3 right-3 z-[1000]">
                      <div className="bg-white/90 backdrop-blur-lg rounded-xl p-3 shadow-xl border border-white/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
                            <svg className="w-4 h-4 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                            {routeInfo.distance}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-[#0F172A]">
                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {routeInfo.duration}
                          </div>
                        </div>
                        <button onClick={clearRoute} className="text-xs text-red-600 font-semibold hover:underline">Clear</button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      if (userLocation && mapInstance.current) {
                        mapInstance.current.setView([userLocation.lat, userLocation.lng], 13);
                      }
                    }}
                    className="absolute top-3 right-3 z-[1000] w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg flex items-center justify-center hover:bg-white transition border border-gray-200/80 active:scale-95"
                    title="Recenter"
                  >
                    <svg className="w-5 h-5 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </button>

                  {!loading && userLocation && !routeInfo && (
                    <div className="absolute top-3 left-3 z-[1000]">
                      <div className="bg-white/80 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-lg border border-white/50">
                        <p className="text-xs font-semibold text-[#0F172A]">{allFacilities.length} facilities found</p>
                        <p className="text-[10px] text-[#64748B] mt-0.5">
                          {filterType === 'pharmacy' ? `Pharmacies within ${maxDistance} km` : filterType === 'hospital' ? 'All hospitals' : 'All hospitals + pharmacies nearby'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowMobileMap(!showMobileMap)}
                className="lg:hidden fixed bottom-6 right-6 z-50 bg-[#0F6FFF] text-white px-5 py-3 rounded-2xl shadow-xl font-semibold text-sm flex items-center gap-2 hover:bg-[#0A5CD6] transition active:scale-[0.97]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                {showMobileMap ? 'Show List' : 'Show Map'}
              </button>
            </div>
          </div>

          {/* LIST COLUMN */}
          <div className="lg:w-[60%] order-1 lg:order-2">
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-red-100">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </div>
                <p className="text-red-700 font-semibold mb-1">{error}</p>
                <button onClick={() => window.location.reload()} className="text-sm text-red-600 underline hover:text-red-800">Try again</button>
              </div>
            )}

            {!loading && !error && allFacilities.length === 0 && (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2">No facilities found</h3>
                <p className="text-[#64748B]">Try searching for a hospital name, adjust your distance filter, or check the map for all facilities</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-3" id="facility-list">
                {allFacilities.map((facility) => {
                  const colors = colorMap[facility.type];
                  const isRouteActive = routeTarget === facility.id;
                  return (
                    <div
                      key={`${facility.type}-${facility.id}`}
                      className={`group bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                        isRouteActive
                          ? 'border-[#0F6FFF] shadow-lg ring-1 ring-[#0F6FFF]/20'
                          : 'border-gray-100/80 hover:border-[#0F6FFF]/30'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${colors.light} rounded-2xl flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          {iconMap[facility.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-[#0F172A] group-hover:text-[#0F6FFF] transition truncate">{facility.name}</h3>
                            <span className={`shrink-0 text-[10px] font-semibold px-2.5 py-1 rounded-full ${colors.badge}`}>
                              {facility.type === 'hospital' ? 'Hospital' : 'Pharmacy'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            {facility.distance && (
                              <span className="text-[11px] text-[#64748B] font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                {facility.distance} km
                              </span>
                            )}
                          </div>
                          {facility.description && (
                            <p className="text-xs text-[#64748B] mb-2 leading-relaxed">{facility.description}</p>
                          )}
                          <p className="text-sm text-[#64748B] mb-3 truncate flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {facility.address || 'Address not available'}
                          </p>
                          <div className="flex items-center gap-2 mb-3">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                              openStatus.open ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${openStatus.open ? 'bg-emerald-500' : 'bg-red-500'}`} />
                              {openStatus.label}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={facility.phone ? `tel:${facility.phone}` : '#'}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r ${colors.gradient} text-white rounded-xl text-xs font-semibold hover:opacity-90 transition shadow-sm active:scale-[0.97] ${!facility.phone ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {facility.phone || 'Not available'}
                            </a>
                            {userLocation && (
                              <>
                                <button
                                  onClick={() => openInGoogleMaps(facility)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F6FFF] text-white rounded-xl text-xs font-semibold hover:bg-[#0A5CD6] transition shadow-sm active:scale-[0.97]"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                                  Get Directions
                                </button>
                                <button
                                  onClick={() => {
                                    showRoute(facility);
                                    const el = document.getElementById('facility-list');
                                    if (el && window.innerWidth < 1024) {
                                      setShowMobileMap(true);
                                    }
                                  }}
                                  disabled={routeLoading && isRouteActive}
                                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition active:scale-[0.97] ${
                                    isRouteActive
                                      ? 'bg-[#0F6FFF] text-white shadow-sm'
                                      : 'bg-white border-2 border-gray-200 text-[#0F172A] hover:border-[#0F6FFF] hover:text-[#0F6FFF]'
                                  } disabled:opacity-50`}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                  {routeLoading && isRouteActive ? 'Loading' : isRouteActive ? 'Route Active' : 'Show on Map'}
                                </button>
                              </>
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

      {/* EMERGENCY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-red-500 via-red-600 to-red-700 rounded-3xl p-6 sm:p-10">
          <div className="absolute inset-0">
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
            <svg viewBox="0 0 200 200" className="absolute -bottom-8 -left-8 w-40 h-40 text-white/10">
              <path d="M100 20C80 20 60 40 60 60s20 40 40 40 40-20 40-40-20-40-40-40z" fill="currentColor"/>
              <path d="M100 65l-6 18h-18l15 10-6 18 15-12 15 12-6-18 15-10h-18z" fill="currentColor"/>
            </svg>
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white text-sm font-medium px-4 py-1.5 rounded-full mb-3 border border-white/10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                Emergency Services
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">Need Emergency Assistance?</h2>
              <p className="text-red-100/80">Call 117 for immediate medical emergency response</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a href="tel:117" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-red-600 rounded-2xl font-bold hover:bg-red-50 transition shadow-xl active:scale-[0.97]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call 117
              </a>
              <Link href="/emergency" className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-semibold hover:bg-white/20 transition border border-white/20 active:scale-[0.97]">
                View Contacts
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(2.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
