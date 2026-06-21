"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

interface PendingApproval {
  id: string;
  full_name: string;
  email: string;
  role: string;
  phone?: string;
  created_at: string;
}

export default function AdminApprovalsPage() {
  const router = useRouter();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'error' | 'success'>('success');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          router.push('/login');
          return;
        }

        const res = await fetch('/api/admin/approvals', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.status === 403) {
          setMessage('You do not have permission to access this page');
          setMessageType('error');
          setTimeout(() => router.push('/'), 2000);
          return;
        }

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          setMessage(err.error || 'Failed to load approvals');
          setMessageType('error');
          return;
        }

        setIsAdmin(true);
        const data = await res.json();
        setApprovals(data.approvals || []);
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Failed to load approvals");
        setMessageType('error');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [router]);

  async function updateApproval(userId: string, userName: string, status: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ userId, status }),
      });

      if (res.ok) {
        setApprovals(approvals.filter(a => a.id !== userId));
        setMessage(`${userName} ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        setMessageType('success');
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage(err.error || `Failed to ${status}`);
        setMessageType('error');
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : `Failed to ${status}`);
      setMessageType('error');
    }
  }

  const handleApprove = async (userId: string, userName: string) => {
    if (!confirm(`Approve ${userName}?`)) return;
    await updateApproval(userId, userName, 'approved');
  };

  const handleReject = async (userId: string, userName: string) => {
    if (!confirm(`Reject ${userName}?`)) return;
    await updateApproval(userId, userName, 'rejected');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center">
        <p className="text-lg text-red-600">Unauthorized access</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            Admin Approvals
          </h1>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold">← Dashboard</Link>
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            messageType === 'error' 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        {approvals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-blue-100">
            <p className="text-gray-600 text-lg">No pending approvals</p>
          </div>
        ) : (
          <div className="space-y-4">
            {approvals.map((approval) => (
              <div key={approval.id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{approval.full_name}</h3>
                    <p className="text-gray-600">
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mt-2">
                        {approval.role.charAt(0).toUpperCase() + approval.role.slice(1)}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-2">Email: {approval.email}</p>
                    {approval.phone && <p className="text-sm text-gray-500">Phone: {approval.phone}</p>}
                    <p className="text-xs text-gray-400 mt-2">Applied: {new Date(approval.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(approval.id, approval.full_name)}
                      className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-semibold"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(approval.id, approval.full_name)}
                      className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-semibold"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
