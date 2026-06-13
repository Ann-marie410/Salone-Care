"use client";

import { useEffect, useState } from 'react';

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  contact_type: string;
  description: string;
};

export default function EmergencyPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);

  useEffect(() => {
    async function loadContacts() {
      const res = await fetch('/api/emergency-contacts');
      const json = await res.json();
      setContacts(json.data || []);
    }
    loadContacts();
  }, []);

  const emergencyNumber = contacts.find((c) => c.contact_type === 'emergency')?.phone || '117';

  return (
    <div className="min-h-screen bg-red-50">
      <div className="bg-red-600 text-white p-6">
        <h1 className="text-4xl font-bold">Emergency Services</h1>
        <p className="text-xl mt-2">Quick access to emergency help</p>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Big Emergency Call Button */}
        <div className="mb-8 text-center">
          <div className="inline-block bg-red-600 text-white p-8 rounded-full text-center">
            <p className="text-sm mb-2 opacity-90">Call Emergency Now</p>
            <p className="text-5xl font-bold">{emergencyNumber}</p>
          </div>
        </div>

        {/* Emergency Contacts List */}
        <div className="grid md:grid-cols-2 gap-6">
          {contacts.map((contact) => (
            <div key={contact.id} className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-bold mb-2">{contact.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{contact.description}</p>
              <a
                href={`tel:${contact.phone}`}
                className="inline-block bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
              >
                Call: {contact.phone}
              </a>
            </div>
          ))}
        </div>

        {/* What to do in Emergency */}
        <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mt-8 rounded">
          <h2 className="text-xl font-bold mb-3">What to do in an emergency:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Stay calm and assess the situation</li>
            <li>Call emergency services (117) immediately</li>
            <li>Provide clear information about location and symptoms</li>
            <li>Follow instructions from emergency responder</li>
            <li>Stay on the line until help arrives</li>
            <li>Have someone wait at the entrance to guide paramedics</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
