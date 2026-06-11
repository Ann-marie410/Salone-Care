"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    
    // Validation
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
      const { data, error } = await supabase.auth.signUp(
        { email, password },
        { data: { role } }
      );

      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage("Sign up successful! Check your email for a confirmation link.");
        setMessageType('success');
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl mb-4">Sign up</h2>
        <label className="block mb-2">Email</label>
        <input 
          type="email"
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          disabled={loading}
          className="w-full mb-3 p-2 border rounded disabled:bg-gray-100" 
          placeholder="your@email.com"
        />
        <label className="block mb-2">Password</label>
        <input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          disabled={loading}
          className="w-full mb-3 p-2 border rounded disabled:bg-gray-100" 
          placeholder="At least 6 characters"
        />
        <label className="block mb-2">Role</label>
        <select 
          value={role} 
          onChange={(e) => setRole(e.target.value)} 
          disabled={loading}
          className="w-full mb-4 p-2 border rounded disabled:bg-gray-100"
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
        {message && (
          <p className={`mt-3 text-sm p-2 rounded ${
            messageType === 'error' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
