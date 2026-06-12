"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!fullName.trim()) {
      setMessage("Full name is required");
      setMessageType('error');
      return;
    }
    if (!email.trim()) {
      setMessage("Email is required");
      setMessageType('error');
      return;
    }
    if (!password.trim()) {
      setMessage("Password is required");
      setMessageType('error');
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters");
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, role })
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Signup failed');
        setMessageType('error');
        return;
      }

      if (data.session) {
        await supabase.auth.setSession(data.session);
      }

      router.push('/appointments');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>

      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative z-10 border border-blue-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">SaloneCare</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600">Join us to access healthcare services</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-700">Account Type</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none disabled:bg-gray-100 transition"
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacy">Pharmacy</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">Sign in</Link></p>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-lg text-sm font-medium ${
            messageType === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
