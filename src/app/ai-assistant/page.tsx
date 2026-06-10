"use client";

import { useState } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Welcome to SaloneCare AI Health Assistant! I'm here to provide general health guidance and answer your questions about common health issues. 

**Important Disclaimer:** I cannot provide medical diagnosis or treatment. For medical emergencies or serious concerns, please contact a healthcare professional immediately.

What health question can I help you with today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      const json = await res.json();
      const assistantResponse = json.data?.response || 'Unable to process your request. Please try again.';
      const disclaimer = json.data?.disclaimer || '';

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${assistantResponse}\n\n*${disclaimer}*`,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col">
      <div className="bg-green-600 text-white p-6">
        <h1 className="text-3xl font-bold">SaloneCare AI Health Assistant</h1>
        <p className="text-sm mt-2 opacity-90">Get health guidance and answers to your health questions (not medical diagnosis)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 max-w-2xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-sm p-4 rounded ${
                msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-200 text-gray-800 p-4 rounded rounded-bl-none">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="border-t bg-white p-6">
        <form onSubmit={handleSend} className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me about health topics, symptoms, etc..."
            disabled={loading}
            className="flex-1 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            Send
          </button>
        </form>

        <div className="max-w-2xl mx-auto mt-4 text-xs text-gray-500 bg-yellow-50 p-3 rounded">
          <strong>⚠️ Important:</strong> This AI provides general health information only. It does not replace professional medical advice. For emergencies or serious health concerns, contact a doctor or call 117.
        </div>
      </div>
    </div>
  );
}
