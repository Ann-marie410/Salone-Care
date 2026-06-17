"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  contact_type: string;
  description: string | null;
  is_active: boolean;
}

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/emergency-contacts');
        const json = await res.json();
        setContacts(json.data?.filter((c: EmergencyContact) => c.is_active) || []);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="text-white/80 hover:text-white text-sm mb-2 inline-block">&larr; Home</Link>
          <h1 className="text-3xl font-bold">🚨 Emergency Contacts</h1>
          <p className="mt-1 opacity-90">Quick access to emergency services in Sierra Leone</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <p className="text-gray-500 text-center py-12">Loading emergency contacts...</p>
        ) : contacts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-6xl mb-4">📞</p>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">National Emergency Numbers</h2>
            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex justify-between p-3 bg-red-50 rounded-lg"><span className="font-semibold">Police</span><span className="text-red-700 font-bold text-xl">119</span></div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg"><span className="font-semibold">Ambulance / Fire</span><span className="text-red-700 font-bold text-xl">117</span></div>
              <div className="flex justify-between p-3 bg-red-50 rounded-lg"><span className="font-semibold">Sierra Leone Emergency</span><span className="text-red-700 font-bold text-xl">112</span></div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div key={c.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
                <h3 className="text-xl font-bold text-gray-900">{c.name}</h3>
                <p className="text-2xl font-bold text-red-600 mt-2">{c.phone}</p>
                {c.description && <p className="text-sm text-gray-500 mt-1">{c.description}</p>}
                <span className="inline-block mt-2 text-xs font-semibold px-2 py-1 rounded bg-red-100 text-red-700 capitalize">{c.contact_type}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
