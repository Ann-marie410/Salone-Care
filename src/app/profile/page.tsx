"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, safeSignOut } from "../../lib/supabaseClient";
import Link from "next/link";

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  approval_status?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          const err = await res.json().catch(() => ({}));
          setMessage(err.error || 'Failed to load profile');
          setMessageType('error');
        }
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to load profile");
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    await safeSignOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">Profile not found</p>
          <Link href="/" className="text-blue-600 hover:underline">Go home</Link>
        </div>
      </div>
    );
  }

  const isApprovalPending = profile.role !== 'patient' && profile.approval_status === 'pending';
  const isApproved = profile.approval_status === 'approved' || profile.role === 'patient';
  const isRejected = profile.approval_status === 'rejected';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      {/* Decorative circles */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none"></div>

      <div className="max-w-2xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              My Profile
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg font-semibold"
            >
              Logout
            </button>
          </div>

          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Full Name</label>
              <p className="text-lg text-gray-900 font-medium">{profile.full_name}</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Account Type</label>
              <p className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </p>
            </div>

            {/* Approval Status */}
            {profile.role !== 'patient' && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Verification Status</label>
                {isApprovalPending && (
                  <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-yellow-800">Pending Approval</p>
                      <p className="text-sm text-yellow-700">Our admin team is reviewing your credentials. You&apos;ll receive an email once verified.</p>
                    </div>
                  </div>
                )}
                {isApproved && profile.role !== 'patient' && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-green-800">Approved</p>
                      <p className="text-sm text-green-700">Your account has been verified and is active.</p>
                    </div>
                  </div>
                )}
                {profile.role === 'doctor' && isApproved && (
                  <Link
                    href="/doctor/dashboard"
                    className="block w-full text-center px-4 py-3 mt-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg font-semibold"
                  >
                    Go to Doctor Dashboard
                  </Link>
                )}
                {profile.role === 'pharmacy' && isApproved && (
                  <Link
                    href="/pharmacy/dashboard"
                    className="block w-full text-center px-4 py-3 mt-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg font-semibold"
                  >
                    Go to Pharmacy Dashboard
                  </Link>
                )}
                {isRejected && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-800">Rejected</p>
                      <p className="text-sm text-red-700">Your application could not be approved. Please contact support for more information.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Phone */}
            {profile.phone && (
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">Phone</label>
                <p className="text-lg text-gray-900">{profile.phone}</p>
              </div>
            )}

            {/* User ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">User ID</label>
              <p className="text-sm text-gray-600 font-mono break-all bg-gray-50 p-3 rounded-lg">{profile.id}</p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">← Back to home</Link>
          </div>
        </div>

        {message && (
          <p className={`mt-4 p-4 rounded-lg ${
            messageType === 'error' 
              ? 'bg-red-100 text-red-700' 
              : 'bg-green-100 text-green-700'
          }`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
