'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';

export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();
  const auth = getAuth(app);
  const db = getFirestore(app);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // NEW Address fields (unit + street combined)
  const [address, setAddress] = useState<{
    street?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
  }>({});

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.guests, 0),
    [cart]
  );

  // ===============================================
  // 🚀 AUTO-FILL USER INFO FROM FIREBASE
  // ===============================================
  useEffect(() => {
    const loadUserInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) return;

      const data = snap.data();

      // Full Name
      const f = data.firstName || '';
      const l = data.lastName || '';
      setFullName(`${f} ${l}`.trim());

      // Phone
      setPhone(data.phone || '');

      // Address
      if (data.address) {
        setAddress({
          street: data.address.street || '',
          suburb: data.address.suburb || '',
          state: data.address.state || '',
          postcode: data.address.postcode || '',
        });
      }
    };

    loadUserInfo();
  }, []);

  // ===============================================
  // IF CART EMPTY
  // ===============================================
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">No items in cart</h1>
        <button
          onClick={() => router.push('/menu')}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
        >
          Go to Menu
        </button>
      </div>
    );
  }

  // ===============================================
  // FORM SUBMIT
  // ===============================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (
      !fullName ||
      !phone ||
      !address.street ||
      !address.suburb ||
      !address.state ||
      !address.postcode
    ) {
      alert('Please fill in Full Name, Phone, and all Address fields.');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert('Please login before placing an order.');
      router.push('/login');
      return;
    }

    setSaving(true);

    // Convert address into old single-line format
    const finalAddress = `${address.street}, ${address.suburb}, ${address.state} ${address.postcode}`;

    sessionStorage.setItem(
      'checkoutCustomer',
      JSON.stringify({
        fullName,
        phone,
        address: finalAddress,
        note,
      })
    );

    setTimeout(() => router.push('/checkout/payment'), 50);
  };

  // ===============================================
  // UI
  // ===============================================
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {/* ORDER SUMMARY */}
      <div className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-3">Order Summary</h2>

        <ul className="space-y-2 text-sm">
          {cart.map((item) => (
            <li key={item.id}>
              <strong>{item.name}</strong> — {item.guests} guests — $
              {(item.price * item.guests).toFixed(2)}
            </li>
          ))}
        </ul>

        <p className="mt-3 font-bold">Total: ${total.toFixed(2)}</p>
      </div>

      {/* CHECKOUT FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FULL NAME */}
        <div>
          <label className="block font-semibold mb-1">
            Full Name<span className="text-red-500">*</span>
          </label>
          <input
            className="border p-2 w-full rounded"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        {/* PHONE */}
        <div>
          <label className="block font-semibold mb-1">
            Phone Number<span className="text-red-500">*</span>
          </label>
          <input
            className="border p-2 w-full rounded"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. +61412345678"
          />
        </div>

        {/* ADDRESS */}
        <div>
          <label className="block font-semibold mb-1">
            Delivery / Event Address<span className="text-red-500">*</span>
          </label>

          <div className="grid md:grid-cols-2 gap-4 mb-2">
            <input
              className="border p-2 rounded w-full"
              placeholder="Unit / Street Address"
              value={address.street || ''}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, street: e.target.value }))
              }
            />

            <input
              className="border p-2 rounded w-full"
              placeholder="Suburb"
              value={address.suburb || ''}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, suburb: e.target.value }))
              }
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <select
              className="border p-2 rounded w-full"
              value={address.state || ''}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, state: e.target.value }))
              }
            >
              <option value="">State</option>
              <option value="NSW">NSW</option>
              <option value="VIC">VIC</option>
              <option value="QLD">QLD</option>
              <option value="SA">SA</option>
              <option value="WA">WA</option>
              <option value="TAS">TAS</option>
              <option value="ACT">ACT</option>
              <option value="NT">NT</option>
            </select>

            <input
              className="border p-2 rounded w-full"
              placeholder="Postcode"
              value={address.postcode || ''}
              maxLength={4}
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, postcode: e.target.value }))
              }
            />
          </div>
        </div>

        {/* NOTES */}
        <div>
          <label className="block font-semibold mb-1">Extra Notes (optional)</label>
          <textarea
            className="border p-2 w-full rounded"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Dietary restrictions, time, parking details..."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 w-full disabled:opacity-60"
        >
          {saving ? 'Processing…' : 'Proceed to Payment'}
        </button>
      </form>
    </div>
  );
}
