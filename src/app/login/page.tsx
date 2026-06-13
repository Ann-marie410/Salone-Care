"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/appointments');
      }
    };
    checkAuth();
  }, [router]);

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
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        setMessageType('error');
      } else {
        setMessage("Signed in successfully! Redirecting...");
        setMessageType('success');
        setTimeout(() => {
          router.push('/appointments');
        }, 1500);
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

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">Don&apos;t have an account? <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold">Create one</Link></p>
          <p><Link href="/" className="text-xs text-gray-500 hover:text-gray-700">← Back to home</Link></p>
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
