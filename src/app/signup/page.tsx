"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const { data, error } = await supabase.auth.signUp(
      { email, password },
      { data: { role } }
    );

    if (error) setMessage(error.message);
    else setMessage("Check your email for a confirmation link (if enabled).");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl mb-4">Sign up</h2>
        <label className="block mb-2">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-2 border" />
        <label className="block mb-2">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-3 p-2 border" />
        <label className="block mb-2">Role</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full mb-4 p-2 border">
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="pharmacy">Pharmacy</option>
        </select>
        <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded">Create account</button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}
