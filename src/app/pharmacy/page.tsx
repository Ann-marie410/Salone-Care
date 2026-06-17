"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

type Medicine = {
  id: string;
  pharmacy_id: string;
  name: string;
  generic_name: string | null;
  dosage_form: string | null;
  strength: string | null;
  price: number;
  in_stock: boolean;
  quantity: number | null;
};

type CartItem = {
  medicine: Medicine;
  qty: number;
};

const CART_KEY = 'salonecare_cart';

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export default function PharmacyPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutName, setCheckoutName] = useState('');
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutNote, setCheckoutNote] = useState('');
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    setCart(loadCart());
    fetch('/api/medicines')
      .then((r) => r.json())
      .then((d) => setMedicines(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { saveCart(cart); }, [cart]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    medicines.forEach((m) => {
      const c = m.generic_name || 'General';
      if (m.name.toLowerCase().includes('malaria')) cats.add('Malaria');
      else if (m.name.toLowerCase().includes('vitamin') || m.name.toLowerCase().includes('zinc') || m.name.toLowerCase().includes('multi')) cats.add('Supplements');
      else if (m.name.toLowerCase().includes('pain') || m.name.toLowerCase().includes('ibuprofen') || m.name.toLowerCase().includes('aspirin')) cats.add('Pain Relief');
      else if (m.name.toLowerCase().includes('cough') || m.name.toLowerCase().includes('cold')) cats.add('Cold & Cough');
      else if (m.name.toLowerCase().includes('antibiotic') || m.name.toLowerCase().includes('amoxicillin')) cats.add('Antibiotics');
      else if (m.name.toLowerCase().includes('ors') || m.name.toLowerCase().includes('antacid') || m.name.toLowerCase().includes('digest')) cats.add('Digestive');
      else cats.add('General');
    });
    return ['All', ...Array.from(cats).sort()];
  }, [medicines]);

  const filtered = useMemo(() => {
    let list = medicines.filter((m) => m.in_stock);
    if (selectedCategory !== 'All') {
      list = list.filter((m) => {
        const name = m.name.toLowerCase();
        const cat = selectedCategory.toLowerCase();
        if (cat === 'malaria') return name.includes('malaria') || name.includes('chloroquine');
        if (cat === 'supplements') return name.includes('vitamin') || name.includes('zinc') || name.includes('multi');
        if (cat === 'pain relief') return name.includes('pain') || name.includes('ibuprofen') || name.includes('aspirin');
        if (cat === 'cold & cough') return name.includes('cough') || name.includes('cold');
        if (cat === 'antibiotics') return name.includes('amoxicillin') || name.includes('antibiotic');
        if (cat === 'digestive') return name.includes('ors') || name.includes('antacid');
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.generic_name && m.generic_name.toLowerCase().includes(q)));
    }
    return list;
  }, [medicines, selectedCategory, searchQuery]);

  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.medicine.price * i.qty, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  function addToCart(medicine: Medicine) {
    setAddingId(medicine.id);
    setTimeout(() => setAddingId(null), 600);
    setCart((prev) => {
      const existing = prev.find((i) => i.medicine.id === medicine.id);
      if (existing) {
        return prev.map((i) => i.medicine.id === medicine.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { medicine, qty: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) => prev.map((i) => {
      if (i.medicine.id !== id) return i;
      const qty = Math.max(1, i.qty + delta);
      return { ...i, qty };
    }).filter((i) => i.qty > 0));
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((i) => i.medicine.id !== id));
  }

  async function placeOrder() {
    setOrderError(null);
    if (!checkoutName.trim() || !checkoutPhone.trim() || cart.length === 0) {
      setOrderError('Please fill in all required fields');
      return;
    }

    const pharmacyId = cart[0].medicine.pharmacy_id;
    if (!pharmacyId) {
      setOrderError('Pharmacy information missing for this medicine');
      return;
    }

    const totalAmount = cart.reduce((s, i) => s + i.medicine.price * i.qty, 0);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pharmacy_id: pharmacyId,
          customer_name: checkoutName.trim(),
          customer_phone: checkoutPhone.trim(),
          notes: checkoutNote.trim() || null,
          total_amount: totalAmount,
          delivery_type: deliveryType,
          delivery_address: deliveryType === 'delivery' ? deliveryAddress.trim() : null,
          items: cart.map((i) => ({
            medicine_id: i.medicine.id,
            medicine_name: i.medicine.name,
            price: i.medicine.price,
            quantity: i.qty,
          })),
        }),
      });

      const body = await res.json();

      if (!res.ok) {
        setOrderError(body.error || 'Failed to place order');
        return;
      }
    } catch (err) {
      setOrderError(err instanceof Error ? err.message : 'Failed to place order');
      return;
    }

    setOrderPlaced(true);
    setCart([]);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-100/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-[#0F6FFF] to-[#14B8A6] rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:shadow-md transition-shadow">SC</div>
              <span className="font-bold text-[#0F172A] text-lg tracking-tight">Salone<span className="text-[#0F6FFF]">Care</span></span>
            </Link>
            <div className="flex items-center gap-2">
              <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-xl hover:bg-gray-50 transition">
                <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#0F6FFF] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </button>
              <Link href="/login" className="text-sm text-[#64748B] hover:text-[#0F172A] font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition">Sign In</Link>
              <Link href="/signup" className="text-sm bg-[#0F6FFF] text-white px-5 py-2 rounded-xl hover:bg-[#0A5CD6] transition font-semibold shadow-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-[#0F172A]">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#14B8A6]/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-18 relative">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-5 border border-white/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              We Heath Pharmacy — Trusted Care
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-bold text-white leading-tight mb-3 tracking-tight">
              Medicines at Your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14B8A6] to-white">Fingertips</span>
            </h1>
            <p className="text-lg text-emerald-100/80 max-w-2xl mb-6">
              Browse our catalogue, add to cart, and order your medicines for pickup or delivery.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-100/70">
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg> 077578317</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> Freetown, Sierra Leone</span>
              <span className="flex items-center gap-1.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Open 08:00 – 17:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* SEARCH + FILTERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100/80 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicines by name or active ingredient..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all active:scale-[0.97] ${
                    selectedCategory === cat
                      ? 'bg-[#0F6FFF] text-white shadow-sm'
                      : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0F6FFF]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MEDICINES + CART LAYOUT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-10 bg-gray-200 rounded-xl w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <div className="text-5xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-2">No medicines found</h3>
            <p className="text-[#64748B]">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((med) => {
              const inCart = cart.find((i) => i.medicine.id === med.id);
              return (
                <div
                  key={med.id}
                  className={`group bg-white rounded-2xl p-4 sm:p-5 shadow-sm border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                    inCart ? 'border-[#0F6FFF]/30 ring-1 ring-[#0F6FFF]/10' : 'border-gray-100/80 hover:border-[#0F6FFF]/20'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-lg shadow-sm shrink-0">💊</div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#0F172A] truncate">{med.name}</h3>
                        {med.strength && <p className="text-xs text-[#64748B]">{med.strength}</p>}
                      </div>
                    </div>
                    <span className="shrink-0 text-lg font-bold text-[#0F6FFF]">NLE {med.price}</span>
                  </div>
                  {med.generic_name && (
                    <p className="text-xs text-[#94A3B8] mb-2 truncate">{med.generic_name}</p>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      {med.dosage_form || 'tablet'}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${med.in_stock && (med.quantity === null || med.quantity > 0) ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                      {med.in_stock && (med.quantity === null || med.quantity > 0) ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <button
                    onClick={() => addToCart(med)}
                    disabled={!med.in_stock}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.97] ${
                      addingId === med.id ? 'bg-emerald-500 text-white scale-[0.98]' :
                      inCart ? 'bg-[#E0F2FE] text-[#0F6FFF] hover:bg-[#BFDBFE]' :
                      'bg-[#0F6FFF] text-white hover:bg-[#0A5CD6] shadow-sm'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {addingId === med.id ? (
                      <>✓ Added</>
                    ) : inCart ? (
                      <>In Cart ({inCart.qty}) • Add More</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg> Add to Cart</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <p className="text-xs text-[#94A3B8] text-center mt-4">
            Showing {filtered.length} of {medicines.length} medicines
          </p>
        )}
      </section>

      {/* EMERGENCY BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-3xl p-6 sm:p-8">
          <div className="absolute inset-0">
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Need a Prescription Filled?</h3>
              <p className="text-emerald-100/80 text-sm">Call or visit We Heath Pharmacy — we're here to help</p>
            </div>
            <a href="tel:077578317" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-2xl font-bold hover:bg-emerald-50 transition shadow-xl active:scale-[0.97] shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              Call 077578317
            </a>
          </div>
        </div>
      </section>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
            {/* Cart header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                Your Cart
                {cartCount > 0 && <span className="text-sm font-normal text-[#64748B]">({cartCount} items)</span>}
              </h2>
              <button onClick={() => setCartOpen(false)} className="p-1.5 hover:bg-gray-50 rounded-lg transition">
                <svg className="w-5 h-5 text-[#64748B]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Cart items */}
            <div className={`${showCheckout ? 'hidden' : 'flex-1'} overflow-y-auto px-5 py-4 space-y-3`}>
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-3">🛒</div>
                  <p className="text-[#64748B] font-medium">Your cart is empty</p>
                  <p className="text-sm text-[#94A3B8]">Browse medicines and add them to your cart</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.medicine.id} className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-lg shrink-0">💊</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-[#0F172A] truncate">{item.medicine.name}</p>
                      <p className="text-xs text-[#0F6FFF] font-bold">NLE {item.medicine.price} × {item.qty}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.medicine.id, -1)} className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-sm font-semibold">−</button>
                      <span className="w-7 text-center text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => updateQty(item.medicine.id, 1)} className="w-7 h-7 bg-white rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition text-sm font-semibold">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.medicine.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && !showCheckout && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Total</span>
                  <span className="text-xl font-bold text-[#0F172A]">NLE {cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3 bg-[#0F6FFF] text-white rounded-2xl font-semibold hover:bg-[#0A5CD6] transition shadow-sm active:scale-[0.97]"
                >
                  Proceed to Order
                </button>
              </div>
            )}

            {/* Checkout form */}
            {showCheckout && !orderPlaced && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3 overflow-y-auto flex-1">
                <h3 className="font-bold text-[#0F172A] text-sm">Your Details</h3>
                {orderError && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{orderError}</p>
                )}
                <input
                  type="text"
                  value={checkoutName}
                  onChange={(e) => setCheckoutName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]"
                />
                <input
                  type="tel"
                  value={checkoutPhone}
                  onChange={(e) => setCheckoutPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF]"
                />
                {/* Delivery / Pickup */}
                <div>
                  <p className="text-xs font-semibold text-[#64748B] mb-2">Order Type</p>
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition ${
                      deliveryType === 'pickup' ? 'border-[#0F6FFF] bg-[#E0F2FE] text-[#0F6FFF]' : 'border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:border-gray-300'
                    }`}>
                      <input type="radio" name="deliveryType" value="pickup" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} className="sr-only" />
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      Pickup
                    </label>
                    <label className={`flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition ${
                      deliveryType === 'delivery' ? 'border-[#0F6FFF] bg-[#E0F2FE] text-[#0F6FFF]' : 'border-gray-200 bg-[#F8FAFC] text-[#64748B] hover:border-gray-300'
                    }`}>
                      <input type="radio" name="deliveryType" value="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} className="sr-only" />
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1m3-1h10a1 1 0 001-1V6a1 1 0 00-1-1H9a1 1 0 00-1 1v10" /></svg>
                      Delivery
                    </label>
                  </div>
                </div>
                {deliveryType === 'delivery' && (
                  <>
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Delivery address"
                      rows={2}
                      className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] resize-none"
                    />
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <p className="text-xs font-semibold text-blue-800 mb-1">Payment Required</p>
                      <p className="text-sm text-blue-700">Send payment to <strong className="text-blue-900">079812331</strong> via Orange Money or Afri Money</p>
                    </div>
                  </>
                )}
                <textarea
                  value={checkoutNote}
                  onChange={(e) => setCheckoutNote(e.target.value)}
                  placeholder="Additional notes (optional)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0F6FFF] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Total</span>
                  <span className="text-lg font-bold text-[#0F172A]">NLE {cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowCheckout(false)} className="flex-1 py-2.5 bg-gray-100 text-[#64748B] rounded-xl font-semibold hover:bg-gray-200 transition text-sm">
                    Back
                  </button>
                  <button
                    onClick={placeOrder}
                    disabled={!checkoutName.trim() || !checkoutPhone.trim()}
                    className="flex-[2] py-2.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-sm active:scale-[0.97] text-sm disabled:opacity-50"
                  >
                    Place Order
                  </button>
                </div>
              </div>
            )}

            {/* Order placed */}
            {orderPlaced && (
              <div className="border-t border-gray-100 px-5 py-8 text-center">
                <div className="text-5xl mb-3">✅</div>
                <h3 className="text-lg font-bold text-[#0F172A] mb-1">Order Placed!</h3>
                <p className="text-sm text-[#64748B] mb-1">We'll contact you at <strong>{checkoutPhone}</strong> to confirm.</p>
                <p className="text-xs text-[#94A3B8] mb-1 capitalize">{deliveryType === 'delivery' ? `Delivering to: ${deliveryAddress}` : 'Ready for pickup'}</p>
                <p className="text-xs text-[#94A3B8] mb-4">Order total: <strong>NLE {cartTotal.toFixed(2)}</strong></p>
                <button
                  onClick={() => { setOrderPlaced(false); setShowCheckout(false); setCheckoutName(''); setCheckoutPhone(''); setCheckoutNote(''); setDeliveryType('pickup'); setDeliveryAddress(''); setCartOpen(false); }}
                  className="px-6 py-2.5 bg-[#0F6FFF] text-white rounded-xl font-semibold hover:bg-[#0A5CD6] transition"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
