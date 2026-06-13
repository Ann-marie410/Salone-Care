"use client";

import { useState } from 'react';

const medicines = [
  { name: 'Paracetamol 500mg', price: 10, category: 'Pain Relief' },
  { name: 'ORS (Oral Rehydration Salts)', price: 10, category: 'Digestive' },
  { name: 'Zinc Tablets', price: 10, category: 'Supplements' },
  { name: 'Ibuprofen 400mg', price: 12, category: 'Pain Relief' },
  { name: 'Antacids', price: 12, category: 'Digestive' },
  { name: 'Chloroquine', price: 15, category: 'Malaria' },
  { name: 'Vitamin C Tablets', price: 15, category: 'Supplements' },
  { name: 'Amoxicillin 250mg', price: 20, category: 'Antibiotics' },
  { name: 'Cough Syrup (Simple)', price: 20, category: 'Cold & Cough' },
  { name: 'Malaria Rapid Test Kit', price: 25, category: 'Malaria' },
  { name: 'Multivitamins', price: 25, category: 'Supplements' },
];

const categories = [...new Set(medicines.map((m) => m.category))];

export default function PharmacyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = medicines.filter((m) => {
    const matchCategory = selectedCategory === 'All' || m.category === selectedCategory;
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-green-600 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">We Heath Pharmacy</h1>
          <p className="mt-2 opacity-90">Your trusted local pharmacy — affordable medicines, quality care.</p>
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span>📞 077578317</span>
            <span className="opacity-50">|</span>
            <span>📍 Freetown, Sierra Leone</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* About Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">About We Heath Pharmacy</h2>
          <p className="text-gray-600">
            We Heath Pharmacy is committed to providing safe, affordable medicines to the people of Sierra Leone.
            We stock a wide range of essential medicines, from pain relief to malaria treatment.
            Visit us or call <strong>077578317</strong> for prescriptions and health advice.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search medicines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Medicine List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-green-100 px-6 py-3 flex justify-between font-semibold text-green-800">
            <span className="flex-1">Medicine</span>
            <span className="w-24 text-right">Category</span>
            <span className="w-20 text-right">Price (NLE)</span>
          </div>
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No medicines found.</div>
          ) : (
            filtered.map((med, idx) => (
              <div
                key={idx}
                className="px-6 py-4 flex justify-between items-center border-t border-gray-100 hover:bg-green-50 transition"
              >
                <span className="flex-1 font-medium text-gray-800">{med.name}</span>
                <span className="w-24 text-right text-sm text-gray-500">{med.category}</span>
                <span className="w-20 text-right font-bold text-green-700">NLE {med.price}</span>
              </div>
            ))
          )}
          <div className="bg-gray-50 px-6 py-3 text-sm text-gray-500 border-t">
            Showing {filtered.length} of {medicines.length} medicines
          </div>
        </div>

        {/* Contact Card */}
        <div className="bg-green-100 rounded-lg p-6 mt-6 text-center">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Need a prescription filled?</h3>
          <p className="text-green-700 mb-3">Call or visit We Heath Pharmacy today</p>
          <a href="tel:077578317" className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            📞 Call 077578317
          </a>
        </div>
      </div>
    </div>
  );
}
