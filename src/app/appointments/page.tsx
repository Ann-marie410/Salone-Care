"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Doctor = { id: string; specialization: string; hospital_affiliation: string };
type Appointment = { id: string; scheduled_at: string; reason?: string; doctor_id: string };

export default function AppointmentsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    async function loadDoctors() {
      const res = await fetch('/api/doctors');
      const json = await res.json();
      setDoctors(json.data || []);
    }

    loadDoctors();
  }, []);

  async function loadAppointments() {
    // For now, show all appointments for current user if logged in
    const user = supabase.auth.getUser();
    const uid = (await user).data.user?.id;
    if (!uid) return;

    const res = await fetch(`/api/appointments?patient_id=${uid}`);
    const json = await res.json();
    setAppointments(json.data || []);
  }

  useEffect(() => { loadAppointments(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    const uid = user.data.user?.id;
    if (!uid || !selectedDoctor || !scheduledAt) return alert('Missing fields or not signed in');

    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: uid, doctor_id: selectedDoctor, scheduled_at: scheduledAt, reason }),
    });

    setScheduledAt('');
    setReason('');
    loadAppointments();
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Appointments</h1>

      <section className="mb-8">
        <h2 className="text-xl mb-2">Book Appointment</h2>
        <form onSubmit={handleCreate} className="flex flex-col gap-2 max-w-md">
          <select value={selectedDoctor ?? ''} onChange={(e) => setSelectedDoctor(e.target.value)} className="p-2 border">
            <option value="">Select doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.specialization} — {d.hospital_affiliation}</option>
            ))}
          </select>
          <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="p-2 border" />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" className="p-2 border" />
          <button className="py-2 bg-blue-600 text-white rounded">Book</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl mb-2">Your Appointments</h2>
        <ul>
          {appointments.map((a) => (
            <li key={a.id} className="mb-2 p-3 border rounded">
              <div>When: {new Date(a.scheduled_at).toLocaleString()}</div>
              <div>Reason: {a.reason || '—'}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
