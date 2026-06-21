"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

type Doctor = { id: string; user_id: string; full_name: string; specialization: string; hospital_affiliation: string };
type Message = { id: string; sender_id: string; content: string; created_at: string };
type Conversation = { id: string; patient_id: string; doctor_id: string; profiles: { full_name: string; phone: string | null } | null };

function MessagingContent() {
  const searchParams = useSearchParams();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [startingDoctor, setStartingDoctor] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { setLoadingData(false); return; }

        const uid = session.user.id;
        setUserId(uid);

        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const profile = res.ok ? await res.json() : null;
        if (profile) setProfileId(profile.id);

        const [convRes, docRes] = await Promise.all([
          fetch(`/api/conversations?patient_id=${uid}`).catch(() => null),
          fetch('/api/doctors').catch(() => null),
        ]);

        if (convRes && convRes.ok) {
          const convJson = await convRes.json();
          setConversations(convJson.data || []);
        }
        if (docRes && docRes.ok) {
          const docJson = await docRes.json();
          setDoctors(docJson.data || []);
        }
      } catch {}
      setLoadingData(false);
    }

    init();
  }, []);

  useEffect(() => {
    if (!conversationId) return;
    async function fetchMessages() {
      const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
      const json = await res.json();
      setMessages(json.data || []);
    }
    fetchMessages();
  }, [conversationId]);

  useEffect(() => {
    const doctorId = searchParams.get('doctor_id');
    if (!doctorId || doctors.length === 0 || conversations.length === 0) return;
    const existing = conversations.find((c) => c.doctor_id === doctorId);
    if (existing) {
      setConversationId(existing.id);
    } else {
      startConversation(doctorId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, doctors, conversations]);

  async function startConversation(doctorId: string) {
    setStartingDoctor(doctorId);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patient_id: userId, doctor_id: doctorId }),
      });
      if (res.ok) {
        const conv = await res.json();
        setConversations((prev) => [conv.data, ...prev]);
        setConversationId(conv.data.id);
      }
    } catch {}
    setStartingDoctor(null);
  }

  async function deleteMessage(messageId: string) {
    if (!profileId) return;
    try {
      await fetch(`/api/messages?id=${messageId}&sender_id=${profileId}`, {
        method: 'DELETE',
      });
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {}
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!conversationId || !profileId || !input.trim()) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: profileId,
        content: input,
      }),
    });

    setInput('');
    const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
    const json = await res.json();
    setMessages(json.data || []);
  }

  function doctorFromConv(conv: Conversation): Doctor | undefined {
    return doctors.find((d) => d.id === conv.doctor_id);
  }

  function convForDoctor(doctorId: string): Conversation | undefined {
    return conversations.find((c) => c.doctor_id === doctorId);
  }

  const contactedDoctorIds = new Set(conversations.map((c) => c.doctor_id));
  const uncontactedDoctors = doctors.filter((d) => !contactedDoctorIds.has(d.id));

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4 font-bold">Messages</h1>

      <div className="mb-4 flex gap-2 flex-wrap">
        {conversations.map((conv) => {
          const doc = doctorFromConv(conv);
          return (
            <button
              key={conv.id}
              onClick={() => setConversationId(conv.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                conversationId === conv.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {doc?.full_name || 'Doctor'}
            </button>
          );
        })}
      </div>

      {uncontactedDoctors.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
            All Doctors
          </h2>
          <div className="space-y-2">
            {uncontactedDoctors.map((doc) => {
              const existing = convForDoctor(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => existing ? setConversationId(existing.id) : startConversation(doc.id)}
                  disabled={startingDoctor === doc.id}
                  className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition disabled:opacity-50"
                >
                  <div className="font-semibold text-gray-900">
                    Dr. {doc.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {doc.specialization} — {doc.hospital_affiliation}
                  </div>
                  {startingDoctor === doc.id && (
                    <div className="text-xs text-blue-600 mt-1">Starting conversation...</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {loadingData ? (
        <div className="text-gray-500">Loading...</div>
      ) : !conversationId ? (
        <div className="text-gray-500">
          {conversations.length === 0 && uncontactedDoctors.length === 0
            ? 'No doctors available.'
            : conversations.length > 0
              ? 'Select a conversation to start messaging'
              : 'Select a doctor to start messaging'}
        </div>
      ) : (
        <>
          <div className="border rounded mb-4 h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-3 p-2 bg-white rounded group">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{msg.sender_id === profileId ? 'You' : 'Doctor'}</div>
                  {msg.sender_id === profileId && (
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="text-xs text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div>{msg.content}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function MessagingPage() {
  return (
    <Suspense fallback={<div className="p-8 max-w-2xl mx-auto"><p className="text-gray-500">Loading...</p></div>}>
      <MessagingContent />
    </Suspense>
  );
}
