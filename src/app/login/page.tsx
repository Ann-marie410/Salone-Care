"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setMessage(error.message);
    else setMessage("Signed in successfully");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-white rounded shadow">
        <h2 className="text-2xl mb-4">Log in</h2>
        <label className="block mb-2">Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 p-2 border" />
        <label className="block mb-2">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-3 p-2 border" />
        <button type="submit" className="w-full py-2 bg-green-600 text-white rounded">Sign in</button>
        {message && <p className="mt-3 text-sm">{message}</p>}
      </form>
    </div>
  );
}
