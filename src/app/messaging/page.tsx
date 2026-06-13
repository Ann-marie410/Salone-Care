"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

type Message = { id: string; sender_id: string; content: string; created_at: string };

export default function MessagingPage() {
  const [conversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUser() {
      const user = await supabase.auth.getUser();
      const uid = user.data.user?.id;
      setUserId(uid || null);
    }
    loadUser();
  }, []);

  async function loadMessages() {
    if (!conversationId) return;
    const res = await fetch(`/api/messages?conversation_id=${conversationId}`);
    const json = await res.json();
    setMessages(json.data || []);
  }

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
    if (!conversationId || !userId || !input.trim()) return;

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: userId,
        content: input,
      }),
    });

    setInput('');
    loadMessages();
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl mb-4">Messages</h1>

      {!conversationId ? (
        <div className="text-gray-500">Select a conversation or start a new one</div>
      ) : (
        <>
          <div className="border rounded mb-4 h-96 overflow-y-auto p-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id} className="mb-3 p-2 bg-white rounded">
                <div className="text-sm text-gray-500">{msg.sender_id === userId ? 'You' : 'Doctor'}</div>
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
