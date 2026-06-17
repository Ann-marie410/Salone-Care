"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Message = { id: string; sender_id: string; content: string; created_at: string };
type Conversation = { id: string; patient_id: string; doctor_id: string; profiles: { full_name: string; phone: string | null } | null };

export default function MessagingPage() {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [profileId, setProfileId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const uid = session.user.id;
      setUserId(uid);

      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const profile = res.ok ? await res.json() : null;
      if (profile) setProfileId(profile.id);

      const convRes = await fetch(`/api/conversations?patient_id=${uid}`);
      const convJson = await convRes.json();
      setConversations(convJson.data || []);
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

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Messages</h1>

      {conversations.length > 0 && (
        <div className="mb-4 flex gap-2 flex-wrap">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setConversationId(conv.id)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                conversationId === conv.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {conv.profiles?.full_name || 'Patient'}
            </button>
          ))}
        </div>
      )}

      {!conversationId ? (
        <div className="text-gray-500">
          {conversations.length === 0
            ? 'No conversations yet.'
            : 'Select a conversation to start messaging'}
        </div>
      ) : (
        <>
          <div className="border rounded mb-4 h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-3 p-2 bg-white rounded">
                <div className="text-sm text-gray-500">{msg.sender_id === profileId ? 'You' : 'Doctor'}</div>
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
