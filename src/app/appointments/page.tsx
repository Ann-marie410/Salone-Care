"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import Link from 'next/link';

type Doctor = { id: string; full_name: string; specialization: string; hospital_affiliation: string };
type Appointment = { id: string; scheduled_at: string; reason?: string; doctor_id: string };

export default function AppointmentsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'doctor') {
        router.push('/doctor/dashboard');
        return;
      }
      if (profile?.role === 'pharmacy') {
        router.push('/pharmacy/dashboard');
        return;
      }

      setCheckingRole(false);
      loadDoctors();
      loadAppointments();
    }

    async function loadDoctors() {
      const res = await fetch('/api/doctors');
      const json = await res.json();
      setDoctors(json.data || []);
    }

    init();
  }, []);

  async function loadAppointments() {
    const user = await supabase.auth.getUser();
    const uid = user.data.user?.id;
    if (!uid) return;

    const res = await fetch(`/api/appointments?patient_id=${uid}`);
    const json = await res.json();
    setAppointments(json.data || []);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDoctor || !scheduledAt) {
      setMessage('Please select a doctor and time');
      return;
    }

    setLoading(true);
    try {
      const user = await supabase.auth.getUser();
      const uid = user.data.user?.id;
      if (!uid) throw new Error('Not signed in');

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: uid, doctor_id: selectedDoctor, scheduled_at: scheduledAt, reason }),
      });

      if (res.ok) {
        setMessage('Appointment booked successfully!');
        setScheduledAt('');
        setReason('');
        setSelectedDoctor(null);
        loadAppointments();
      } else {
        setMessage('Failed to book appointment');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Error booking appointment');
    } finally {
      setLoading(false);
    }
  }

  if (checkingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            📅 Appointments
          </h1>
          <div className="flex gap-3">
            <Link href="/profile" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold">
              Profile
            </Link>
            <Link href="/" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold">
              Home
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Book Appointment Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Book New Appointment</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Doctor</label>
                <select 
                  value={selectedDoctor ?? ''} 
                  onChange={(e) => setSelectedDoctor(e.target.value)} 
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
                >
                  <option value="">Select a doctor...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      🏥 Dr. {d.full_name} — {d.specialization} — {d.hospital_affiliation}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={scheduledAt} 
                  onChange={(e) => setScheduledAt(e.target.value)} 
                  disabled={loading}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reason for Visit (Optional)</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  disabled={loading}
                  placeholder="Describe your symptoms or reason for visit..." 
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition resize-none"
                  rows={3}
                />
              </div>

              <button 
                type="submit" 
                disabled={loading || !selectedDoctor || !scheduledAt}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg"
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>

              {message && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  message.includes('successfully')
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </form>
          </div>

          {/* Your Appointments Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Appointments</h2>
            
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 text-lg">No appointments booked yet</p>
                <p className="text-gray-500 text-sm mt-2">Book your first appointment using the form on the left</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900">Appointment</h3>
                      <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold">Scheduled</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      📅 {new Date(appointment.scheduled_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {appointment.reason && (
                      <p className="text-sm text-gray-600">
                        💬 <strong>Reason:</strong> {appointment.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold mb-2">Total Appointments</p>
            <p className="text-3xl font-bold text-gray-900">{appointments.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold mb-2">Available Doctors</p>
            <p className="text-3xl font-bold text-gray-900">{doctors.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-semibold mb-2">Quick Action</p>
            <Link href="/messaging" className="text-blue-600 hover:text-blue-700 font-semibold">
              Message Doctor →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
