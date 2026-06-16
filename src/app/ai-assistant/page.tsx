"use client";

import { useState, useRef, useEffect } from 'react';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hey there! 👋 I'm your SaloneCare Health Assistant.

I can help answer your health questions, give you info about hospitals and pharmacies in Sierra Leone, and offer general wellness tips.

**Just a heads up:** I'm an AI — I can't diagnose or prescribe, but I'll point you in the right direction. For emergencies, call **117** right away.

What's on your mind?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.slice(Math.max(1, messages.length - 6)).map(({ role, content }) => ({ role, content }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history }),
      });

      const json = await res.json();
      const text = json.data?.response || 'Hmm, I couldn\'t process that. Could you rephrase?';

      setMessages((prev) => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong on my end. Mind trying again?' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0FDF4] to-white flex flex-col">
      <div className="bg-gradient-to-r from-[#0F6FFF] to-[#14B8A6] text-white px-6 py-5 shadow-md">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-xl">💬</div>
            <div>
              <h1 className="text-xl font-bold">SaloneCare AI Assistant</h1>
              <p className="text-sm text-white/80">Ask me anything about health in Sierra Leone</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#0F6FFF] text-white rounded-br-md'
                    : 'bg-white text-[#0F172A] border border-gray-100 shadow-sm rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-[#0F172A] border border-gray-100 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t bg-white px-4 py-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything... (e.g., 'Where can I get malaria meds in Freetown?')"
            disabled={loading}
            className="flex-1 px-4 py-3 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-[#0F172A] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#0F6FFF] text-white rounded-xl font-semibold text-sm hover:bg-[#0A5CD6] transition disabled:opacity-50 shadow-sm"
          >
            Send
          </button>
        </form>

        <div className="max-w-3xl mx-auto mt-3 text-xs text-gray-500">
          ⚠️ This AI provides general health information only. Always consult a doctor for medical advice.
        </div>
      </div>
    </div>
  );
}
