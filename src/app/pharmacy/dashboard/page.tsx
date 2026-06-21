"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import Link from "next/link";

interface OrderItem {
  id: string;
  medicine_name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  pharmacy_id: string;
  customer_name: string;
  customer_phone: string;
  notes: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export default function PharmacyDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pharmacyName, setPharmacyName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<{ pharmacyId?: string; ordersCount?: number; debugData?: string } | null>(null);

  async function loadOrders() {
    try {
      const res = await fetch('/api/orders');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || 'Failed to load orders');
        return;
      }
      const json = await res.json();
      const data = json.data || [];
      setOrders(data);
      setDebugInfo((prev) => ({ ...prev, ordersCount: data.length }));
      setError(null);
    } catch {
      setError('Failed to load orders');
    }
  }

  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) { router.push('/login'); return; }

      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const profile = res.ok ? await res.json() : null;

      if (!profile || profile.role !== 'pharmacy') {
        router.push('/');
        return;
      }

      if (profile.approval_status !== 'approved') {
        router.push('/profile');
        return;
      }

      const pharmRes = await fetch('/api/pharmacy/profile', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const pharmacy = pharmRes.ok ? await pharmRes.json() : null;

      if (pharmacy) {
        setPharmacyName(pharmacy.name);
        setDebugInfo({ pharmacyId: pharmacy.id });
        console.log('[PHARMACY DASHBOARD] Pharmacy ID:', pharmacy.id);
        await loadOrders();
        try {
          const debugRes = await fetch('/api/debug/orders');
          const debugJson = await debugRes.json();
          setDebugInfo((prev) => ({ ...prev, debugData: JSON.stringify(debugJson, null, 2) }));
        } catch {}
      } else {
        setError('Could not load pharmacy profile');
      }

      setLoading(false);
    } catch {
      router.push('/login');
    }
    };

    init();
  }, [router]);

  async function updateStatus(orderId: string, status: string) {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId, status }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  }

  async function deleteOrder(orderId: string) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;

    const res = await fetch('/api/orders', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    });

    if (res.ok) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  }

  const activeOrders = orders.filter((o) => o.status === 'pending');
  const completedOrders = orders.filter((o) => o.status === 'paid' || o.status === 'delivered');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);
  const pendingOrders = orders.filter((o) => o.status === 'pending').length;
  const paidOrders = orders.filter((o) => o.status === 'paid').length;
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <p className="text-lg text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      <div className="bg-gradient-to-r from-purple-700 to-purple-600 text-white p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{pharmacyName || 'Pharmacy'} Dashboard</h1>
            <p className="mt-1 opacity-90">Manage orders and track payments</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/pharmacy"
              className="px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Storefront
            </Link>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Profile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">NLE {totalRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Pending</p>
            <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Paid</p>
            <p className="text-3xl font-bold text-gray-900">{paidOrders}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm font-semibold mb-1">Delivered</p>
            <p className="text-3xl font-bold text-gray-900">{deliveredOrders}</p>
          </div>
        </div>

        {/* Debug info */}
        {debugInfo && (
          <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 font-mono">
            <p><strong>Your Pharmacy ID:</strong> {debugInfo.pharmacyId}</p>
            <p><strong>Orders found in dashboard:</strong> {debugInfo.ordersCount ?? 'loading...'}</p>
            {debugInfo.debugData && (
              <details>
                <summary className="cursor-pointer text-blue-600 hover:text-blue-800">Show full debug data</summary>
                <pre className="mt-2 p-2 bg-white border rounded max-h-96 overflow-auto whitespace-pre-wrap">{debugInfo.debugData}</pre>
              </details>
            )}
          </div>
        )}

        {/* Active Orders */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Active Orders</h2>
              <p className="text-sm text-gray-500 mt-1">Pending orders that need action</p>
            </div>
            <button
              onClick={loadOrders}
              className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-semibold hover:bg-purple-200 transition"
            >
              ↻ Refresh
            </button>
          </div>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          {activeOrders.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No active orders.</p>
              <p className="text-gray-400 text-sm mt-2">All orders have been processed.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeOrders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-5 hover:border-purple-300 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                          {order.customer_name[0]}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{order.customer_name}</h3>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-700">NLE {order.total_amount.toFixed(2)}</p>
                      <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>

                  {order.items.length > 0 && (
                    <div className="border-t border-gray-100 pt-3 mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.medicine_name} × {item.quantity}</span>
                            <span className="text-gray-800 font-medium">NLE {(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <p className="text-sm text-gray-500 mt-2 italic">Note: {order.notes}</p>
                  )}

                  <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => updateStatus(order.id, 'paid')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                    >
                      Mark as Paid
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'delivered')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      Mark as Delivered
                    </button>
                    <button
                      onClick={() => updateStatus(order.id, 'cancelled')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-red-100 hover:text-red-600 transition ml-auto"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
              <p className="text-sm text-gray-500 mt-1">Completed, paid, and delivered orders</p>
            </div>
          </div>
          {completedOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No completed orders yet.</p>
              <p className="text-gray-400 text-sm mt-2">When you mark an order as paid or delivered, it will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedOrders.map((order) => (
                <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:border-gray-300 transition bg-gray-50/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold shrink-0">
                        {order.customer_name[0]}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">{order.customer_name}</h3>
                        <p className="text-xs text-gray-500">{order.customer_phone}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-purple-700">NLE {order.total_amount.toFixed(2)}</p>
                      <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status === 'paid' ? 'Paid' : 'Delivered'}
                      </span>
                    </div>
                  </div>
                  {order.items.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {order.items.map((item) => (
                        <span key={item.id} className="mr-3">{item.medicine_name} × {item.quantity}</span>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg text-xs font-semibold hover:bg-red-100 hover:text-red-600 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
