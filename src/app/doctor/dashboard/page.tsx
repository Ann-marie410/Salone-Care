"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

interface DoctorProfile {
  id: string;
  user_id: string;
  specialization: string;
  hospital_affiliation: string;
  bio: string | null;
  availability: Record<string, string[]> | null;
}

interface Appointment {
  id: string;
  patient_id: string;
  scheduled_at: string;
  status: string;
  reason: string | null;
  profiles: { full_name: string; phone: string | null } | null;
}

interface Conversation {
  id: string;
  patient_id: string;
  doctor_id: string;
  profiles: { full_name: string; phone: string | null } | null;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [msgInput, setMsgInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'availability' | 'messages'>('appointments');

  const [availability, setAvailability] = useState<Record<string, string[]>>({
    monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [],
  });
  const [saving, setSaving] = useState(false);
  const [availMsg, setAvailMsg] = useState<string | null>(null);

  const [specialization, setSpecialization] = useState('');
  const [hospitalAffiliation, setHospitalAffiliation] = useState('');
  const [bio, setBio] = useState('');

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/login'); return; }

      const uid = session.user.id;
      setUserId(uid);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (!profile || profile.role !== 'doctor') {
        router.push('/');
        return;
      }

      if (profile.approval_status !== 'approved') {
        router.push('/profile');
        return;
      }

      setProfileId(profile.id);

      const { data: docData } = await supabase
        .from('doctors')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (docData) {
        setDoctor(docData);
        setSpecialization(docData.specialization || '');
        setHospitalAffiliation(docData.hospital_affiliation || '');
        setBio(docData.bio || '');
        if (docData.availability) {
          setAvailability(docData.availability as Record<string, string[]>);
        }
        loadAppointments(docData.id);
        loadConversations(docData.id);
      }

      setLoading(false);
    };

    init();
  }, [router]);

  async function loadAppointments(doctorId: string) {
    const res = await fetch(`/api/appointments?doctor_id=${doctorId}`);
    const json = await res.json();
    setAppointments(json.data || []);
  }

  async function loadConversations(doctorId: string) {
    const res = await fetch(`/api/conversations?doctor_id=${doctorId}`);
    const json = await res.json();
    setConversations(json.data || []);
  }

  async function loadMessages(convId: string) {
    const res = await fetch(`/api/messages?conversation_id=${convId}`);
    const json = await res.json();
    setMessages(json.data || []);
  }

  function openConversation(convId: string) {
    setSelectedConv(convId);
    loadMessages(convId);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedConv || !msgInput.trim() || !profileId) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversation_id: selectedConv, sender_id: profileId, content: msgInput }),
    });
    setMsgInput('');
    loadMessages(selectedConv);
  }

  function toggleTimeSlot(day: string, slot: string) {
    setAvailability((prev) => {
      const slots = prev[day] || [];
      if (slots.includes(slot)) {
        return { ...prev, [day]: slots.filter((s) => s !== slot) };
      }
      return { ...prev, [day]: [...slots, slot].sort() };
    });
  }

  async function saveAvailability() {
    if (!doctor) return;
    setSaving(true);
    setAvailMsg(null);

    const res = await fetch('/api/doctor/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doctor_id: doctor.id, availability }),
    });

    if (res.ok) {
      setAvailMsg('Availability saved!');
    } else {
      setAvailMsg('Failed to save availability');
    }
    setSaving(false);
    setTimeout(() => setAvailMsg(null), 3000);
  }

  async function saveProfile() {
    if (!doctor) return;
    setSaving(true);

    const { error } = await supabase
      .from('doctors')
      .update({ specialization, hospital_affiliation: hospitalAffiliation, bio })
      .eq('id', doctor.id);

    if (!error) {
      setAvailMsg('Profile updated!');
    } else {
      setAvailMsg('Failed to update profile');
    }
    setSaving(false);
    setTimeout(() => setAvailMsg(null), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Doctor profile not found.</p>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Go home</button>
        </div>
      </div>
    );
  }

  const TIME_SLOTS = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00',
    '16:00-17:00',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
            <p className="mt-1 opacity-90">
              Dr. {doctor.specialization ? `${specialization || '...'}` : '...'} at {hospitalAffiliation || '...'}
            </p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="px-4 py-2 bg-white text-green-700 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Profile
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto flex">
          {([
            { key: 'appointments', label: 'Appointments' },
            { key: 'availability', label: 'Availability' },
            { key: 'messages', label: 'Messages' },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === tab.key
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500 text-lg">No appointments yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">
                          {apt.profiles?.full_name || 'Unknown Patient'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          📅 {new Date(apt.scheduled_at).toLocaleDateString('en-US', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        {apt.reason && (
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Reason:</strong> {apt.reason}
                          </p>
                        )}
                        {apt.profiles?.phone && (
                          <p className="text-sm text-gray-500 mt-1">📞 {apt.profiles.phone}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        apt.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div>
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text" value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="e.g. General Practitioner"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Hospital/Clinic</label>
                  <input
                    type="text" value={hospitalAffiliation}
                    onChange={(e) => setHospitalAffiliation(e.target.value)}
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    placeholder="e.g. Connaught Hospital"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600 resize-none"
                  rows={3}
                  placeholder="Brief description about yourself..."
                />
              </div>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekly Availability</h2>
              <p className="text-gray-500 text-sm mb-6">Select the time slots you are available for appointments.</p>

              <div className="space-y-4">
                {DAYS.map((day) => (
                  <div key={day} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-800 capitalize mb-3">{day}</h3>
                    <div className="flex flex-wrap gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const selected = (availability[day] || []).includes(slot);
                        return (
                          <button
                            key={slot}
                            onClick={() => toggleTimeSlot(day, slot)}
                            className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                              selected
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={saveAvailability}
                disabled={saving}
                className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
              >
                {saving ? 'Saving...' : 'Save Availability'}
              </button>

              {availMsg && (
                <p className="mt-3 text-sm text-green-600 font-medium">{availMsg}</p>
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white rounded-xl shadow">
              <div className="p-4 border-b">
                <h2 className="font-bold text-gray-900">Conversations</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-gray-500 text-sm">No conversations yet.</div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => openConversation(conv.id)}
                      className={`w-full text-left p-4 hover:bg-green-50 transition ${
                        selectedConv === conv.id ? 'bg-green-50 border-l-4 border-green-600' : ''
                      }`}
                    >
                      <p className="font-semibold text-gray-800">
                        {conv.profiles?.full_name || 'Patient'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {conv.profiles?.phone || ''}
                      </p>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-xl shadow flex flex-col">
              {!selectedConv ? (
                <div className="flex-1 flex items-center justify-center p-12">
                  <p className="text-gray-500">Select a conversation to start messaging</p>
                </div>
              ) : (
                <>
                  <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg max-w-sm ${
                            msg.sender_id === profileId
                              ? 'bg-green-600 text-white ml-auto rounded-br-none'
                              : 'bg-gray-100 text-gray-800 mr-auto rounded-bl-none'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.sender_id === profileId ? 'text-green-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
                    <input
                      type="text"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                    <button
                      type="submit"
                      disabled={!msgInput.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      Send
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
