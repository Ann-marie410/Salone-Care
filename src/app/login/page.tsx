"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, safeSignOut } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');

  const [existingSession, setExistingSession] = useState<{ email?: string; role?: string } | null>(null);

  async function getProfileForSession(): Promise<{ email?: string; role?: string } | null> {
    let session: import('@supabase/supabase-js').Session | null = null;
    try {
      const result = await supabase.auth.getSession();
      session = result.data?.session ?? null;
      if (!session) return null;
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) return { email: session.user?.email };
      const profile = await res.json();
      return { email: session.user?.email, role: profile.role };
    } catch {
      return { email: session?.user?.email };
    }
  }

  function routeByRole(role: string | undefined): string | null {
    switch (role) {
      case 'patient': return '/appointments';
      case 'doctor': return '/doctor/dashboard';
      case 'pharmacy': return '/pharmacy/dashboard';
      default: return null;
    }
  }

  async function checkApprovalAndRoute(): Promise<string | null> {
    let session;
    try {
      const data = await supabase.auth.getSession();
      session = data.data.session;
    } catch { return null; }
    if (!session) return null;

    let token = session.access_token;
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: session.refresh_token }),
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        await supabase.auth.setSession(refreshData);
        token = refreshData.access_token;
      } else {
        await safeSignOut();
        return null;
      }
    } catch {
      await safeSignOut();
      return null;
    }

    const res = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      await safeSignOut();
      return null;
    }

    const profile = await res.json();

    if ((profile.role === 'doctor' || profile.role === 'pharmacy') && profile.approval_status !== 'approved') {
      return 'pending';
    }

    return routeByRole(profile.role);
  }

  useEffect(() => {
    getProfileForSession().then((info) => {
      if (info) setExistingSession(info);
    });
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  async function handleSignOut() {
    await safeSignOut();
    setExistingSession(null);
    setMessage(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

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

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Invalid email or password');
        setMessageType('error');
        setLoading(false);
        return;
      }

      await supabase.auth.setSession(data);

      setExistingSession(null);

      const result = await checkApprovalAndRoute();
      if (result === 'pending') {
        setMessage("Your account is pending admin approval. You will be able to sign in once your credentials have been verified by our team.");
        setMessageType('error');
        await safeSignOut();
      } else if (result) {
        router.push(result);
      } else {
        setMessage('Unable to route to your dashboard');
        setMessageType('error');
        await safeSignOut();
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "An error occurred");
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4">
      {/* Decorative wave elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
      
      {/* SVG Wave - Optional decorative element */}
      <svg className="absolute bottom-0 left-0 w-full opacity-10" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,112C960,117,1056,107,1152,96C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill="#0066cc"></path>
      </svg>

      {/* Session banner */}
      {existingSession && (
        <div className="w-full max-w-md mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl relative z-10">
          <p className="text-sm text-yellow-800 font-medium">
            Already signed in{existingSession.email ? ` as ${existingSession.email}` : ''}
          </p>
          <div className="flex gap-2 mt-2">
            {routeByRole(existingSession.role) && (
              <button
                onClick={() => router.push(routeByRole(existingSession.role)!)}
                className="text-xs px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-semibold"
              >
                Go to Dashboard
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="text-xs px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl relative z-10 border border-blue-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-2">SaloneCare</h1>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to access your healthcare</p>
        </div>
        
        <div className="space-y-4">
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
              placeholder="Your password"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full mt-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-lg hover:shadow-xl"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">Create one</Link></p>
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
